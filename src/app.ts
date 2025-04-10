import express from 'express';
import cors from 'cors';
import config from 'config';
import { router } from './routes';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { ApiError } from './utils/erros';
import passport from 'passport';
import pg from 'pg';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
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
const PgSessionStore = connectPgSimple(session);

app.use(
  session({
    store: new PgSessionStore({
      pool: pool as any, // Use existing Postgres pool
      tableName: 'session', // Default table name
    }),
    secret: (config.get('session')! as any).secret, // Use a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV !== 'dev', // HTTPS in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'dev' ? 'none' : 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const users = new Map();
passport.serializeUser((user, done) => {
  const userId = (user as any).id; // Google profile ID
  users.set(userId, user); // Store temporarily (replace with Postgres)
  console.log('Serialized user ID:', userId);
  done(null, userId);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id); // Fetch from store (replace with Postgres)
  console.log('Deserialized user:', user);
  done(null, user || null);
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

