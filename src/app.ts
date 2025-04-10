/**
 * Main application setup and configuration file.
 * Sets up Express server with middleware, authentication, database connections,
 * error handling, and routes.
 */
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

// Load environment variables from .env file
dotenv.config();
const corsConfig = config.get('cors') || {} as any;

const { name, version } = require('../package.json');

/**
 * Express application instance
 */
const app = express();
app.set('trust proxy', 1);

// Apply middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS configuration
 * Enables Cross-Origin Resource Sharing with credentials support
 */
const corsOptions = {
  ...corsConfig,
  credentials: true,
  origin: (config.get('client') as any).url,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};
app.use(cors(corsOptions));

/**
 * PostgreSQL database connection pool
 */
const pool = new pg.Pool({
  connectionString: (config.get('postgres')! as any).connectionString,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err);
  }
  release();
});

/**
 * Session configuration
 * Sets up user sessions with cookie settings for authentication
 */
app.use(
  session({
    secret: (config.get('session')! as any).secret,
    name: 'session',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV !== 'dev',
      httpOnly: true,
      sameSite: 'none',
      path: '/',
    },
    proxy: true,
  })
);

/**
 * Passport authentication configuration
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * User serialization for session storage
 * Stores Google profile ID in the session
 */
passport.serializeUser((user, done) => {
  const userId = (user as any).id; // Google profile ID
  done(null, userId);
});

/**
 * User deserialization from session
 * Retrieves user from database based on Google profile ID
 */
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

/**
 * Google OAuth2.0 authentication strategy configuration
 */
passport.use(new GoogleStrategy({
  clientID: (config.get('google')! as any).clientID!,
  clientSecret: (config.get('google')! as any).clientSecret,
  callbackURL: (config.get('passport')! as any).callbackUrl
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

const port = process.env.PORT || config.get('port') || 4000;

/**
 * Make database pool available in request object
 */
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

/**
 * Apply application routes
 */
app.use(router);

/**
 * 404 error handler for undefined routes
 */
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

/**
 * Global error handler
 * Handles all errors and returns appropriate response
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

/**
 * Clean shutdown handler
 * Gracefully closes database connections on application shutdown
 */
process.on('SIGINT', async () => {
  await pool.end(); // Close all connections in pool
  console.log('Pool has ended');
  process.exit(0);
});

/**
 * Start the server and listen on configured port
 */
app.listen(port, ()  => {
  console.log(`==`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🚩 Project: ${name} (ver. ${version})`);
  console.log(`⚙️  Cors config ${JSON.stringify(corsConfig, null, 2)}`);
  console.log(`==`);
});

