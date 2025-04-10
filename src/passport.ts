import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from 'config';

passport.use(new GoogleStrategy({
  clientID: (config.get('google')! as any).clientID!,
  clientSecret: (config.get('google')! as any).clientSecret,
  callbackURL: (config.get('passport')! as any).callbackUrl
}, (accessToken, refreshToken, profile, done) => {
  // This callback will be called after successful authentication
  // For now, just return the profile
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user!);
});

export default passport;