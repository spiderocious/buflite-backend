import { cacheService } from './core/cache/cache.service';

/**
 * Trial Limit Service
 * Manages user trial limits for content analysis
 * Uses cache service for storage with 24-hour expiration
 */
export class TrialLimitService {
  private static instance: TrialLimitService;
  private cacheService: typeof cacheService;

  private constructor() {
    this.cacheService = cacheService;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TrialLimitService {
    if (!TrialLimitService.instance) {
      TrialLimitService.instance = new TrialLimitService();
    }
    return TrialLimitService.instance;
  }

  /**
   * Generate cache key for trial limits
   */
  private generateTrialKey(userId: string, contentType: string): string {
    return `${userId}-content-tries-${contentType}`;
  }

  /**
   * Check if user has exceeded trial limit
   */
  public checkLimit(userId: string, contentType: string): boolean {
    const trialLimit = Number(process.env.CONTENT_TRIAL_LIMIT) || 5;
    const currentCount = this.getCount(userId, contentType);
    
    return currentCount >= trialLimit;
  }

  /**
   * Get current trial count for user and content type
   */
  public getCount(userId: string, contentType: string): number {
    const key = this.generateTrialKey(userId, contentType);
    const cacheInfo = this.cacheService.getCacheInfo(key);
    
    return cacheInfo?.value || 0;
  }

  /**
   * Increment trial count for user and content type
   */
  public incrementCount(userId: string, contentType: string): void {
    const key = this.generateTrialKey(userId, contentType);
    const currentCount = this.getCount(userId, contentType);
    
    // Cache for 24 hours (86400 seconds)
    this.cacheService.saveToCache(key, currentCount + 1, {
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    });
  }

  /**
   * Reset trial count for user and content type (for testing or admin purposes)
   */
  public resetCount(userId: string, contentType: string): void {
    const key = this.generateTrialKey(userId, contentType);
    this.cacheService.deleteFromCache(key);
  }

  /**
   * Get trial limit from environment
   */
  public getTrialLimit(): number {
    return Number(process.env.CONTENT_TRIAL_LIMIT) || 5;
  }

  /**
   * Get remaining trials for user
   */
  public getRemainingTrials(userId: string, contentType: string): number {
    const limit = this.getTrialLimit();
    const currentCount = this.getCount(userId, contentType);
    
    return Math.max(0, limit - currentCount);
  }

  /**
   * Check if trials will reset soon (within next hour)
   */
  public getTimeUntilReset(userId: string, contentType: string): number | null {
    const key = this.generateTrialKey(userId, contentType);
    const cacheInfo = this.cacheService.getCacheInfo(key);
    
    if (!cacheInfo) {
      return null; // No trials recorded
    }

    // Calculate remaining TTL in milliseconds
    const currentTime = Date.now();
    const expiryTime = cacheInfo.created + (24 * 60 * 60 * 1000); // 24 hours from creation
    const timeUntilReset = expiryTime - currentTime;
    
    return Math.max(0, timeUntilReset);
  }
}

// Export singleton instance for easy use
export const trialLimitService = TrialLimitService.getInstance();
