import express from 'express';
import { GoogleCheckAuth, GoogleLogin, GoogleLoginCallback, Logout } from '../controllers/auth.controller';

const authRouter = express.Router();

// Google Login
authRouter.get('/google', GoogleLogin);
authRouter.get('/google/callback', GoogleLoginCallback);

// Add debug middleware specifically for the check-auth route
authRouter.use('/login/check-auth', (req, res, next) => {
  console.log('Debug - Check Auth Request:');
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Cookies:', req.cookies);
  console.log('Session ID:', req.sessionID);
  console.log('Is Authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
  console.log('User object present:', !!req.user);
  next();
});

// Check auth and logout routes
authRouter.get('/login/check-auth', GoogleCheckAuth);
authRouter.get('/logout', Logout);

export { authRouter };