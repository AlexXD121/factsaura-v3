// Community Immunity Controller - handles community immunity tracking operations
const CommunityImmunityService = require('../services/communityImmunityService');

// Initialize community immunity service
const immunityService = new CommunityImmunityService();

/**
 * Create or update community immunity profile
 */
const createCommunityProfile = async (req, res) => {
  try {
    const { communityId } = req.params;
    const communityData = req.body;

    console.log(`🏘️ Creating community immunity profile for: ${communityId}`);

    const result = immunityService.createCommunityProfile(communityId, communityData);

    if (result.success) {
      console.log(`✅ Community profile created successfully: ${communityId}`);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Community immunity profile created successfully'
      });
    } else {
      console.log(`❌ Failed to create community profile: ${result.error}`);
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to create community immunity profile'
      });
    }

  } catch (error) {
    console.error('❌ Error creating community profile:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while creating community profile'
    });
  }
};

/**
 * Track misinformation exposure and immunity response
 */
const trackExposure = async (req, res) => {
  try {
    const { userId, communityId } = req.params;
    const exposureData = req.body;

    console.log(`🦠 Tracking misinformation exposure for user ${userId} in community ${communityId}`);

    const result = immunityService.trackMisinformationExposure(userId, communityId, exposureData);

    if (result.success) {
      console.log(`✅ Exposure tracked successfully. Resistance: ${result.immunityResponse.resistanceSuccess}`);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Misinformation exposure tracked successfully'
      });
    } else {
      console.log(`❌ Failed to track exposure: ${result.error}`);
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to track misinformation exposure'
      });
    }

  } catch (error) {
    console.error('❌ Error tracking exposure:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while tracking exposure'
    });
  }
};

/**
 * Administer prebunk vaccination to build immunity
 */
const administerVaccination = async (req, res) => {
  try {
    const { userId, communityId } = req.params;
    const vaccinationData = req.body;

    console.log(`💉 Administering prebunk vaccination for user ${userId} in community ${communityId}`);

    const result = immunityService.administerPrebunkVaccination(userId, communityId, vaccinationData);

    if (result.success) {
      console.log(`✅ Vaccination administered successfully. Immunity boost: ${result.immunityBoost.overallImmunityIncrease}`);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Prebunk vaccination administered successfully'
      });
    } else {
      console.log(`❌ Failed to administer vaccination: ${result.error}`);
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to administer prebunk vaccination'
      });
    }

  } catch (error) {
    console.error('❌ Error administering vaccination:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while administering vaccination'
    });
  }
};

/**
 * Get comprehensive community immunity status
 */
const getCommunityImmunityStatus = async (req, res) => {
  try {
    const { communityId } = req.params;

    console.log(`📊 Getting immunity status for community: ${communityId}`);

    const result = immunityService.getCommunityImmunityStatus(communityId);

    if (result.found) {
      console.log(`✅ Community immunity status retrieved. Level: ${result.immunityStatus.overallLevel.toFixed(2)}`);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Community immunity status retrieved successfully'
      });
    } else {
      console.log(`❌ Community not found: ${communityId}`);
      res.status(404).json({
        success: false,
        error: result.error,
        message: 'Community not found'
      });
    }

  } catch (error) {
    console.error('❌ Error getting community immunity status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while getting community immunity status'
    });
  }
};

/**
 * Track cross-variant immunity development
 */
const trackCrossVariantImmunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const variantData = req.body;

    console.log(`🔄 Tracking cross-variant immunity for community: ${communityId}`);

    const result = immunityService.trackCrossVariantImmunity(communityId, variantData);

    if (result.success) {
      console.log(`✅ Cross-variant immunity tracked. Protection level: ${result.communityImpact.newVariantImmunity.toFixed(2)}`);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Cross-variant immunity tracked successfully'
      });
    } else {
      console.log(`❌ Failed to track cross-variant immunity: ${result.error}`);
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to track cross-variant immunity'
      });
    }

  } catch (error) {
    console.error('❌ Error tracking cross-variant immunity:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while tracking cross-variant immunity'
    });
  }
};

/**
 * Get global immunity statistics across all communities
 */
const getGlobalImmunityStatistics = async (req, res) => {
  try {
    console.log('🌍 Getting global immunity statistics');

    const result = immunityService.getGlobalImmunityStatistics();

    if (result.success) {
      console.log(`✅ Global statistics retrieved. Total communities: ${result.globalStatistics.totalCommunities}`);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Global immunity statistics retrieved successfully'
      });
    } else {
      console.log(`❌ Failed to get global statistics: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to retrieve global immunity statistics'
      });
    }

  } catch (error) {
    console.error('❌ Error getting global immunity statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while getting global immunity statistics'
    });
  }
};

/**
 * Get user immunity profile across communities
 */
const getUserImmunityProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`👤 Getting immunity profile for user: ${userId}`);

    // Get user profile from the service
    const userProfile = immunityService.userImmunityProfiles.get(userId);

    if (userProfile) {
      console.log(`✅ User immunity profile retrieved. Overall level: ${userProfile.immunityProfile.overallImmunityLevel.toFixed(2)}`);
      
      // Calculate additional metrics
      const communityCount = userProfile.communityIds.size;
      const variantProtection = Array.from(userProfile.immunityProfile.variantSpecificImmunity.entries());
      const recentVaccinations = userProfile.vaccinationHistory.slice(-5); // Last 5 vaccinations
      
      res.status(200).json({
        success: true,
        data: {
          userId: userId,
          immunityProfile: userProfile.immunityProfile,
          exposureHistory: userProfile.exposureHistory,
          communityMemberships: {
            totalCommunities: communityCount,
            communityIds: Array.from(userProfile.communityIds)
          },
          variantProtection: variantProtection.map(([variant, level]) => ({
            variant: variant,
            protectionLevel: level,
            protectionStatus: level >= 0.7 ? 'high' : level >= 0.4 ? 'medium' : 'low'
          })),
          vaccinationHistory: {
            totalVaccinations: userProfile.vaccinationHistory.length,
            recentVaccinations: recentVaccinations
          },
          riskAssessment: {
            overallRisk: userProfile.immunityProfile.overallImmunityLevel < 0.3 ? 'high' : 
                        userProfile.immunityProfile.overallImmunityLevel < 0.6 ? 'medium' : 'low',
            resistanceRate: userProfile.exposureHistory.resistanceRate,
            vulnerableVariants: variantProtection.filter(([, level]) => level < 0.3).map(([variant]) => variant)
          },
          lastUpdated: userProfile.lastUpdated
        },
        message: 'User immunity profile retrieved successfully'
      });
    } else {
      console.log(`❌ User immunity profile not found: ${userId}`);
      res.status(404).json({
        success: false,
        error: 'User immunity profile not found',
        message: 'User has no immunity tracking data'
      });
    }

  } catch (error) {
    console.error('❌ Error getting user immunity profile:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while getting user immunity profile'
    });
  }
};

/**
 * Get immunity trends and analytics
 */
const getImmunityTrends = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { timeframe = '30d', metric = 'overall' } = req.query;

    console.log(`📈 Getting immunity trends for community ${communityId}, timeframe: ${timeframe}, metric: ${metric}`);

    const communityProfile = immunityService.communityProfiles.get(communityId);

    if (!communityProfile) {
      return res.status(404).json({
        success: false,
        error: 'Community not found',
        message: 'Community immunity profile not found'
      });
    }

    // Filter trends based on timeframe
    const now = new Date();
    const timeframeDays = parseInt(timeframe.replace('d', '')) || 30;
    const cutoffDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

    const filteredTrends = communityProfile.immunityProfile.immunityTrends.filter(trend => 
      new Date(trend.timestamp) >= cutoffDate
    );

    // Calculate trend analytics
    const trendAnalytics = {
      totalEvents: filteredTrends.length,
      immunityGrowth: filteredTrends.reduce((sum, trend) => sum + (trend.immunityChange || 0), 0),
      averageImmunityChange: filteredTrends.length > 0 ? 
        filteredTrends.reduce((sum, trend) => sum + (trend.immunityChange || 0), 0) / filteredTrends.length : 0,
      eventTypes: {},
      successfulResistances: filteredTrends.filter(trend => trend.resistanceSuccess).length,
      failedResistances: filteredTrends.filter(trend => trend.resistanceSuccess === false).length
    };

    // Count event types
    filteredTrends.forEach(trend => {
      trendAnalytics.eventTypes[trend.event] = (trendAnalytics.eventTypes[trend.event] || 0) + 1;
    });

    console.log(`✅ Immunity trends retrieved. ${filteredTrends.length} events in ${timeframe}`);

    res.status(200).json({
      success: true,
      data: {
        communityId: communityId,
        timeframe: timeframe,
        metric: metric,
        trends: filteredTrends,
        analytics: trendAnalytics,
        currentStatus: {
          overallImmunityLevel: communityProfile.immunityProfile.overallImmunityLevel,
          herdImmunityStatus: communityProfile.communityMetrics.herdImmunityStatus,
          resistanceRate: communityProfile.exposureHistory.resistanceRate
        }
      },
      message: 'Immunity trends retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting immunity trends:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while getting immunity trends'
    });
  }
};

module.exports = {
  createCommunityProfile,
  trackExposure,
  administerVaccination,
  getCommunityImmunityStatus,
  trackCrossVariantImmunity,
  getGlobalImmunityStatistics,
  getUserImmunityProfile,
  getImmunityTrends
};