import express from 'express';
import { healthcheckRouter } from './healthcheck';

const routers = express.Router();

routers.use('/healthcheck', healthcheckRouter);

export { routers };