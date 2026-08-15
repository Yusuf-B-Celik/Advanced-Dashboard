import axios from 'axios';

export interface HackerNewsStory {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  descendants?: number; // comments count
  domain?: string;
}

let cachedStories: HackerNewsStory[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class HackerNewsService {
  async getTopStories(limit: number = 15): Promise<HackerNewsStory[]> {
    const now = Date.now();
    if (cachedStories.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
      return cachedStories.slice(0, limit);
    }

    try {
      // 1. Fetch top story IDs
      const topIdsRes = await axios.get<number[]>('https://hacker-news.firebaseio.com/v0/topstories.json', {
        timeout: 5000
      });

      const ids = (topIdsRes.data || []).slice(0, limit);

      // 2. Fetch details in parallel
      const storyPromises = ids.map(async (id) => {
        try {
          const itemRes = await axios.get<any>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            timeout: 4000
          });
          const item = itemRes.data;
          if (!item || item.type !== 'story' || item.deleted || item.dead) return null;

          let domain = '';
          if (item.url) {
            try {
              domain = new URL(item.url).hostname.replace('www.', '');
            } catch {
              domain = '';
            }
          }

          return {
            id: item.id,
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            by: item.by || 'anonymous',
            score: item.score || 0,
            time: item.time ? item.time * 1000 : Date.now(),
            descendants: item.descendants || 0,
            domain
          } as HackerNewsStory;
        } catch {
          return null;
        }
      });

      const stories = (await Promise.all(storyPromises)).filter((s): s is HackerNewsStory => s !== null);

      if (stories.length > 0) {
        cachedStories = stories;
        lastFetchTime = now;
      }

      return stories;
    } catch (err: any) {
      console.warn('[HackerNewsService] Error fetching stories:', err.message);
      return cachedStories;
    }
  }
}

export const hackerNewsService = new HackerNewsService();
