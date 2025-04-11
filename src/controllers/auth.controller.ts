/**
 * Authentication Controller Module
 * Handles Google OAuth authentication flow and session management.
 */
import { NextFunction, Request, Response } from "express";
import config from 'config';
import passport from 'passport';
import { ApiError } from "../utils/erros";
import { createUser, getUser } from "../services/user.service";

/**
 * Checks if the current user is authenticated
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns JSON response with user data if authenticated, or 401 if not
 */
export async function GoogleCheckAuth (req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.pool) {
      throw new ApiError(500, "Database not connected");
    }

    if (!req.isAuthenticated() || !req.user) {
      // Don't throw an error, just return a 401 response
      return res.status(401).json({
        success: false,
        message: "User not logged in"
      });
    }

    const googleUser = req.user as any;
    const { email } = googleUser._json;

    const user = await getUser(req, email);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: user
    });
  } catch (error) {
    console.error('Error during Google check auth:', error);
    next(error);
  }
}

/**
 * Initiates Google OAuth2.0 login flow
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
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

/**
 * Handles the callback from Google OAuth2.0
 * Creates or updates user record in database upon successful authentication
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @redirects to client application URL on success
 */
export function GoogleLoginCallback (req: Request, res: Response, next: NextFunction) {
  try {
    passport.authenticate('google', {
      failureRedirect: "/logout"
    })(req, res, async (err: any) => {
      if (err) {
        console.error('Error in Google callback authentication:', err);
        return next(err);
      }
      
      console.log(req.user);
      
      try {
        if (!req.pool) {
          throw new ApiError(500, "Database not connected");
        }

        if (!req.user) {
          throw new ApiError(401, "User not found");
        }


        const googleUser = req.user as any;
        const { email, picture } = googleUser._json;
        
        // Create/update user in database
        const user = await createUser(req, email, picture, googleUser._json);

        if (!!user) {
          res.redirect((config.get('client') as any).url);
        } else {
          throw new ApiError(500, "Create user failed");
        }
      } catch (error) {
        console.error('Error processing user data:', error);
        return next(error);
      }
    });
  } catch (error) {
    console.error('Error during Google login callback:', error);
    next(error);
  }
}

/**
 * Logs out the current user by destroying their session
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @redirects to client application URL after logout
 */
export async function Logout (req: Request, res: Response, next: NextFunction) {
  try {
    req.logout(function(err) {
      if (err) { return next(err); }
    });
    res.redirect((config.get('client') as any).url);
  } catch (error) {
    console.error('Error during logout:', error);
    next(error);
  }
}