import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';
import { ErrorResponse, SuccessResponse } from '../utils/response';
import logger from '../utils/logger';

export async function getDashboardData(req: Request, res: Response) {
  try {
    // Fetch cached dashboard data
    const data = await dashboardService.getCachedDashboardData();
    if (data) {
      return SuccessResponse(res, 'Dashboard data fetched successfully', data);
    } else {
      return ErrorResponse(res, 'No dashboard data available');
    }
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    return ErrorResponse(res, 'Failed to fetch dashboard data');
  }
}

export async function fetchDashboardTrends(req: Request, res: Response) {
  try {
    // Fetch trends data from the AI service
    const trendsData = await dashboardService.fetchTrendsData(req);
    return SuccessResponse(res, 'Dashboard trends fetched successfully', trendsData);
  } catch (error) {
    logger.error('Error fetching dashboard trends:', error);
    return ErrorResponse(res, 'Failed to fetch dashboard trends');
  }
}
