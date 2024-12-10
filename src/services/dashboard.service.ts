import { CacheService } from "./core/cache";

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
    public async getDashboardData(): Promise<any> { 
        const key = `dashboard_data`;
        const cachedData = this.cacheService.getFromCache<any>(key);
        if (cachedData) {
            return cachedData;
        }
    }

    
}

export const dashboardService = DashboardService.getInstance();
export default dashboardService;