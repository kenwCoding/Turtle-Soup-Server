import pg from 'pg';

declare global {
  namespace Express {
    interface Request {
      pool: pg.Pool;
      passport: any;
    }
  }
}