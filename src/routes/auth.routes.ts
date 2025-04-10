import express from 'express';
import { GoogleCheckAuth, GoogleLogin, GoogleLoginCallback, Logout } from '../controllers/auth.controller';

const authRouter = express.Router();

// Google Login
authRouter.get('/google', GoogleLogin);
authRouter.get('/google/callback', GoogleLoginCallback);

// Logout
authRouter.get('/login/check-auth', GoogleCheckAuth);
authRouter.get('/logout', Logout);

export { authRouter };