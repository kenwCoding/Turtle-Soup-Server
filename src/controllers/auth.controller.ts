import { NextFunction, Request, Response } from "express";
import config from 'config';
import passport from 'passport';
import { ApiError } from "../utils/erros";
import { createUser } from "../services/user.service";

export async function GoogleCheckAuth (req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.pool) {
      throw new ApiError(500, "Database not connected");
    }
    
    if (!req.user) {
      throw new ApiError(302, "User not logged in");
    }

    const googleUser = req.user as any;
    const { email, picture } = googleUser._json;

    const user = await createUser(req, email, picture, googleUser._json);
    
    const isCreated = user.is_created;
    delete user.is_created;
    console.log(user);
    
    if (isCreated) {
      res.status(201).json({
        success: true,
        message: "User created successfully and logged in successfully",
        user: user
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: user
      });
    }
  } catch (error) {
    console.error('Error during Google check auth:', error);
    next(error);
  }
}

export function GoogleLogin (req: Request, res: Response, next: NextFunction) {
  try {
    passport.authenticate('google', { 
      scope: ['email', 'profile'], 
      prompt: "select_account consent"
    })(req, res, next);
  } catch (error) {
    console.error('Error during Google login:', error);
    next(error);
  }
}

export function GoogleLoginCallback (req: Request, res: Response, next: NextFunction) {
  try {
    passport.authenticate('google', {
      successRedirect: config.get('client.url'),
      failureRedirect: "/logout"
    })(req, res, next);
  } catch (error) {
    console.error('Error during Google login callback:', error);
    next(error);
  }
}

export async function Logout (req: Request, res: Response, next: NextFunction) {
  try {
    req.logout(function(err) {
      if (err) { return next(err); }
    });
    res.redirect(config.get('client.url'));
  } catch (error) {
    console.error('Error during logout:', error);
    next(error);
  }
}