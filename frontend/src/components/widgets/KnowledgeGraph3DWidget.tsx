import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Network, 
  Search, 
  Sparkles, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Tag, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  Newspaper,
  X,
  Compass,
  Info
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';

interface GraphNode {
  id: string;
  title: string;
  category: 'note' | 'task' | 'finance' | 'news' | 'habit' | 'research';
  tags: string[];
  content?: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

const CATEGORY_COLORS: Record<GraphNode['category'], number> = {
  note: 0xa855f7,     // Purple
  task: 0x3b82f6,     // Blue
  finance: 0x10b981,  // Emerald
  news: 0xf43f5e,     // Rose
  habit: 0xf59e0b,    // Amber
  research: 0x06b6d4  // Cyan
};

export const KnowledgeGraph3DWidget: React.FC = () => {
  const { notes, tasks, news, habits, finance } = useDashboard();
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Extract all nodes from dashboard data
  const rawNodes: GraphNode[] = useMemo(() => {
    const list: GraphNode[] = [];

    // Notes
    notes.forEach((n, idx) => {
      list.push({
        id: `note-${n.id}`,
        title: n.title,
        category: 'note',
        tags: n.tags || [n.category || 'Genel'],
        content: n.content,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        z: (Math.random() - 0.5) * 120,
        vx: 0,
        vy: 0,
        vz: 0
      });
    });

    // Tasks
    tasks.forEach(t => {
      list.push({
        id: `task-${t.id}`,
        title: t.title,
        category: 'task',
        tags: t.tags || [t.status, t.priority],
        content: `Öncelik: ${t.priority} | Durum: ${t.status}`,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        z: (Math.random() - 0.5) * 120,
        vx: 0,
        vy: 0,
        vz: 0
      });
    });

    // Top news
    news.slice(0, 12).forEach(n => {
      list.push({
        id: `news-${n.id}`,
        title: n.title,
        category: 'news',
        tags: [n.category, n.source],
        content: n.snippet,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        z: (Math.random() - 0.5) * 120,
        vx: 0,
        vy: 0,
        vz: 0
      });
    });

    // Habits
    habits.forEach(h => {
      list.push({
        id: `habit-${h.id}`,
        title: h.name,
        category: 'habit',
        tags: ['Alışkanlık', `${h.completedDates?.length || 0} gün`],
        content: `Haftalık Hedef: ${h.targetDaysPerWeek || 7} gün`,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        z: (Math.random() - 0.5) * 120,
        vx: 0,
        vy: 0,
        vz: 0
      });
    });

    // Central Anchor Nodes
    list.push(
      { id: 'hub-ai', title: '🧠 Yapay Zeka & Sentez', category: 'research', tags: ['Merkez', 'AI'], x: 0, y: 15, z: 0, vx: 0, vy: 0, vz: 0 },
      { id: 'hub-life', title: '💼 Üretkenlik & Odak', category: 'task', tags: ['Merkez', 'Verimlilik'], x: -20, y: -10, z: 15, vx: 0, vy: 0, vz: 0 },
      { id: 'hub-market', title: '📈 Finans & Ekonomi', category: 'finance', tags: ['Merkez', 'Piyasa'], x: 25, y: -15, z: -10, vx: 0, vy: 0, vz: 0 }
    );

    return list;
  }, [notes, tasks, news, habits]);

  // Compute semantic links
  const links: GraphLink[] = useMemo(() => {
    const list: GraphLink[] = [];
    for (let i = 0; i < rawNodes.length; i++) {
      for (let j = i + 1; j < rawNodes.length; j++) {
        const a = rawNodes[i];
        const b = rawNodes[j];

        // Shared category or shared tag match
        const sharedTags = a.tags.some(t => b.tags.includes(t));
        const sameCategory = a.category === b.category;
        const isHubConnected = a.id.startsWith('hub-') || b.id.startsWith('hub-');

        if (sharedTags || (sameCategory && Math.random() > 0.6) || isHubConnected) {
          list.push({
            source: a.id,
            target: b.id,
            strength: isHubConnected ? 0.8 : sharedTags ? 0.6 : 0.3
          });
        }
      }
    }
    return list;
  }, [rawNodes]);

  // 3D WebGL Canvas Scene Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050814, 0.005);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 160;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 2, 200);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    // Create 3D Meshes for Nodes
    const nodeMeshes = new Map<string, THREE.Mesh>();
    const nodeGroup = new THREE.Group();

    rawNodes.forEach(node => {
      const radius = node.id.startsWith('hub-') ? 4.5 : 2.5;
      const color = CATEGORY_COLORS[node.category] || 0x00ffff;
      
      const geom = new THREE.SphereGeometry(radius, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: node.id.startsWith('hub-') ? 0.6 : 0.3,
        roughness: 0.3,
        metalness: 0.8
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(node.x, node.y, node.z);
      (mesh as any).nodeData = node;
      nodeMeshes.set(node.id, mesh);
      nodeGroup.add(mesh);
    });
    scene.add(nodeGroup);

    // Create Line Segments for Links
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25
    });

    const linePositions = new Float32Array(links.length * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Particle Starfield Background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x00f3ff, size: 1.2, transparent: true, opacity: 0.4 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Simple Force-Directed Physics Step
    const runPhysics = () => {
      // Repulsion between nodes
      for (let i = 0; i < rawNodes.length; i++) {
        for (let j = i + 1; j < rawNodes.length; j++) {
          const a = rawNodes[i];
          const b = rawNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const distSq = dx * dx + dy * dy + dz * dz + 0.1;
          const force = 30 / distSq;
          a.vx -= dx * force * 0.05;
          a.vy -= dy * force * 0.05;
          a.vz -= dz * force * 0.05;
          b.vx += dx * force * 0.05;
          b.vy += dy * force * 0.05;
          b.vz += dz * force * 0.05;
        }
      }

      // Spring Attraction along links
      links.forEach(l => {
        const a = rawNodes.find(n => n.id === l.source);
        const b = rawNodes.find(n => n.id === l.target);
        if (a && b) {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          a.vx += dx * 0.001 * l.strength;
          a.vy += dy * 0.001 * l.strength;
          a.vz += dz * 0.001 * l.strength;
          b.vx -= dx * 0.001 * l.strength;
          b.vy -= dy * 0.001 * l.strength;
          b.vz -= dz * 0.001 * l.strength;
        }
      });

      // Gravity towards center & friction damping
      rawNodes.forEach(n => {
        n.vx -= n.x * 0.002;
        n.vy -= n.y * 0.002;
        n.vz -= n.z * 0.002;

        n.vx *= 0.92;
        n.vy *= 0.92;
        n.vz *= 0.92;

        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        const mesh = nodeMeshes.get(n.id);
        if (mesh) {
          mesh.position.set(n.x, n.y, n.z);
        }
      });

      // Update link positions
      const positions = lineGeometry.attributes.position.array as Float32Array;
      let pIdx = 0;
      links.forEach(l => {
        const a = rawNodes.find(n => n.id === l.source);
        const b = rawNodes.find(n => n.id === l.target);
        if (a && b) {
          positions[pIdx++] = a.x;
          positions[pIdx++] = a.y;
          positions[pIdx++] = a.z;
          positions[pIdx++] = b.x;
          positions[pIdx++] = b.y;
          positions[pIdx++] = b.z;
        }
      });
      lineGeometry.attributes.position.needsUpdate = true;
    };

    // Interaction controls: Mouse Orbit & Raycasting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0;
    let rotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        rotY += dx * 0.005;
        rotX += dy * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(50, Math.min(300, camera.position.z + e.deltaY * 0.15));
    };

    // Raycast on Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(nodeMeshes.values()));

      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        if (hit.nodeData) {
          setSelectedNode(hit.nodeData);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      runPhysics();

      // Auto slow rotation if not dragging
      if (!isDragging) {
        rotY += 0.0015;
      }

      nodeGroup.rotation.x = rotX;
      nodeGroup.rotation.y = rotY;
      lineSegments.rotation.x = rotX;
      lineSegments.rotation.y = rotY;
      stars.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [rawNodes, links]);

  // Filtered nodes based on search
  const searchMatchedNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return rawNodes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [searchQuery, rawNodes]);

  return (
    <div className={`flex flex-col h-full space-y-2 relative select-none ${isFullScreen ? 'fixed inset-0 z-50 p-6 bg-black/95 backdrop-blur-2xl' : ''}`}>
      {/* Top Header & Search Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="relative w-36 sm:w-48">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Düğüm / Konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400">
            {rawNodes.length} Düğüm • {links.length} Bağ
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
            title={isFullScreen ? 'Küçült' : 'Tam Ekran 3D Evren'}
          >
            {isFullScreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full min-h-[220px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060814] via-[#080d21] to-[#04060f] border border-cyan-500/20 relative shadow-inner cursor-grab active:cursor-grabbing"
      >
        {/* Helper Hint */}
        <div className="absolute top-2 left-2 pointer-events-none text-[10px] text-gray-400/80 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5 backdrop-blur-sm flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>Döndürmek için sürükleyin • Yaklaşmak için kaydırın • Düğüme tıklayın</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 pointer-events-none flex flex-wrap gap-1.5 text-[9px] font-semibold">
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">🟣 Notlar</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">🔵 Görevler</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">🔴 Haberler</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 Finans</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🟡 AI & Araştırma</span>
        </div>
      </div>

      {/* Node Detail Popup Drawer */}
      {selectedNode && (
        <div className="absolute bottom-3 right-3 max-w-xs w-full p-4 rounded-2xl glass-panel border border-cyan-500/40 shadow-2xl z-20 animate-in zoom-in-95 space-y-2 bg-black/85 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 uppercase">
                {selectedNode.category}
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-2">
                {selectedNode.title}
              </h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedNode.content && (
            <p className="text-[11px] text-gray-300 line-clamp-3 bg-white/5 p-2 rounded-xl border border-white/5">
              {selectedNode.content}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {selectedNode.tags.map((t, idx) => (
              <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
