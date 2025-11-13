// Community Immunity Routes - API endpoints for community immunity tracking
const express = require('express');
const router = express.Router();
const {
  createCommunityProfile,
  trackExposure,
  administerVaccination,
  getCommunityImmunityStatus,
  trackCrossVariantImmunity,
  getGlobalImmunityStatistics,
  getUserImmunityProfile,
  getImmunityTrends
} = require('../controllers/communityImmunityController');

// Community Profile Management
/**
 * @route POST /api/community-immunity/communities/:communityId
 * @desc Create or update community immunity profile
 * @access Public
 * @body {
 *   type: string,
 *   location: string,
 *   demographics: object,
 *   size: number,
 *   vulnerabilityFactors: array,
 *   riskLevel: string
 * }
 */
router.post('/communities/:communityId', createCommunityProfile);

/**
 * @route GET /api/community-immunity/communities/:communityId
 * @desc Get comprehensive community immunity status
 * @access Public
 */
router.get('/communities/:communityId', getCommunityImmunityStatus);

/**
 * @route GET /api/community-immunity/communities/:communityId/trends
 * @desc Get immunity trends and analytics for a community
 * @access Public
 * @query {
 *   timeframe: string (e.g., "30d", "7d", "90d"),
 *   metric: string (e.g., "overall", "resistance", "vaccination")
 * }
 */
router.get('/communities/:communityId/trends', getImmunityTrends);

// Exposure Tracking
/**
 * @route POST /api/community-immunity/exposure/:userId/:communityId
 * @desc Track misinformation exposure and immunity response
 * @access Public
 * @body {
 *   content: string,
 *   contentHash: string,
 *   familyId: string,
 *   mutationId: string,
 *   variantType: string,
 *   confidenceScore: number,
 *   source: string,
 *   platform: string,
 *   exposureType: string,
 *   urgencyLevel: string,
 *   harmPotential: string,
 *   shared: boolean,
 *   flagged: boolean,
 *   factChecked: boolean,
 *   communityWarned: boolean
 * }
 */
router.post('/exposure/:userId/:communityId', trackExposure);

// Vaccination System
/**
 * @route POST /api/community-immunity/vaccination/:userId/:communityId
 * @desc Administer prebunk vaccination to build immunity
 * @access Public
 * @body {
 *   type: string,
 *   familyId: string,
 *   variantTypes: array,
 *   contentPatterns: array,
 *   riskLevel: string,
 *   prebunkMessage: string,
 *   factualInformation: string,
 *   warningSignals: array,
 *   sources: array,
 *   duration: number
 * }
 */
router.post('/vaccination/:userId/:communityId', administerVaccination);

// Cross-Variant Immunity
/**
 * @route POST /api/community-immunity/cross-variant/:communityId
 * @desc Track cross-variant immunity development
 * @access Public
 * @body {
 *   sourceVariant: {
 *     variantId: string,
 *     variantType: string,
 *     familyId: string
 *   },
 *   targetVariant: {
 *     variantId: string,
 *     variantType: string,
 *     familyId: string
 *   }
 * }
 */
router.post('/cross-variant/:communityId', trackCrossVariantImmunity);

// User Immunity Profiles
/**
 * @route GET /api/community-immunity/users/:userId
 * @desc Get user immunity profile across communities
 * @access Public
 */
router.get('/users/:userId', getUserImmunityProfile);

// Global Statistics
/**
 * @route GET /api/community-immunity/global/statistics
 * @desc Get global immunity statistics across all communities
 * @access Public
 */
router.get('/global/statistics', getGlobalImmunityStatistics);

// Health Check
/**
 * @route GET /api/community-immunity/health
 * @desc Health check for community immunity service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Community Immunity Tracking',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Community immunity profiles',
      'Misinformation exposure tracking',
      'Prebunk vaccination system',
      'Cross-variant immunity tracking',
      'Global immunity statistics',
      'User immunity profiles',
      'Immunity trends and analytics'
    ]
  });
});

// API Documentation
/**
 * @route GET /api/community-immunity/
 * @desc API documentation and available endpoints
 * @access Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    service: 'Community Immunity Tracking API',
    version: '1.0.0',
    description: 'Track how communities build resistance to misinformation mutations and variants',
    endpoints: {
      communities: {
        'POST /communities/:communityId': 'Create or update community immunity profile',
        'GET /communities/:communityId': 'Get community immunity status',
        'GET /communities/:communityId/trends': 'Get immunity trends and analytics'
      },
      exposure: {
        'POST /exposure/:userId/:communityId': 'Track misinformation exposure and immunity response'
      },
      vaccination: {
        'POST /vaccination/:userId/:communityId': 'Administer prebunk vaccination'
      },
      crossVariant: {
        'POST /cross-variant/:communityId': 'Track cross-variant immunity development'
      },
      users: {
        'GET /users/:userId': 'Get user immunity profile across communities'
      },
      global: {
        'GET /global/statistics': 'Get global immunity statistics'
      },
      system: {
        'GET /health': 'Service health check',
        'GET /': 'API documentation'
      }
    },
    features: [
      '🏘️ Community immunity profile management',
      '🦠 Misinformation exposure tracking with resistance analysis',
      '💉 Prebunk vaccination system for proactive immunity',
      '🔄 Cross-variant immunity tracking and analysis',
      '👤 Individual user immunity profiles',
      '🌍 Global immunity statistics and trends',
      '📊 Comprehensive immunity analytics and recommendations'
    ],
    immunityTypes: [
      'Direct exposure immunity',
      'Prebunk vaccination immunity',
      'Community learning immunity',
      'Expert guidance immunity',
      'Cross-variant immunity',
      'Herd immunity protection'
    ]
  });
});

module.exports = router;