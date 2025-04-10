/**
 * Utility Controller Module
 * Provides utility endpoints for server monitoring and diagnostics.
 */
import { Request, Response } from "express";
import config from "config";

/**
 * Health check endpoint handler
 * Returns the current server status and timestamp
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON with status and timestamp information
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date(),
    };

    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
}