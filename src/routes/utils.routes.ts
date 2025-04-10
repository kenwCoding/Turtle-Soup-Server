import express from 'express';
import { healthCheck } from '../controllers/util.controller';

const utilsRouter = express.Router();

utilsRouter.get('/healthCheck', healthCheck);

export { utilsRouter };