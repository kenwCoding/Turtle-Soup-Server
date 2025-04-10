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
const corsConfig = config.get('cors') || {} as any;

const { name, version } = require('../package.json');

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up CORS with credentials support
const corsOptions = {
  ...corsConfig,
  credentials: true,
  origin: (corsConfig.origin && corsConfig.origin.length > 0) ? 
    corsConfig.origin : 
    (config.get('client') as any).url,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};
app.use(cors(corsOptions));

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
    name: 'session', // Make sure cookies use consistent names
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV !== 'dev', // HTTPS in production
      httpOnly: true,
      sameSite: 'none', // Always use 'none' for cross-origin requests
      path: '/',
    },
    proxy: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Add debug middleware for session and auth
if (process.env.NODE_ENV !== 'dev') {
  console.log('Running in production mode');
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Is Authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'function not available');
    console.log('User:', req.user);
    next();
  });
}

passport.serializeUser((user, done) => {
  const userId = (user as any).id; // Google profile ID
  console.log('Serialized user ID:', userId);
  done(null, userId);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Try to find the user in the database by googleId
    const result = await pool.query(`
      SELECT * FROM users WHERE user_profile->>'sub' = $1 OR user_profile->>'id' = $1
    `, [id]);
    
    const user = result.rows[0];
    
    if (!user) {
      console.log('User not found in database for ID:', id);
      // If not found in the database, return null
      return done(null, null);
    }
    
    console.log('Deserialized user from database');
    
    // Parse the user_profile if it's stored as string
    let userProfile = user.user_profile;
    if (typeof userProfile === 'string') {
      try {
        userProfile = JSON.parse(userProfile);
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }
    
    done(null, {
      id: id,
      _json: userProfile
    });
  } catch (error) {
    console.error('Error during user deserialization:', error);
    done(error, null);
  }
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

