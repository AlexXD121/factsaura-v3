const AuthService = require('../services/authService');

class AuthController {
  // POST /api/auth/signup
  static async signUp(req, res) {
    try {
      const { email, password, username, full_name, location } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email and password are required'
          }
        });
      }

      // Generate username if not provided
      let finalUsername = username;
      if (!finalUsername) {
        finalUsername = AuthService.generateUsername(email);
      }

      // Check username availability
      const isAvailable = await AuthService.isUsernameAvailable(finalUsername);
      if (!isAvailable) {
        return res.status(400).json({
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already taken'
          }
        });
      }

      const result = await AuthService.signUp(email, password, {
        username: finalUsername,
        full_name,
        location
      });

      res.status(201).json({
        message: 'User created successfully',
        user: result.profile.toJSON(),
        session: result.session
      });

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.message.includes('already registered')) {
        return res.status(400).json({
          error: {
            code: 'EMAIL_TAKEN',
            message: 'Email is already registered'
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'SIGNUP_FAILED',
          message: 'Failed to create user account'
        }
      });
    }
  }

  // POST /api/auth/signin
  static async signIn(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Email and password are required'
          }
        });
      }

      const result = await AuthService.signIn(email, password);

      res.json({
        message: 'Signed in successfully',
        user: result.profile ? result.profile.toJSON() : null,
        session: result.session
      });

    } catch (error) {
      console.error('Signin error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'SIGNIN_FAILED',
          message: 'Failed to sign in'
        }
      });
    }
  }

  // POST /api/auth/signout
  static async signOut(req, res) {
    try {
      await AuthService.signOut();
      
      res.json({
        message: 'Signed out successfully'
      });

    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({
        error: {
          code: 'SIGNOUT_FAILED',
          message: 'Failed to sign out'
        }
      });
    }
  }

  // POST /api/auth/reset-password
  static async resetPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: {
            code: 'MISSING_EMAIL',
            message: 'Email is required'
          }
        });
      }

      await AuthService.resetPassword(email);

      res.json({
        message: 'Password reset email sent'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: {
          code: 'RESET_FAILED',
          message: 'Failed to send reset email'
        }
      });
    }
  }

  // GET /api/auth/me
  static async getCurrentUser(req, res) {
    try {
      // User is already attached by auth middleware
      res.json({
        user: req.user.toJSON()
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: {
          code: 'USER_FETCH_FAILED',
          message: 'Failed to get user information'
        }
      });
    }
  }

  // POST /api/auth/refresh
  static async refreshSession(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required'
          }
        });
      }

      const result = await AuthService.refreshSession(refresh_token);

      res.json({
        message: 'Session refreshed successfully',
        session: result.session
      });

    } catch (error) {
      console.error('Refresh session error:', error);
      res.status(401).json({
        error: {
          code: 'REFRESH_FAILED',
          message: 'Failed to refresh session'
        }
      });
    }
  }

  // GET /api/auth/check-username/:username
  static async checkUsername(req, res) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({
          error: {
            code: 'MISSING_USERNAME',
            message: 'Username is required'
          }
        });
      }

      const isAvailable = await AuthService.isUsernameAvailable(username);

      res.json({
        username,
        available: isAvailable
      });

    } catch (error) {
      console.error('Check username error:', error);
      res.status(500).json({
        error: {
          code: 'USERNAME_CHECK_FAILED',
          message: 'Failed to check username availability'
        }
      });
    }
  }
}

module.exports = AuthController;