import express from 'express';
import cors from 'cors';
import config from 'config';
import { router } from './routes';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { ApiError } from './utils/erros';
import passport from 'passport';
import pg from 'pg';
import cookieSession from 'cookie-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Load environment variables from .env file
dotenv.config();
const corsConfig = config.get('cors') || {};

const { name, version } = require('../package.json');

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user!);
});

passport.use(new GoogleStrategy({
  clientID: (config.get('google')! as any).clientID!,
  clientSecret: (config.get('google')! as any).clientSecret,
  callbackURL: (config.get('passport')! as any).callbackUrl
}, (accessToken, refreshToken, profile, done) => {
  // This callback will be called after successful authentication
  // For now, just return the profile
  return done(null, profile);
}));

// Postgres
const pool = new pg.Pool({
  connectionString: (config.get('postgres')! as any).connectionString,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err);
  }
  release();
});

app.use(passport.initialize());
app.use(passport.session());

// Prioritize environment variable PORT over config 
const port = process.env.PORT || config.get('port') || 4000;

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.use(router);

app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

process.on('SIGINT', async () => {
  await pool.end(); // Close all connections in pool
  console.log('Pool has ended');
  process.exit(0);
});

app.listen(port, ()  => {
  console.log(`==`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🚩 Project: ${name} (ver. ${version})`);
  console.log(`⚙️  Cors config ${JSON.stringify(corsConfig, null, 2)}`);
  console.log(`==`);
});

