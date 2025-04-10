/**
 * Authentication Routes Module
 * Defines routes for Google OAuth authentication flow, session management and status checking.
 */
import express from 'express';
import { GoogleCheckAuth, GoogleLogin, GoogleLoginCallback, Logout } from '../controllers/auth.controller';

const authRouter = express.Router();

/**
 * Google OAuth2.0 Authentication Routes
 * @route GET /auth/google - Initiates Google OAuth2.0 login flow
 * @route GET /auth/google/callback - Handles Google OAuth2.0 callback after authentication
 */
authRouter.get('/google', GoogleLogin);
authRouter.get('/google/callback', GoogleLoginCallback);

/**
 * Authentication Status and Management Routes
 * @route GET /auth/login/check-auth - Checks if user is authenticated
 * @route GET /auth/logout - Logs out the current user
 */
authRouter.get('/login/check-auth', GoogleCheckAuth);
authRouter.get('/logout', Logout);

export { authRouter };