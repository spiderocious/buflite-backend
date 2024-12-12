import config from '@/config';
import { PromptType } from '@/constants';
import { generateUUID } from '@/utils/idGenerator';
import { Request } from 'express';
import TrendsModel from '../models/mongodb/Trends';
import contentService from './core/ai/anthropic/anthropic.service';
import { CacheService } from './core/cache';

const DASHBOARD_CACHE_KEY = 'dashboard_data';
export class DashboardService {
  private static instance: DashboardService;
  private cacheService: typeof CacheService;

  private constructor() {
    this.cacheService = CacheService;
  }
  /**
   * Get singleton instance
   */
  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Get dashboard data from cache or database
   */
  public async getCachedDashboardData(): Promise<any> {
    const cachedData = this.cacheService.getFromCache<any>(DASHBOARD_CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }
    // if not from cache, fetch the last data from database
    const data = await TrendsModel.findOne({}, {}, { sort: { createdAt: -1 } });
    if (data) {
      this.cacheService.saveToCache(
        DASHBOARD_CACHE_KEY,
        {
          ...data,
          requestDate: new Date().toISOString(),
        },
        { expiresIn: 3600 }
      ); // Cache for 1 hour
      return data;
    }
    return null; // No data found
  }

  public async fetchTrendsData(req: Request): Promise<any> {
    // validate if dashboard has been fetched in the last 1 hour
      const cachedData = this.cacheService.getFromCache<any>(DASHBOARD_CACHE_KEY);
      
    if (cachedData) {
      const lastFetched = new Date(cachedData.requestDate);
      const now = new Date();
      const diffInHours = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);
      if (diffInHours < 1) {
        return {
          ...cachedData,
          cached: true,
          requestDate: lastFetched.toISOString(),
        }; // Return cached data if fetched within the last hour
      }
    }

    const data = await contentService.analyzeContent(req, 'dashboard', PromptType.DASHBOARD, {
      useTooling: true,
      cacheFirst: false,
    });
    if (data) {
      const parsedData = {
        ...data,
        cached: false,
        requestDate: new Date().toISOString(),
      };
      // Save to cache
      this.cacheService.saveToCache(DASHBOARD_CACHE_KEY, parsedData, { expiresIn: 36000 }); // Cache for 10 hours
      const trendData = {
        id: generateUUID(),
        data,
        modelName: config.ai.anthropic.model,
      };
      await TrendsModel.create(trendData);
      // Return the data
      return parsedData;
    }
    throw new Error('Failed to fetch trends data');
  }
}

export const dashboardService = DashboardService.getInstance();
export default dashboardService;
