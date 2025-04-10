import { Request, Response } from "express";
import config from "config";

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Perform health check logic here
    // For example, check database connection, external services, etc.
    const healthStatus = {
      status: 'ok',
      timestamp: new Date(),
      environment: config
    };

    // Send the health status as a response
    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
}