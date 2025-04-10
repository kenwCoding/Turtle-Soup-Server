import express, { Router } from 'express';
import { utilsRouter } from './utils.routes';
import { authRouter } from './auth.routes';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/utils',
    route: utilsRouter,
  },
  {
    path: '/auth',
    route: authRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export { router };