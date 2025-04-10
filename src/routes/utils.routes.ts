/**
 * Utility Routes Module
 * Defines utility routes for server monitoring and diagnostics.
 */
import express from 'express';
import { healthCheck } from '../controllers/util.controller';

const utilsRouter = express.Router();

/**
 * Health Check Route
 * @route GET /utils/healthCheck - Returns server health status information
 */
utilsRouter.get('/healthCheck', healthCheck);

export { utilsRouter };