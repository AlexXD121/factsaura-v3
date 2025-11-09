const { supabase, supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');

class AuthService {
  // Sign up new user
  static async signUp(email, password, userData = {}) {
    try {
      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username
          }
        }
      });

      if (authError) throw authError;

      // Create user profile in database
      const userProfile = await User.create({
        id: authData.user.id,
        email: authData.user.email,
        username: userData.username,
        full_name: userData.full_name,
        location: userData.location
      });

      return {
        user: authData.user,
        profile: userProfile,
        session: authData.session
      };
    } catch (error) {
      throw error;
    }
  }

  // Sign in user
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile
      const userProfile = await User.findById(data.user.id);
      
      if (userProfile) {
        // Update last login
        await userProfile.updateLastLogin();
      }

      return {
        user: data.user,
        profile: userProfile,
        session: data.session
      };
    } catch (error) {
      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Refresh session
  static async refreshSession(refreshToken) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) throw error;
      
      const userProfile = await User.findById(user.id);
      
      return {
        user,
        profile: userProfile
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate username availability
  static async isUsernameAvailable(username) {
    try {
      const existingUser = await User.findByUsername(username);
      return !existingUser;
    } catch (error) {
      throw error;
    }
  }

  // Generate username from email
  static generateUsername(email) {
    const baseUsername = email.split('@')[0].toLowerCase();
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseUsername}${randomSuffix}`;
  }
}

module.exports = AuthService;