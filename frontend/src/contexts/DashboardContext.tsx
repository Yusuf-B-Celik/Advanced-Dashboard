import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  NewsItem, 
  FinanceItem, 
  SystemStats, 
  TaskItem, 
  NoteItem, 
  BookmarkItem, 
  HabitItem, 
  WidgetConfig, 
  UserSettings 
} from '../types';

export const INITIAL_WIDGETS: WidgetConfig[] = [
  { id: 'news-widget', type: 'news', title: 'Türk Basını & Son Dakika Haberler', icon: 'Newspaper', colSpan: 4, rowSpan: 2, visible: true, category: 'news', workspaces: ['all', 'genel', 'haberler'] },
  { id: 'ai-widget', type: 'ai', title: 'MiniMax-M3 Yapay Zeka Asistanı', icon: 'Bot', colSpan: 4, rowSpan: 2, visible: true, category: 'ai', workspaces: ['all', 'genel'] },
  { id: 'finance-widget', type: 'finance', title: 'Döviz, Altın & Kripto Takip', icon: 'TrendingUp', colSpan: 4, rowSpan: 1, visible: true, category: 'finance', workspaces: ['all', 'genel', 'haberler'] },
  { id: 'weather-widget', type: 'weather', title: 'Hava Durumu & Kalitesi', icon: 'CloudSun', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  { id: 'system-widget', type: 'system', title: 'Sistem Telemetrisi (CPU & RAM)', icon: 'Cpu', colSpan: 4, rowSpan: 1, visible: true, category: 'system', workspaces: ['all', 'sistem'] },
  { id: 'kanban-widget', type: 'kanban', title: 'Görev & Proje Panosu', icon: 'Kanban', colSpan: 4, rowSpan: 2, visible: true, category: 'productivity', workspaces: ['all', 'genel', 'odaklanma'] },
  { id: 'pomodoro-widget', type: 'pomodoro', title: 'Pomodoro & Odaklanma Sesleri', icon: 'Timer', colSpan: 3, rowSpan: 1, visible: true, category: 'productivity', workspaces: ['all', 'odaklanma'] },
  { id: 'notes-widget', type: 'notes', title: 'Markdown Not Defteri', icon: 'FileText', colSpan: 4, rowSpan: 1, visible: true, category: 'productivity', workspaces: ['all', 'genel', 'odaklanma'] },
  { id: 'radio-widget', type: 'radio', title: 'Lofi & Canlı Radyolar', icon: 'Radio', colSpan: 3, rowSpan: 1, visible: true, category: 'media', workspaces: ['all', 'odaklanma'] },
  { id: 'quick-tools-widget', type: 'quick-tools', title: 'Hızlı Araçlar (QR, Şifre, Hash)', icon: 'Wrench', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  { id: 'github-widget', type: 'github', title: 'GitHub Trend Projeler', icon: 'GitBranch', colSpan: 3, rowSpan: 1, visible: true, category: 'system', workspaces: ['all', 'sistem'] },
  { id: 'habit-widget', type: 'habit', title: 'Alışkanlık & Zinciri Kırma', icon: 'Flame', colSpan: 3, rowSpan: 1, visible: true, category: 'productivity', workspaces: ['all', 'odaklanma'] },
  { id: 'speeddial-widget', type: 'speeddial', title: 'Hızlı Başlatıcı & Bağlantılar', icon: 'Bookmark', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  { id: 'quote-widget', type: 'quote', title: 'Günün Sözü & İlham', icon: 'Quote', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  { id: 'clock-widget', type: 'clock', title: 'Saat & Takvim', icon: 'Clock', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  // New 10 Widgets
  { id: 'worldclock-widget', type: 'worldclock', title: 'Dünya Saatleri & Toplantı', icon: 'Globe', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  { id: 'hackernews-widget', type: 'hackernews', title: 'Hacker News & Tech Trends', icon: 'Newspaper', colSpan: 4, rowSpan: 1, visible: true, category: 'developer', workspaces: ['all', 'sistem'] },
  { id: 'cryptoheatmap-widget', type: 'cryptoheatmap', title: 'Kripto Isı Haritası & Portföy', icon: 'Flame', colSpan: 3, rowSpan: 1, visible: true, category: 'finance', workspaces: ['all', 'haberler'] },
  { id: 'uptime-widget', type: 'uptime', title: 'Servis & API Uptime Ping', icon: 'Activity', colSpan: 3, rowSpan: 1, visible: true, category: 'developer', workspaces: ['all', 'sistem'] },
  { id: 'expenses-widget', type: 'expenses', title: 'Bütçe & Harcama Takibi', icon: 'Wallet', colSpan: 3, rowSpan: 1, visible: true, category: 'finance', workspaces: ['all', 'genel'] },
  { id: 'snippets-widget', type: 'snippets', title: 'Snippet Vault (Kod Deposu)', icon: 'Code2', colSpan: 3, rowSpan: 1, visible: true, category: 'developer', workspaces: ['all', 'sistem'] },
  { id: 'breathe-widget', type: 'breathe', title: 'Nefes & Odaklanma Molası', icon: 'Wind', colSpan: 3, rowSpan: 1, visible: true, category: 'productivity', workspaces: ['all', 'odaklanma'] },
  { id: 'journal-widget', type: 'journal', title: 'Günün Mood & Günlüğü', icon: 'BookOpen', colSpan: 3, rowSpan: 1, visible: true, category: 'productivity', workspaces: ['all', 'odaklanma'] },
  { id: 'clipboard-widget', type: 'clipboard', title: 'Hızlı Taslak & Metin Araçları', icon: 'Clipboard', colSpan: 3, rowSpan: 1, visible: true, category: 'utilities', workspaces: ['all', 'genel'] },
  { id: 'network-widget', type: 'network', title: 'Ağ & İnternet Teşhis', icon: 'Wifi', colSpan: 3, rowSpan: 1, visible: true, category: 'system', workspaces: ['all', 'sistem'] },
  { id: 'websummarizer-widget', type: 'websummarizer', title: 'AI Web & Video Özetleyici', icon: 'Globe', colSpan: 4, rowSpan: 2, visible: true, category: 'ai', workspaces: ['all', 'genel', 'haberler'] },
];

interface DashboardContextType {
  widgets: WidgetConfig[];
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // View Mode: 'compact' (Glance cards) vs 'expanded' (Full cards)
  viewMode: 'compact' | 'expanded';
  setViewMode: (mode: 'compact' | 'expanded') => void;
  toggleViewMode: () => void;
  expandedWidgetId: string | null;
  setExpandedWidgetId: (id: string | null) => void;
  cycleWidgetSize: (widgetId: string) => void;
  isAIPanelOpen: boolean;
  setIsAIPanelOpen: (open: boolean) => void;
  toggleAIPanel: () => void;

  // News
  news: NewsItem[];
  newsLoading: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSource: string;
  setSelectedSource: (src: string) => void;
  refreshNews: () => Promise<void>;
  summarizeArticle: (article: NewsItem) => Promise<any>;
  generateRoundup: () => Promise<any>;
  savedNewsIds: string[];
  toggleSaveNews: (id: string) => void;

  // Finance
  finance: FinanceItem[];
  financeLoading: boolean;
  refreshFinance: () => Promise<void>;

  // System
  systemStats: SystemStats | null;
  systemLoading: boolean;

  // Tasks & Productivity
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: TaskItem['status']) => void;
  deleteTask: (id: string) => void;

  // Notes
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, partial: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;

  // Habits
  habits: HabitItem[];
  toggleHabitToday: (id: string) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'completedDates'>) => void;
  deleteHabit: (id: string) => void;

  // Bookmarks
  bookmarks: BookmarkItem[];
  addBookmark: (bm: Omit<BookmarkItem, 'id'>) => void;
  deleteBookmark: (id: string) => void;

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;

  // Widget Actions
  toggleWidgetVisibility: (id: string) => void;
  setWidgetColSpan: (id: string, span: number) => void;
  moveWidget: (fromIndex: number, toIndex: number) => void;
  resetLayout: () => void;
  applyPreset: (preset: 'all' | 'dev' | 'finance' | 'focus' | 'news') => void;
  isLayoutLocked: boolean;
  setIsLayoutLocked: (locked: boolean) => void;
  weatherCity: string;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    // 1. Try loading from dashboard_widgets_v4
    const saved = localStorage.getItem('dashboard_widgets_v4') || localStorage.getItem('dashboard_widgets_v3') || localStorage.getItem('dashboard_widgets_v2');
    if (saved) {
      try {
        const parsed: WidgetConfig[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Find any widgets in INITIAL_WIDGETS that are not in parsed
          const existingIds = new Set(parsed.map(w => w.id));
          const missing = INITIAL_WIDGETS.filter(w => !existingIds.has(w.id));
          
          if (missing.length > 0) {
            // Automatically merge missing widgets so user immediately gets all widgets
            const merged = [...parsed, ...missing];
            localStorage.setItem('dashboard_widgets_v4', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved widgets, resetting to INITIAL_WIDGETS', e);
      }
    }
    
    localStorage.setItem('dashboard_widgets_v4', JSON.stringify(INITIAL_WIDGETS));
    return INITIAL_WIDGETS;
  });

  const [activeWorkspace, setActiveWorkspace] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);
  
  // Default to 'compact' view mode as requested by user
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const toggleAIPanel = () => setIsAIPanelOpen(prev => !prev);

  const cycleWidgetSize = (widgetId: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== widgetId) return w;
      // Cycle: 2 -> 3 -> 4 -> 6 -> 8 -> 12 -> 2 (depending on context)
      const current = w.colSpan || 3;
      let next = 3;
      if (current === 2) next = 3;
      else if (current === 3) next = 4;
      else if (current === 4) next = 6;
      else if (current === 6) next = 8;
      else if (current === 8) next = 12;
      else next = 2;
      return { ...w, colSpan: next };
    }));
  };

  // Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('dashboard_settings');
    return saved ? JSON.parse(saved) : {
      minimaxApiKey: '',
      minimaxPlanType: 'token_plan',
      minimaxProtocol: 'anthropic',
      minimaxModel: 'MiniMax-M3',
      minimaxRegion: 'global',
      minimaxBaseUrl: '',
      minimaxGroupId: '',
      theme: 'midnight-glass',
      wallpaper: 'gradient-dark',
      refreshIntervalSeconds: 300,
      userName: 'Yusuf',
      weatherCity: 'İstanbul',
      viewMode: 'compact'
    };
  });

  // News State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedSource, setSelectedSource] = useState('Tümü');
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>([]);

  // Finance State
  const [finance, setFinance] = useState<FinanceItem[]>([]);
  const [financeLoading, setFinanceLoading] = useState(false);

  // System Stats
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);

  // Stored Data (Tasks, Notes, Habits, Bookmarks)
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Save widgets to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_widgets_v3', JSON.stringify(widgets));
  }, [widgets]);

  // Apply Theme to body
  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
    localStorage.setItem('dashboard_settings', JSON.stringify(settings));
  }, [settings]);

  // Load initial backend storage & data
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const res = await fetch('/api/storage');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.tasks) setTasks(json.data.tasks);
          if (json.data.notes) setNotes(json.data.notes);
          if (json.data.habits) setHabits(json.data.habits);
          if (json.data.bookmarks) setBookmarks(json.data.bookmarks);
          if (json.data.savedNewsIds) setSavedNewsIds(json.data.savedNewsIds);
          if (json.data.settings) {
            setSettings(prev => ({ ...prev, ...json.data.settings }));
          }
        }
      } catch (e) {
        console.warn('Backend storage fetch fallback:', e);
      }
    };
    loadBackendData();
    refreshNews();
    refreshFinance();
    fetchSystemStats();
  }, []);

  // Polling for news, finance and system stats
  useEffect(() => {
    const sysInterval = setInterval(fetchSystemStats, 4000);
    const finInterval = setInterval(refreshFinance, 45000);
    const newsInterval = setInterval(refreshNews, (settings.refreshIntervalSeconds || 300) * 1000);

    return () => {
      clearInterval(sysInterval);
      clearInterval(finInterval);
      clearInterval(newsInterval);
    };
  }, [settings.refreshIntervalSeconds]);

  // Synchronize state changes to backend storage
  const syncToBackend = async (data: any) => {
    try {
      await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  };

  const refreshNews = async () => {
    try {
      setNewsLoading(true);
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setNews(data.items);
      }
    } catch (e) {
      console.error('Failed to fetch news:', e);
    } finally {
      setNewsLoading(false);
    }
  };

  const refreshFinance = async () => {
    try {
      setFinanceLoading(true);
      const res = await fetch('/api/finance');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setFinance(data.items);
      }
    } catch (e) {
      console.error('Failed to fetch finance:', e);
    } finally {
      setFinanceLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      setSystemLoading(true);
      const res = await fetch('/api/system');
      const data = await res.json();
      if (data.success && data.stats) {
        setSystemStats(data.stats);
      }
    } catch (e) {
      // ignore poll error
    } finally {
      setSystemLoading(false);
    }
  };

  const summarizeArticle = async (article: NewsItem) => {
    try {
      const res = await fetch('/api/ai/summarize-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          source: article.source,
          articleId: article.id,
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel || 'MiniMax-M3',
          planType: settings.minimaxPlanType || 'token_plan',
          apiProtocol: settings.minimaxProtocol || 'anthropic',
          region: settings.minimaxRegion || 'global',
          customBaseUrl: settings.minimaxBaseUrl,
          groupId: settings.minimaxGroupId
        })
      });
      const data = await res.json();
      if (data.success && data.summary) {
        // Update local news state with AI summary
        setNews(prev => prev.map(n => n.id === article.id ? { ...n, aiSummary: data.summary } : n));
        return data.summary;
      }
      throw new Error(data.error || 'Özetleme yapılamadı.');
    } catch (err: any) {
      console.error('AI Summarize error:', err);
      throw err;
    }
  };

  const generateRoundup = async () => {
    try {
      const res = await fetch('/api/ai/roundup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.minimaxApiKey,
          model: settings.minimaxModel || 'MiniMax-M3',
          planType: settings.minimaxPlanType || 'token_plan',
          apiProtocol: settings.minimaxProtocol || 'anthropic',
          region: settings.minimaxRegion || 'global',
          customBaseUrl: settings.minimaxBaseUrl,
          groupId: settings.minimaxGroupId
        })
      });
      const data = await res.json();
      if (data.success && data.roundup) {
        return data.roundup;
      }
      throw new Error(data.error || 'Gündem özeti oluşturulamadı.');
    } catch (err: any) {
      console.error('AI Roundup error:', err);
      throw err;
    }
  };

  const toggleSaveNews = (id: string) => {
    const updated = savedNewsIds.includes(id) 
      ? savedNewsIds.filter(i => i !== id) 
      : [...savedNewsIds, id];
    setSavedNewsIds(updated);
    syncToBackend({ savedNewsIds: updated });
  };

  // Task Handlers
  const addTask = (task: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...task,
      id: 'task_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    syncToBackend({ tasks: updated });
  };

  const updateTaskStatus = (id: string, status: TaskItem['status']) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    setTasks(updated);
    syncToBackend({ tasks: updated });
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    syncToBackend({ tasks: updated });
  };

  // Note Handlers
  const addNote = (note: Omit<NoteItem, 'id' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: 'note_' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    syncToBackend({ notes: updated });
  };

  const updateNote = (id: string, partial: Partial<NoteItem>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...partial, updatedAt: new Date().toISOString() } : n);
    setNotes(updated);
    syncToBackend({ notes: updated });
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    syncToBackend({ notes: updated });
  };

  // Habit Handlers
  const toggleHabitToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const completed = h.completedDates.includes(today);
      return {
        ...h,
        completedDates: completed 
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today]
      };
    });
    setHabits(updated);
    syncToBackend({ habits: updated });
  };

  const addHabit = (habit: Omit<HabitItem, 'id' | 'completedDates'>) => {
    const newHabit: HabitItem = {
      ...habit,
      id: 'habit_' + Date.now(),
      completedDates: []
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    syncToBackend({ habits: updated });
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    syncToBackend({ habits: updated });
  };

  // Bookmark Handlers
  const addBookmark = (bm: Omit<BookmarkItem, 'id'>) => {
    const newBm: BookmarkItem = {
      ...bm,
      id: 'bm_' + Date.now()
    };
    const updated = [...bookmarks, newBm];
    setBookmarks(updated);
    syncToBackend({ bookmarks: updated });
  };

  const deleteBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    syncToBackend({ bookmarks: updated });
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    syncToBackend({ settings: updated });
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const setWidgetColSpan = (id: string, span: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, colSpan: span } : w));
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    setWidgets(prev => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const resetLayout = () => {
    setWidgets(INITIAL_WIDGETS);
    localStorage.removeItem('dashboard_widgets_v2');
    localStorage.removeItem('dashboard_widgets_v3');
    localStorage.removeItem('dashboard_widgets_v4');
  };

  const applyPreset = (preset: 'all' | 'dev' | 'finance' | 'focus' | 'news') => {
    if (preset === 'all') {
      setActiveWorkspace('all');
      setWidgets(prev => prev.map(w => ({ ...w, visible: true })));
      return;
    }

    if (preset === 'dev') {
      setActiveWorkspace('sistem');
      const devIds = new Set(['system-widget', 'uptime-widget', 'snippets-widget', 'github-widget', 'hackernews-widget', 'network-widget', 'quick-tools-widget', 'ai-widget']);
      setWidgets(prev => prev.map(w => ({ ...w, visible: devIds.has(w.id) })));
      return;
    }

    if (preset === 'finance') {
      setActiveWorkspace('haberler');
      const finIds = new Set(['finance-widget', 'cryptoheatmap-widget', 'expenses-widget', 'news-widget', 'worldclock-widget', 'quick-tools-widget', 'ai-widget']);
      setWidgets(prev => prev.map(w => ({ ...w, visible: finIds.has(w.id) })));
      return;
    }

    if (preset === 'focus') {
      setActiveWorkspace('odaklanma');
      const focusIds = new Set(['pomodoro-widget', 'radio-widget', 'kanban-widget', 'breathe-widget', 'journal-widget', 'notes-widget', 'habit-widget']);
      setWidgets(prev => prev.map(w => ({ ...w, visible: focusIds.has(w.id) })));
      return;
    }

    if (preset === 'news') {
      setActiveWorkspace('haberler');
      const newsIds = new Set(['news-widget', 'websummarizer-widget', 'ai-widget', 'quote-widget', 'weather-widget', 'finance-widget']);
      setWidgets(prev => prev.map(w => ({ ...w, visible: newsIds.has(w.id) })));
      return;
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'compact' ? 'expanded' : 'compact');
  };

  return (
    <DashboardContext.Provider value={{
      widgets,
      activeWorkspace,
      setActiveWorkspace,
      searchQuery,
      setSearchQuery,
      viewMode,
      setViewMode,
      toggleViewMode,
      expandedWidgetId,
      setExpandedWidgetId,
      cycleWidgetSize,
      isAIPanelOpen,
      setIsAIPanelOpen,
      toggleAIPanel,
      news,
      newsLoading,
      selectedCategory,
      setSelectedCategory,
      selectedSource,
      setSelectedSource,
      refreshNews,
      summarizeArticle,
      generateRoundup,
      savedNewsIds,
      toggleSaveNews,
      finance,
      financeLoading,
      refreshFinance,
      systemStats,
      systemLoading,
      tasks,
      addTask,
      updateTaskStatus,
      deleteTask,
      notes,
      addNote,
      updateNote,
      deleteNote,
      habits,
      toggleHabitToday,
      addHabit,
      deleteHabit,
      bookmarks,
      addBookmark,
      deleteBookmark,
      settings,
      updateSettings,
      toggleWidgetVisibility,
      setWidgetColSpan,
      moveWidget,
      resetLayout,
      applyPreset,
      isLayoutLocked,
      setIsLayoutLocked,
      weatherCity: settings.weatherCity || 'İstanbul'
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
