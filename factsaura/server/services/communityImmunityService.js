// Community Immunity Tracking Service
// Tracks how communities build resistance to misinformation mutations and variants
const crypto = require('crypto');

class CommunityImmunityService {
  constructor() {
    // Configuration for immunity tracking
    this.immunityDecayRate = parseFloat(process.env.IMMUNITY_DECAY_RATE) || 0.1; // 10% decay per week
    this.immunityThreshold = parseFloat(process.env.IMMUNITY_THRESHOLD) || 0.7; // 70% immunity threshold
    this.exposureWindow = parseInt(process.env.EXPOSURE_WINDOW) || 604800000; // 7 days in ms
    this.immunityBoostFactor = parseFloat(process.env.IMMUNITY_BOOST_FACTOR) || 1.5;
    
    // Core data structures for immunity tracking
    this.communityProfiles = new Map(); // communityId -> CommunityProfile
    this.userImmunityProfiles = new Map(); // userId -> UserImmunityProfile
    this.misinformationExposures = new Map(); // exposureId -> ExposureRecord
    this.immunityMetrics = new Map(); // metricId -> ImmunityMetric
    
    // Immunity pattern tracking
    this.immunityPatterns = {
      DIRECT_EXPOSURE: 'direct_exposure', // User directly exposed to misinformation
      PREBUNK_VACCINATION: 'prebunk_vaccination', // User received prebunk before exposure
      COMMUNITY_LEARNING: 'community_learning', // User learned from community discussions
      EXPERT_GUIDANCE: 'expert_guidance', // User received expert fact-checking
      CROSS_VARIANT_IMMUNITY: 'cross_variant_immunity', // Immunity to similar variants
      HERD_IMMUNITY: 'herd_immunity' // Community-wide protection
    };
    
    // Community types for targeted immunity tracking
    this.communityTypes = {
      GEOGRAPHICAL: 'geographical', // Location-based communities (Mumbai, Delhi, etc.)
      DEMOGRAPHIC: 'demographic', // Age, profession, education-based
      INTEREST_BASED: 'interest_based', // Topic-specific communities
      PLATFORM_BASED: 'platform_based', // Social media platform communities
      VULNERABILITY_BASED: 'vulnerability_based' // High-risk groups
    };
    
    // Immunity effectiveness metrics
    this.immunityEffectiveness = {
      totalCommunities: 0,
      averageImmunityLevel: 0,
      highImmunityCommunities: 0,
      vulnerableCommunities: 0,
      crossVariantProtection: 0
    };
  }

  /**
   * Create or update community immunity profile
   * @param {string} communityId - Unique community identifier
   * @param {Object} communityData - Community characteristics and metadata
   * @returns {Object} Community immunity profile
   */
  createCommunityProfile(communityId, communityData = {}) {
    try {
      const timestamp = new Date().toISOString();
      
      const communityProfile = {
        communityId: communityId,
        communityType: communityData.type || this.communityTypes.GEOGRAPHICAL,
        characteristics: {
          location: communityData.location || 'unknown',
          demographics: communityData.demographics || {},
          size: communityData.size || 0,
          vulnerabilityFactors: communityData.vulnerabilityFactors || [],
          riskLevel: communityData.riskLevel || 'medium'
        },
        immunityProfile: {
          overallImmunityLevel: 0.0,
          variantSpecificImmunity: new Map(), // variantId -> immunity level
          immunityTrends: [],
          lastUpdated: timestamp,
          immunityBuilders: {
            directExposures: 0,
            prebunkVaccinations: 0,
            communityLearning: 0,
            expertGuidance: 0,
            crossVariantBoosts: 0
          }
        },
        exposureHistory: {
          totalExposures: 0,
          successfulResistance: 0,
          failedResistance: 0,
          resistanceRate: 0.0,
          recentExposures: [],
          exposurePatterns: new Map()
        },
        communityMetrics: {
          activeMembers: 0,
          immuneMembers: 0,
          vulnerableMembers: 0,
          immunityDistribution: {
            high: 0, // > 0.8
            medium: 0, // 0.4 - 0.8
            low: 0, // < 0.4
            unknown: 0
          },
          herdImmunityStatus: 'vulnerable' // vulnerable, building, achieved
        },
        createdAt: timestamp,
        lastUpdated: timestamp
      };
      
      this.communityProfiles.set(communityId, communityProfile);
      this._updateGlobalImmunityMetrics();
      
      return {
        success: true,
        communityId: communityId,
        profile: communityProfile,
        message: 'Community immunity profile created successfully'
      };
      
    } catch (error) {
      console.error('Failed to create community profile:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Track user exposure to misinformation and immunity response
   * @param {string} userId - User identifier
   * @param {string} communityId - Community identifier
   * @param {Object} exposureData - Exposure details and misinformation data
   * @returns {Object} Exposure tracking result with immunity impact
   */
  trackMisinformationExposure(userId, communityId, exposureData) {
    try {
      const exposureId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Get or create user immunity profile
      const userProfile = this._getOrCreateUserProfile(userId, communityId);
      const communityProfile = this.communityProfiles.get(communityId);
      
      if (!communityProfile) {
        throw new Error(`Community profile ${communityId} not found`);
      }
      
      // Analyze exposure context
      const exposureAnalysis = this._analyzeExposureContext(exposureData, userProfile, communityProfile);
      
      // Create exposure record
      const exposureRecord = {
        exposureId: exposureId,
        userId: userId,
        communityId: communityId,
        timestamp: timestamp,
        misinformationData: {
          content: exposureData.content,
          contentHash: exposureData.contentHash,
          familyId: exposureData.familyId,
          mutationId: exposureData.mutationId,
          variantType: exposureData.variantType,
          confidenceScore: exposureData.confidenceScore || 0.8
        },
        exposureContext: {
          source: exposureData.source || 'unknown',
          platform: exposureData.platform || 'unknown',
          exposureType: exposureData.exposureType || 'direct',
          urgencyLevel: exposureData.urgencyLevel || 'medium',
          harmPotential: exposureData.harmPotential || 'medium'
        },
        immunityResponse: {
          hadPriorImmunity: exposureAnalysis.hadPriorImmunity,
          immunityLevel: exposureAnalysis.currentImmunityLevel,
          resistanceSuccess: exposureAnalysis.resistanceSuccess,
          immunitySource: exposureAnalysis.immunitySource,
          immunityBoost: exposureAnalysis.immunityBoost,
          crossVariantProtection: exposureAnalysis.crossVariantProtection
        },
        outcome: {
          believed: !exposureAnalysis.resistanceSuccess,
          shared: exposureData.shared || false,
          flagged: exposureData.flagged || false,
          factChecked: exposureData.factChecked || false,
          communityWarned: exposureData.communityWarned || false
        }
      };
      
      // Store exposure record
      this.misinformationExposures.set(exposureId, exposureRecord);
      
      // Update user immunity profile
      this._updateUserImmunityProfile(userProfile, exposureRecord);
      
      // Update community immunity profile
      this._updateCommunityImmunityProfile(communityProfile, exposureRecord);
      
      // Calculate immunity changes
      const immunityImpact = this._calculateImmunityImpact(exposureRecord, userProfile, communityProfile);
      
      return {
        success: true,
        exposureId: exposureId,
        immunityResponse: exposureRecord.immunityResponse,
        immunityImpact: immunityImpact,
        communityImpact: {
          newImmunityLevel: communityProfile.immunityProfile.overallImmunityLevel,
          herdImmunityStatus: communityProfile.communityMetrics.herdImmunityStatus,
          resistanceRate: communityProfile.exposureHistory.resistanceRate
        },
        recommendations: this._generateImmunityRecommendations(exposureRecord, communityProfile)
      };
      
    } catch (error) {
      console.error('Failed to track misinformation exposure:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Administer prebunk vaccination to build immunity before exposure
   * @param {string} userId - User identifier
   * @param {string} communityId - Community identifier
   * @param {Object} vaccinationData - Prebunk vaccination details
   * @returns {Object} Vaccination result and immunity boost
   */
  administerPrebunkVaccination(userId, communityId, vaccinationData) {
    try {
      const vaccinationId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Get or create user immunity profile
      const userProfile = this._getOrCreateUserProfile(userId, communityId);
      const communityProfile = this.communityProfiles.get(communityId);
      
      if (!communityProfile) {
        throw new Error(`Community profile ${communityId} not found`);
      }
      
      // Create vaccination record
      const vaccinationRecord = {
        vaccinationId: vaccinationId,
        userId: userId,
        communityId: communityId,
        timestamp: timestamp,
        vaccinationType: vaccinationData.type || 'general_prebunk',
        targetMisinformation: {
          familyId: vaccinationData.familyId,
          variantTypes: vaccinationData.variantTypes || [],
          contentPatterns: vaccinationData.contentPatterns || [],
          riskLevel: vaccinationData.riskLevel || 'medium'
        },
        vaccinationContent: {
          prebunkMessage: vaccinationData.prebunkMessage,
          factualInformation: vaccinationData.factualInformation,
          warningSignals: vaccinationData.warningSignals || [],
          sources: vaccinationData.sources || []
        },
        immunityBoost: {
          baseImmunityIncrease: 0.2, // 20% base increase
          variantSpecificBoost: 0.3, // 30% for specific variants
          crossVariantBoost: 0.1, // 10% for related variants
          duration: vaccinationData.duration || 2592000000 // 30 days in ms
        }
      };
      
      // Apply vaccination immunity boost
      const immunityBoost = this._applyVaccinationBoost(userProfile, vaccinationRecord);
      
      // Update community vaccination metrics
      communityProfile.immunityProfile.immunityBuilders.prebunkVaccinations++;
      communityProfile.communityMetrics.immuneMembers = Math.max(
        communityProfile.communityMetrics.immuneMembers,
        this._countImmuneMembers(communityId)
      );
      
      // Update herd immunity status
      this._updateHerdImmunityStatus(communityProfile);
      
      return {
        success: true,
        vaccinationId: vaccinationId,
        immunityBoost: immunityBoost,
        userImmunityLevel: userProfile.immunityProfile.overallImmunityLevel,
        communityImpact: {
          newImmunityLevel: communityProfile.immunityProfile.overallImmunityLevel,
          herdImmunityStatus: communityProfile.communityMetrics.herdImmunityStatus,
          vaccinatedMembers: communityProfile.immunityProfile.immunityBuilders.prebunkVaccinations
        },
        effectiveness: this._calculateVaccinationEffectiveness(vaccinationRecord, communityProfile)
      };
      
    } catch (error) {
      console.error('Failed to administer prebunk vaccination:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get comprehensive community immunity status
   * @param {string} communityId - Community identifier
   * @returns {Object} Detailed community immunity analysis
   */
  getCommunityImmunityStatus(communityId) {
    try {
      const communityProfile = this.communityProfiles.get(communityId);
      if (!communityProfile) {
        return {
          found: false,
          error: 'Community not found'
        };
      }
      
      // Calculate current immunity metrics
      const immunityMetrics = this._calculateCommunityImmunityMetrics(communityProfile);
      
      // Analyze immunity trends
      const immunityTrends = this._analyzeImmunityTrends(communityProfile);
      
      // Get vulnerability assessment
      const vulnerabilityAssessment = this._assessCommunityVulnerability(communityProfile);
      
      // Generate immunity recommendations
      const recommendations = this._generateCommunityRecommendations(communityProfile);
      
      return {
        found: true,
        communityId: communityId,
        immunityStatus: {
          overallLevel: communityProfile.immunityProfile.overallImmunityLevel,
          herdImmunityStatus: communityProfile.communityMetrics.herdImmunityStatus,
          resistanceRate: communityProfile.exposureHistory.resistanceRate,
          immunityDistribution: communityProfile.communityMetrics.immunityDistribution
        },
        immunityMetrics: immunityMetrics,
        immunityTrends: immunityTrends,
        vulnerabilityAssessment: vulnerabilityAssessment,
        protectionCoverage: {
          totalMembers: communityProfile.communityMetrics.activeMembers,
          immuneMembers: communityProfile.communityMetrics.immuneMembers,
          vulnerableMembers: communityProfile.communityMetrics.vulnerableMembers,
          coveragePercentage: communityProfile.communityMetrics.activeMembers > 0 ? 
            (communityProfile.communityMetrics.immuneMembers / communityProfile.communityMetrics.activeMembers) * 100 : 0
        },
        variantProtection: this._analyzeVariantProtection(communityProfile),
        recommendations: recommendations,
        lastUpdated: communityProfile.lastUpdated
      };
      
    } catch (error) {
      console.error('Failed to get community immunity status:', error.message);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Track cross-variant immunity development
   * @param {string} communityId - Community identifier
   * @param {Object} variantData - Variant exposure and immunity data
   * @returns {Object} Cross-variant immunity analysis
   */
  trackCrossVariantImmunity(communityId, variantData) {
    try {
      const communityProfile = this.communityProfiles.get(communityId);
      if (!communityProfile) {
        throw new Error(`Community profile ${communityId} not found`);
      }
      
      const timestamp = new Date().toISOString();
      
      // Analyze variant relationships
      const variantAnalysis = this._analyzeVariantRelationships(variantData);
      
      // Calculate cross-immunity potential
      const crossImmunityPotential = this._calculateCrossImmunityPotential(
        variantData.sourceVariant,
        variantData.targetVariant,
        communityProfile
      );
      
      // Update variant-specific immunity
      const variantId = variantData.targetVariant.variantId;
      const currentImmunity = communityProfile.immunityProfile.variantSpecificImmunity.get(variantId) || 0;
      const newImmunity = Math.min(1.0, currentImmunity + crossImmunityPotential.immunityBoost);
      
      communityProfile.immunityProfile.variantSpecificImmunity.set(variantId, newImmunity);
      
      // Update cross-variant protection metrics
      communityProfile.immunityProfile.immunityBuilders.crossVariantBoosts++;
      
      // Record cross-immunity event
      const crossImmunityRecord = {
        timestamp: timestamp,
        sourceVariant: variantData.sourceVariant,
        targetVariant: variantData.targetVariant,
        immunityTransfer: crossImmunityPotential.immunityBoost,
        protectionLevel: newImmunity,
        variantSimilarity: variantAnalysis.similarity,
        immunityMechanism: crossImmunityPotential.mechanism
      };
      
      // Update community immunity trends
      communityProfile.immunityProfile.immunityTrends.push({
        timestamp: timestamp,
        event: 'cross_variant_immunity',
        immunityChange: crossImmunityPotential.immunityBoost,
        newLevel: communityProfile.immunityProfile.overallImmunityLevel,
        details: crossImmunityRecord
      });
      
      return {
        success: true,
        crossImmunityAnalysis: crossImmunityRecord,
        communityImpact: {
          newVariantImmunity: newImmunity,
          overallImmunityChange: crossImmunityPotential.overallBoost,
          protectionCoverage: this._calculateProtectionCoverage(communityProfile)
        },
        variantProtection: this._analyzeVariantProtection(communityProfile)
      };
      
    } catch (error) {
      console.error('Failed to track cross-variant immunity:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get global immunity statistics across all communities
   * @returns {Object} Global immunity metrics and trends
   */
  getGlobalImmunityStatistics() {
    try {
      const globalStats = {
        totalCommunities: this.communityProfiles.size,
        totalUsers: this.userImmunityProfiles.size,
        totalExposures: this.misinformationExposures.size,
        immunityDistribution: {
          high: 0,
          medium: 0,
          low: 0,
          vulnerable: 0
        },
        herdImmunityStatus: {
          achieved: 0,
          building: 0,
          vulnerable: 0
        },
        vaccinationCoverage: {
          totalVaccinations: 0,
          averageVaccinationsPerCommunity: 0,
          vaccinationEffectiveness: 0
        },
        resistanceMetrics: {
          overallResistanceRate: 0,
          successfulResistances: 0,
          failedResistances: 0
        },
        crossVariantProtection: {
          averageProtection: 0,
          strongProtection: 0,
          weakProtection: 0
        }
      };
      
      let totalImmunityLevel = 0;
      let totalResistanceRate = 0;
      let totalVaccinations = 0;
      let totalSuccessfulResistances = 0;
      let totalFailedResistances = 0;
      
      // Analyze each community
      for (const [communityId, profile] of this.communityProfiles) {
        const immunityLevel = profile.immunityProfile.overallImmunityLevel;
        totalImmunityLevel += immunityLevel;
        totalResistanceRate += profile.exposureHistory.resistanceRate;
        totalVaccinations += profile.immunityProfile.immunityBuilders.prebunkVaccinations;
        totalSuccessfulResistances += profile.exposureHistory.successfulResistance;
        totalFailedResistances += profile.exposureHistory.failedResistance;
        
        // Categorize immunity level
        if (immunityLevel >= 0.8) {
          globalStats.immunityDistribution.high++;
        } else if (immunityLevel >= 0.5) {
          globalStats.immunityDistribution.medium++;
        } else if (immunityLevel >= 0.3) {
          globalStats.immunityDistribution.low++;
        } else {
          globalStats.immunityDistribution.vulnerable++;
        }
        
        // Categorize herd immunity status
        const herdStatus = profile.communityMetrics.herdImmunityStatus;
        globalStats.herdImmunityStatus[herdStatus]++;
      }
      
      // Calculate averages
      const communityCount = this.communityProfiles.size;
      if (communityCount > 0) {
        globalStats.averageImmunityLevel = totalImmunityLevel / communityCount;
        globalStats.averageResistanceRate = totalResistanceRate / communityCount;
        globalStats.vaccinationCoverage.averageVaccinationsPerCommunity = totalVaccinations / communityCount;
        globalStats.vaccinationCoverage.totalVaccinations = totalVaccinations;
        
        const totalResistanceAttempts = totalSuccessfulResistances + totalFailedResistances;
        globalStats.resistanceMetrics.overallResistanceRate = totalResistanceAttempts > 0 ? 
          totalSuccessfulResistances / totalResistanceAttempts : 0;
        globalStats.resistanceMetrics.successfulResistances = totalSuccessfulResistances;
        globalStats.resistanceMetrics.failedResistances = totalFailedResistances;
      }
      
      // Calculate cross-variant protection
      globalStats.crossVariantProtection = this._calculateGlobalCrossVariantProtection();
      
      return {
        success: true,
        globalStatistics: globalStats,
        trends: this._analyzeGlobalImmunityTrends(),
        alerts: this._generateGlobalImmunityAlerts(globalStats),
        recommendations: this._generateGlobalRecommendations(globalStats),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to get global immunity statistics:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Private helper methods

  /**
   * Get or create user immunity profile
   * @private
   */
  _getOrCreateUserProfile(userId, communityId) {
    if (!this.userImmunityProfiles.has(userId)) {
      const timestamp = new Date().toISOString();
      const userProfile = {
        userId: userId,
        communityIds: new Set([communityId]),
        immunityProfile: {
          overallImmunityLevel: 0.0,
          variantSpecificImmunity: new Map(),
          immunityHistory: [],
          lastUpdated: timestamp
        },
        exposureHistory: {
          totalExposures: 0,
          successfulResistances: 0,
          failedResistances: 0,
          resistanceRate: 0.0,
          recentExposures: []
        },
        vaccinationHistory: [],
        createdAt: timestamp,
        lastUpdated: timestamp
      };
      
      this.userImmunityProfiles.set(userId, userProfile);
    } else {
      // Add community to user's communities
      this.userImmunityProfiles.get(userId).communityIds.add(communityId);
    }
    
    return this.userImmunityProfiles.get(userId);
  }

  /**
   * Analyze exposure context for immunity response
   * @private
   */
  _analyzeExposureContext(exposureData, userProfile, communityProfile) {
    const variantId = exposureData.variantType || 'unknown';
    const userImmunity = userProfile.immunityProfile.variantSpecificImmunity.get(variantId) || 0;
    const communityImmunity = communityProfile.immunityProfile.variantSpecificImmunity.get(variantId) || 0;
    
    // Calculate combined immunity level
    const combinedImmunity = Math.max(userImmunity, communityImmunity * 0.5); // Community provides 50% boost
    
    // Determine resistance success
    const resistanceThreshold = this.immunityThreshold;
    const resistanceSuccess = combinedImmunity >= resistanceThreshold;
    
    // Determine immunity source
    let immunitySource = 'none';
    if (userImmunity > 0.5) immunitySource = 'user_immunity';
    else if (communityImmunity > 0.5) immunitySource = 'community_immunity';
    else if (combinedImmunity > 0.3) immunitySource = 'combined_immunity';
    
    // Calculate immunity boost from exposure
    const immunityBoost = resistanceSuccess ? 0.1 : -0.05; // Success boosts, failure reduces
    
    return {
      hadPriorImmunity: combinedImmunity > 0.1,
      currentImmunityLevel: combinedImmunity,
      resistanceSuccess: resistanceSuccess,
      immunitySource: immunitySource,
      immunityBoost: immunityBoost,
      crossVariantProtection: this._calculateCrossVariantProtection(variantId, userProfile)
    };
  }

  /**
   * Update user immunity profile after exposure
   * @private
   */
  _updateUserImmunityProfile(userProfile, exposureRecord) {
    const timestamp = new Date().toISOString();
    const variantId = exposureRecord.misinformationData.variantType;
    
    // Update exposure history
    userProfile.exposureHistory.totalExposures++;
    if (exposureRecord.immunityResponse.resistanceSuccess) {
      userProfile.exposureHistory.successfulResistances++;
    } else {
      userProfile.exposureHistory.failedResistances++;
    }
    
    // Recalculate resistance rate
    userProfile.exposureHistory.resistanceRate = 
      userProfile.exposureHistory.successfulResistances / userProfile.exposureHistory.totalExposures;
    
    // Update variant-specific immunity
    const currentImmunity = userProfile.immunityProfile.variantSpecificImmunity.get(variantId) || 0;
    const newImmunity = Math.max(0, Math.min(1, currentImmunity + exposureRecord.immunityResponse.immunityBoost));
    userProfile.immunityProfile.variantSpecificImmunity.set(variantId, newImmunity);
    
    // Update overall immunity level (weighted average)
    const allImmunityLevels = Array.from(userProfile.immunityProfile.variantSpecificImmunity.values());
    userProfile.immunityProfile.overallImmunityLevel = allImmunityLevels.length > 0 ?
      allImmunityLevels.reduce((sum, level) => sum + level, 0) / allImmunityLevels.length : 0;
    
    // Add to immunity history
    userProfile.immunityProfile.immunityHistory.push({
      timestamp: timestamp,
      event: 'exposure',
      variantId: variantId,
      immunityChange: exposureRecord.immunityResponse.immunityBoost,
      newLevel: newImmunity,
      resistanceSuccess: exposureRecord.immunityResponse.resistanceSuccess
    });
    
    // Keep only recent exposures (last 30)
    userProfile.exposureHistory.recentExposures.push({
      timestamp: timestamp,
      exposureId: exposureRecord.exposureId,
      variantId: variantId,
      resistanceSuccess: exposureRecord.immunityResponse.resistanceSuccess
    });
    
    if (userProfile.exposureHistory.recentExposures.length > 30) {
      userProfile.exposureHistory.recentExposures.shift();
    }
    
    userProfile.lastUpdated = timestamp;
  }

  /**
   * Update community immunity profile after exposure
   * @private
   */
  _updateCommunityImmunityProfile(communityProfile, exposureRecord) {
    const timestamp = new Date().toISOString();
    const variantId = exposureRecord.misinformationData.variantType;
    
    // Update exposure history
    communityProfile.exposureHistory.totalExposures++;
    if (exposureRecord.immunityResponse.resistanceSuccess) {
      communityProfile.exposureHistory.successfulResistance++;
    } else {
      communityProfile.exposureHistory.failedResistance++;
    }
    
    // Recalculate resistance rate
    communityProfile.exposureHistory.resistanceRate = 
      communityProfile.exposureHistory.successfulResistance / communityProfile.exposureHistory.totalExposures;
    
    // Update variant-specific immunity (community level)
    const currentImmunity = communityProfile.immunityProfile.variantSpecificImmunity.get(variantId) || 0;
    const immunityBoost = exposureRecord.immunityResponse.immunityBoost * 0.1; // Community gets 10% of individual boost
    const newImmunity = Math.max(0, Math.min(1, currentImmunity + immunityBoost));
    communityProfile.immunityProfile.variantSpecificImmunity.set(variantId, newImmunity);
    
    // Update overall community immunity
    const allImmunityLevels = Array.from(communityProfile.immunityProfile.variantSpecificImmunity.values());
    communityProfile.immunityProfile.overallImmunityLevel = allImmunityLevels.length > 0 ?
      allImmunityLevels.reduce((sum, level) => sum + level, 0) / allImmunityLevels.length : 0;
    
    // Update herd immunity status
    this._updateHerdImmunityStatus(communityProfile);
    
    // Add to immunity trends
    communityProfile.immunityProfile.immunityTrends.push({
      timestamp: timestamp,
      event: 'member_exposure',
      immunityChange: immunityBoost,
      newLevel: communityProfile.immunityProfile.overallImmunityLevel,
      resistanceSuccess: exposureRecord.immunityResponse.resistanceSuccess,
      variantId: variantId
    });
    
    // Keep only recent trends (last 100)
    if (communityProfile.immunityProfile.immunityTrends.length > 100) {
      communityProfile.immunityProfile.immunityTrends.shift();
    }
    
    communityProfile.lastUpdated = timestamp;
  }

  /**
   * Calculate immunity impact from exposure
   * @private
   */
  _calculateImmunityImpact(exposureRecord, userProfile, communityProfile) {
    return {
      userImpact: {
        immunityChange: exposureRecord.immunityResponse.immunityBoost,
        newImmunityLevel: userProfile.immunityProfile.overallImmunityLevel,
        resistanceImprovement: exposureRecord.immunityResponse.resistanceSuccess ? 0.05 : -0.02
      },
      communityImpact: {
        immunityChange: exposureRecord.immunityResponse.immunityBoost * 0.1,
        newImmunityLevel: communityProfile.immunityProfile.overallImmunityLevel,
        herdImmunityProgress: this._calculateHerdImmunityProgress(communityProfile)
      },
      crossVariantImpact: {
        protectionBoost: exposureRecord.immunityResponse.crossVariantProtection,
        variantsCovered: this._countProtectedVariants(userProfile)
      }
    };
  }

  /**
   * Generate immunity recommendations based on exposure
   * @private
   */
  _generateImmunityRecommendations(exposureRecord, communityProfile) {
    const recommendations = [];
    
    // User-specific recommendations
    if (!exposureRecord.immunityResponse.resistanceSuccess) {
      recommendations.push({
        type: 'user_education',
        priority: 'high',
        message: 'Consider fact-checking training to improve misinformation resistance',
        action: 'enroll_in_media_literacy'
      });
    }
    
    // Community-specific recommendations
    if (communityProfile.immunityProfile.overallImmunityLevel < 0.5) {
      recommendations.push({
        type: 'community_vaccination',
        priority: 'high',
        message: 'Community needs prebunk vaccination campaign',
        action: 'launch_prebunk_campaign'
      });
    }
    
    // Variant-specific recommendations
    const variantId = exposureRecord.misinformationData.variantType;
    const variantImmunity = communityProfile.immunityProfile.variantSpecificImmunity.get(variantId) || 0;
    
    if (variantImmunity < 0.3) {
      recommendations.push({
        type: 'variant_specific_protection',
        priority: 'medium',
        message: `Low immunity to ${variantId} variant detected`,
        action: 'create_variant_specific_prebunk'
      });
    }
    
    return recommendations;
  }

  /**
   * Apply vaccination immunity boost
   * @private
   */
  _applyVaccinationBoost(userProfile, vaccinationRecord) {
    const timestamp = new Date().toISOString();
    const immunityBoost = vaccinationRecord.immunityBoost;
    
    // Apply base immunity increase
    const currentOverallImmunity = userProfile.immunityProfile.overallImmunityLevel;
    const newOverallImmunity = Math.min(1.0, currentOverallImmunity + immunityBoost.baseImmunityIncrease);
    userProfile.immunityProfile.overallImmunityLevel = newOverallImmunity;
    
    // Apply variant-specific boosts
    for (const variantType of vaccinationRecord.targetMisinformation.variantTypes) {
      const currentVariantImmunity = userProfile.immunityProfile.variantSpecificImmunity.get(variantType) || 0;
      const newVariantImmunity = Math.min(1.0, currentVariantImmunity + immunityBoost.variantSpecificBoost);
      userProfile.immunityProfile.variantSpecificImmunity.set(variantType, newVariantImmunity);
    }
    
    // Add vaccination to history
    userProfile.vaccinationHistory.push({
      timestamp: timestamp,
      vaccinationId: vaccinationRecord.vaccinationId,
      immunityBoost: immunityBoost,
      targetVariants: vaccinationRecord.targetMisinformation.variantTypes
    });
    
    // Add to immunity history
    userProfile.immunityProfile.immunityHistory.push({
      timestamp: timestamp,
      event: 'vaccination',
      immunityChange: immunityBoost.baseImmunityIncrease,
      newLevel: newOverallImmunity,
      vaccinationType: vaccinationRecord.vaccinationType
    });
    
    userProfile.lastUpdated = timestamp;
    
    return {
      overallImmunityIncrease: immunityBoost.baseImmunityIncrease,
      variantSpecificIncreases: vaccinationRecord.targetMisinformation.variantTypes.map(variant => ({
        variant: variant,
        increase: immunityBoost.variantSpecificBoost
      })),
      newOverallLevel: newOverallImmunity,
      duration: immunityBoost.duration
    };
  }

  /**
   * Update herd immunity status for community
   * @private
   */
  _updateHerdImmunityStatus(communityProfile) {
    const overallImmunity = communityProfile.immunityProfile.overallImmunityLevel;
    const resistanceRate = communityProfile.exposureHistory.resistanceRate;
    
    if (overallImmunity >= 0.8 && resistanceRate >= 0.8) {
      communityProfile.communityMetrics.herdImmunityStatus = 'achieved';
    } else if (overallImmunity >= 0.5 && resistanceRate >= 0.6) {
      communityProfile.communityMetrics.herdImmunityStatus = 'building';
    } else {
      communityProfile.communityMetrics.herdImmunityStatus = 'vulnerable';
    }
  }

  /**
   * Count immune members in community
   * @private
   */
  _countImmuneMembers(communityId) {
    let immuneCount = 0;
    
    for (const [userId, userProfile] of this.userImmunityProfiles) {
      if (userProfile.communityIds.has(communityId) && 
          userProfile.immunityProfile.overallImmunityLevel >= this.immunityThreshold) {
        immuneCount++;
      }
    }
    
    return immuneCount;
  }

  /**
   * Calculate vaccination effectiveness
   * @private
   */
  _calculateVaccinationEffectiveness(vaccinationRecord, communityProfile) {
    // This would be calculated based on subsequent exposure resistance
    // For now, return estimated effectiveness based on vaccination parameters
    const baseEffectiveness = 0.75; // 75% base effectiveness
    const variantSpecificBonus = vaccinationRecord.targetMisinformation.variantTypes.length * 0.05;
    const communityBonus = communityProfile.immunityProfile.overallImmunityLevel * 0.1;
    
    return Math.min(0.95, baseEffectiveness + variantSpecificBonus + communityBonus);
  }

  /**
   * Calculate community immunity metrics
   * @private
   */
  _calculateCommunityImmunityMetrics(communityProfile) {
    return {
      immunityLevel: communityProfile.immunityProfile.overallImmunityLevel,
      resistanceRate: communityProfile.exposureHistory.resistanceRate,
      vaccinationCoverage: communityProfile.immunityProfile.immunityBuilders.prebunkVaccinations,
      crossVariantProtection: this._calculateAverageCrossVariantProtection(communityProfile),
      immunityTrend: this._calculateImmunityTrend(communityProfile),
      vulnerabilityScore: this._calculateVulnerabilityScore(communityProfile)
    };
  }

  /**
   * Update global immunity metrics
   * @private
   */
  _updateGlobalImmunityMetrics() {
    this.immunityEffectiveness.totalCommunities = this.communityProfiles.size;
    
    let totalImmunity = 0;
    let highImmunityCount = 0;
    let vulnerableCount = 0;
    
    for (const [communityId, profile] of this.communityProfiles) {
      const immunity = profile.immunityProfile.overallImmunityLevel;
      totalImmunity += immunity;
      
      if (immunity >= 0.8) highImmunityCount++;
      if (immunity < 0.3) vulnerableCount++;
    }
    
    this.immunityEffectiveness.averageImmunityLevel = this.communityProfiles.size > 0 ? 
      totalImmunity / this.communityProfiles.size : 0;
    this.immunityEffectiveness.highImmunityCommunities = highImmunityCount;
    this.immunityEffectiveness.vulnerableCommunities = vulnerableCount;
  }

  /**
   * Calculate cross-variant protection for user
   * @private
   */
  _calculateCrossVariantProtection(variantId, userProfile) {
    // Calculate protection based on immunity to related variants
    let crossProtection = 0;
    let relatedVariants = 0;
    
    for (const [otherVariantId, immunity] of userProfile.immunityProfile.variantSpecificImmunity) {
      if (otherVariantId !== variantId && this._areVariantsRelated(variantId, otherVariantId)) {
        crossProtection += immunity * 0.5; // 50% cross-protection
        relatedVariants++;
      }
    }
    
    return relatedVariants > 0 ? crossProtection / relatedVariants : 0;
  }

  /**
   * Check if variants are related for cross-immunity
   * @private
   */
  _areVariantsRelated(variant1, variant2) {
    // Simple heuristic - variants with similar names or patterns are related
    if (!variant1 || !variant2) return false;
    
    const similarity = this._calculateStringSimilarity(variant1, variant2);
    return similarity > 0.6; // 60% similarity threshold
  }

  /**
   * Calculate string similarity for variant relationship
   * @private
   */
  _calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this._calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between strings
   * @private
   */
  _calculateEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate herd immunity progress
   * @private
   */
  _calculateHerdImmunityProgress(communityProfile) {
    const currentLevel = communityProfile.immunityProfile.overallImmunityLevel;
    const targetLevel = 0.8; // 80% for herd immunity
    return Math.min(1.0, currentLevel / targetLevel);
  }

  /**
   * Analyze variant relationships
   * @private
   */
  _analyzeVariantRelationships(variantData) {
    const sourceVariant = variantData.sourceVariant;
    const targetVariant = variantData.targetVariant;
    
    // Calculate similarity based on variant types and family IDs
    let similarity = 0;
    
    if (sourceVariant.familyId === targetVariant.familyId) {
      similarity += 0.5; // Same family = 50% similarity
    }
    
    if (sourceVariant.variantType === targetVariant.variantType) {
      similarity += 0.3; // Same type = 30% similarity
    }
    
    // Add string similarity for variant IDs
    const stringSimilarity = this._calculateStringSimilarity(
      sourceVariant.variantId, 
      targetVariant.variantId
    );
    similarity += stringSimilarity * 0.2; // String similarity = 20% weight
    
    return {
      similarity: Math.min(1.0, similarity),
      relationship: similarity > 0.7 ? 'closely_related' : 
                   similarity > 0.4 ? 'moderately_related' : 'distantly_related'
    };
  }

  /**
   * Calculate cross-immunity potential between variants
   * @private
   */
  _calculateCrossImmunityPotential(sourceVariant, targetVariant, communityProfile) {
    const variantAnalysis = this._analyzeVariantRelationships({ sourceVariant, targetVariant });
    
    // Base immunity transfer based on variant similarity
    const baseTransfer = variantAnalysis.similarity * 0.3; // Max 30% transfer
    
    // Community immunity level affects transfer efficiency
    const communityBonus = communityProfile.immunityProfile.overallImmunityLevel * 0.1;
    
    const immunityBoost = Math.min(0.4, baseTransfer + communityBonus); // Max 40% boost
    const overallBoost = immunityBoost * 0.5; // Overall immunity gets 50% of variant boost
    
    return {
      immunityBoost: immunityBoost,
      overallBoost: overallBoost,
      mechanism: variantAnalysis.relationship,
      transferEfficiency: variantAnalysis.similarity
    };
  }

  /**
   * Calculate average cross-variant protection for community
   * @private
   */
  _calculateAverageCrossVariantProtection(communityProfile) {
    const variantImmunities = Array.from(communityProfile.immunityProfile.variantSpecificImmunity.values());
    
    if (variantImmunities.length === 0) return 0;
    
    // Calculate cross-protection as average of all variant immunities
    const totalProtection = variantImmunities.reduce((sum, immunity) => sum + immunity, 0);
    return totalProtection / variantImmunities.length;
  }

  /**
   * Calculate immunity trend for community
   * @private
   */
  _calculateImmunityTrend(communityProfile) {
    const trends = communityProfile.immunityProfile.immunityTrends;
    
    if (trends.length < 2) return 'insufficient_data';
    
    // Look at last 10 trends
    const recentTrends = trends.slice(-10);
    const immunityChanges = recentTrends.map(trend => trend.immunityChange || 0);
    
    const averageChange = immunityChanges.reduce((sum, change) => sum + change, 0) / immunityChanges.length;
    
    if (averageChange > 0.01) return 'improving';
    if (averageChange < -0.01) return 'declining';
    return 'stable';
  }

  /**
   * Calculate vulnerability score for community
   * @private
   */
  _calculateVulnerabilityScore(communityProfile) {
    let vulnerabilityScore = 0;
    
    // Base vulnerability from immunity level (inverted)
    vulnerabilityScore += (1 - communityProfile.immunityProfile.overallImmunityLevel) * 0.4;
    
    // Resistance rate affects vulnerability
    vulnerabilityScore += (1 - communityProfile.exposureHistory.resistanceRate) * 0.3;
    
    // Community characteristics
    const riskLevel = communityProfile.characteristics.riskLevel;
    const riskMultiplier = {
      'very_high': 0.3,
      'high': 0.2,
      'medium': 0.1,
      'low': 0.05,
      'very_low': 0.0
    };
    vulnerabilityScore += riskMultiplier[riskLevel] || 0.1;
    
    return Math.min(1.0, vulnerabilityScore);
  }

  /**
   * Analyze immunity trends for community
   * @private
   */
  _analyzeImmunityTrends(communityProfile) {
    const trends = communityProfile.immunityProfile.immunityTrends;
    
    if (trends.length === 0) {
      return {
        trend: 'no_data',
        direction: 'unknown',
        velocity: 0,
        confidence: 0
      };
    }
    
    // Calculate trend direction and velocity
    const recentTrends = trends.slice(-20); // Last 20 events
    const immunityChanges = recentTrends.map(trend => trend.immunityChange || 0);
    
    const totalChange = immunityChanges.reduce((sum, change) => sum + change, 0);
    const averageChange = totalChange / immunityChanges.length;
    const velocity = Math.abs(averageChange);
    
    let direction = 'stable';
    if (averageChange > 0.005) direction = 'improving';
    if (averageChange < -0.005) direction = 'declining';
    
    return {
      trend: direction,
      direction: direction,
      velocity: velocity,
      confidence: Math.min(1.0, recentTrends.length / 20),
      totalChange: totalChange,
      recentEvents: recentTrends.length
    };
  }

  /**
   * Assess community vulnerability
   * @private
   */
  _assessCommunityVulnerability(communityProfile) {
    const vulnerabilityScore = this._calculateVulnerabilityScore(communityProfile);
    const immunityLevel = communityProfile.immunityProfile.overallImmunityLevel;
    const resistanceRate = communityProfile.exposureHistory.resistanceRate;
    
    let riskLevel = 'medium';
    if (vulnerabilityScore > 0.7) riskLevel = 'very_high';
    else if (vulnerabilityScore > 0.5) riskLevel = 'high';
    else if (vulnerabilityScore > 0.3) riskLevel = 'medium';
    else if (vulnerabilityScore > 0.1) riskLevel = 'low';
    else riskLevel = 'very_low';
    
    return {
      vulnerabilityScore: vulnerabilityScore,
      riskLevel: riskLevel,
      immunityGaps: this._identifyImmunityGaps(communityProfile),
      recommendations: this._generateVulnerabilityRecommendations(vulnerabilityScore, communityProfile)
    };
  }

  /**
   * Generate community recommendations
   * @private
   */
  _generateCommunityRecommendations(communityProfile) {
    const recommendations = [];
    const immunityLevel = communityProfile.immunityProfile.overallImmunityLevel;
    const resistanceRate = communityProfile.exposureHistory.resistanceRate;
    const herdImmunityStatus = communityProfile.communityMetrics.herdImmunityStatus;
    
    // Immunity level recommendations
    if (immunityLevel < 0.3) {
      recommendations.push({
        type: 'urgent_intervention',
        priority: 'critical',
        message: 'Community immunity critically low - immediate vaccination campaign needed',
        actions: ['mass_prebunk_campaign', 'expert_education', 'community_training']
      });
    } else if (immunityLevel < 0.6) {
      recommendations.push({
        type: 'immunity_building',
        priority: 'high',
        message: 'Community needs immunity strengthening programs',
        actions: ['targeted_prebunks', 'peer_education', 'awareness_campaigns']
      });
    }
    
    // Resistance rate recommendations
    if (resistanceRate < 0.5) {
      recommendations.push({
        type: 'resistance_training',
        priority: 'high',
        message: 'Low misinformation resistance - critical thinking training needed',
        actions: ['media_literacy_training', 'fact_checking_workshops', 'source_verification_education']
      });
    }
    
    // Herd immunity recommendations
    if (herdImmunityStatus === 'vulnerable') {
      recommendations.push({
        type: 'herd_immunity_building',
        priority: 'medium',
        message: 'Community vulnerable to misinformation outbreaks',
        actions: ['community_vaccination_drive', 'peer_immunity_networks', 'expert_verification_system']
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze variant protection for community
   * @private
   */
  _analyzeVariantProtection(communityProfile) {
    const variantImmunities = communityProfile.immunityProfile.variantSpecificImmunity;
    const protectionLevels = [];
    
    for (const [variantId, immunityLevel] of variantImmunities) {
      protectionLevels.push({
        variant: variantId,
        protectionLevel: immunityLevel,
        protectionStatus: immunityLevel >= 0.8 ? 'strong' : 
                        immunityLevel >= 0.5 ? 'moderate' : 
                        immunityLevel >= 0.3 ? 'weak' : 'vulnerable'
      });
    }
    
    // Sort by protection level (strongest first)
    protectionLevels.sort((a, b) => b.protectionLevel - a.protectionLevel);
    
    return {
      totalVariants: protectionLevels.length,
      strongProtection: protectionLevels.filter(p => p.protectionStatus === 'strong').length,
      moderateProtection: protectionLevels.filter(p => p.protectionStatus === 'moderate').length,
      weakProtection: protectionLevels.filter(p => p.protectionStatus === 'weak').length,
      vulnerableVariants: protectionLevels.filter(p => p.protectionStatus === 'vulnerable').length,
      protectionDetails: protectionLevels,
      averageProtection: protectionLevels.length > 0 ? 
        protectionLevels.reduce((sum, p) => sum + p.protectionLevel, 0) / protectionLevels.length : 0
    };
  }

  /**
   * Calculate protection coverage for community
   * @private
   */
  _calculateProtectionCoverage(communityProfile) {
    const totalMembers = communityProfile.communityMetrics.activeMembers;
    const immuneMembers = communityProfile.communityMetrics.immuneMembers;
    
    return {
      totalMembers: totalMembers,
      protectedMembers: immuneMembers,
      coveragePercentage: totalMembers > 0 ? (immuneMembers / totalMembers) * 100 : 0,
      herdImmunityThreshold: totalMembers * 0.8, // 80% threshold
      membersNeededForHerdImmunity: Math.max(0, (totalMembers * 0.8) - immuneMembers)
    };
  }

  /**
   * Calculate global cross-variant protection
   * @private
   */
  _calculateGlobalCrossVariantProtection() {
    let totalProtection = 0;
    let strongProtectionCount = 0;
    let weakProtectionCount = 0;
    let communityCount = 0;
    
    for (const [communityId, profile] of this.communityProfiles) {
      const variantProtection = this._analyzeVariantProtection(profile);
      totalProtection += variantProtection.averageProtection;
      strongProtectionCount += variantProtection.strongProtection;
      weakProtectionCount += variantProtection.vulnerableVariants;
      communityCount++;
    }
    
    return {
      averageProtection: communityCount > 0 ? totalProtection / communityCount : 0,
      strongProtection: strongProtectionCount,
      weakProtection: weakProtectionCount,
      protectionDistribution: {
        strong: strongProtectionCount,
        moderate: Math.max(0, (communityCount * 2) - strongProtectionCount - weakProtectionCount),
        weak: weakProtectionCount
      }
    };
  }

  /**
   * Analyze global immunity trends
   * @private
   */
  _analyzeGlobalImmunityTrends() {
    const globalTrends = {
      overallTrend: 'stable',
      improvingCommunities: 0,
      decliningCommunities: 0,
      stableCommunities: 0,
      averageImmunityVelocity: 0
    };
    
    let totalVelocity = 0;
    
    for (const [communityId, profile] of this.communityProfiles) {
      const communityTrends = this._analyzeImmunityTrends(profile);
      
      if (communityTrends.direction === 'improving') {
        globalTrends.improvingCommunities++;
      } else if (communityTrends.direction === 'declining') {
        globalTrends.decliningCommunities++;
      } else {
        globalTrends.stableCommunities++;
      }
      
      totalVelocity += communityTrends.velocity;
    }
    
    globalTrends.averageImmunityVelocity = this.communityProfiles.size > 0 ? 
      totalVelocity / this.communityProfiles.size : 0;
    
    // Determine overall trend
    if (globalTrends.improvingCommunities > globalTrends.decliningCommunities) {
      globalTrends.overallTrend = 'improving';
    } else if (globalTrends.decliningCommunities > globalTrends.improvingCommunities) {
      globalTrends.overallTrend = 'declining';
    }
    
    return globalTrends;
  }

  /**
   * Generate global immunity alerts
   * @private
   */
  _generateGlobalImmunityAlerts(globalStats) {
    const alerts = [];
    
    // Check for vulnerable communities
    if (globalStats.immunityDistribution.vulnerable > globalStats.totalCommunities * 0.3) {
      alerts.push({
        type: 'high_vulnerability',
        severity: 'critical',
        message: `${globalStats.immunityDistribution.vulnerable} communities are highly vulnerable to misinformation`,
        action: 'immediate_intervention_needed'
      });
    }
    
    // Check resistance rate
    if (globalStats.resistanceMetrics.overallResistanceRate < 0.5) {
      alerts.push({
        type: 'low_resistance',
        severity: 'high',
        message: 'Global misinformation resistance rate below 50%',
        action: 'strengthen_community_defenses'
      });
    }
    
    // Check herd immunity progress
    if (globalStats.herdImmunityStatus.achieved < globalStats.totalCommunities * 0.2) {
      alerts.push({
        type: 'herd_immunity_gap',
        severity: 'medium',
        message: 'Less than 20% of communities have achieved herd immunity',
        action: 'accelerate_vaccination_campaigns'
      });
    }
    
    return alerts;
  }

  /**
   * Generate global recommendations
   * @private
   */
  _generateGlobalRecommendations(globalStats) {
    const recommendations = [];
    
    // Vaccination coverage recommendations
    if (globalStats.vaccinationCoverage.totalVaccinations < globalStats.totalUsers * 0.5) {
      recommendations.push({
        type: 'increase_vaccination',
        priority: 'high',
        message: 'Global vaccination coverage below 50% - scale up prebunk campaigns',
        targetMetric: 'vaccination_coverage',
        targetValue: 0.8
      });
    }
    
    // Community support recommendations
    if (globalStats.immunityDistribution.vulnerable > 0) {
      recommendations.push({
        type: 'support_vulnerable_communities',
        priority: 'critical',
        message: `${globalStats.immunityDistribution.vulnerable} communities need immediate support`,
        targetMetric: 'vulnerable_communities',
        targetValue: 0
      });
    }
    
    // Cross-variant protection recommendations
    if (globalStats.crossVariantProtection.averageProtection < 0.6) {
      recommendations.push({
        type: 'improve_cross_variant_protection',
        priority: 'medium',
        message: 'Cross-variant protection needs strengthening',
        targetMetric: 'cross_variant_protection',
        targetValue: 0.8
      });
    }
    
    return recommendations;
  }

  /**
   * Identify immunity gaps in community
   * @private
   */
  _identifyImmunityGaps(communityProfile) {
    const gaps = [];
    const variantImmunities = communityProfile.immunityProfile.variantSpecificImmunity;
    
    // Check for variant-specific gaps
    for (const [variantId, immunityLevel] of variantImmunities) {
      if (immunityLevel < 0.3) {
        gaps.push({
          type: 'variant_vulnerability',
          variant: variantId,
          immunityLevel: immunityLevel,
          severity: 'high'
        });
      }
    }
    
    // Check for overall immunity gaps
    if (communityProfile.immunityProfile.overallImmunityLevel < 0.5) {
      gaps.push({
        type: 'overall_immunity_gap',
        immunityLevel: communityProfile.immunityProfile.overallImmunityLevel,
        severity: 'critical'
      });
    }
    
    return gaps;
  }

  /**
   * Generate vulnerability recommendations
   * @private
   */
  _generateVulnerabilityRecommendations(vulnerabilityScore, communityProfile) {
    const recommendations = [];
    
    if (vulnerabilityScore > 0.7) {
      recommendations.push({
        type: 'emergency_intervention',
        message: 'Community requires immediate emergency intervention',
        actions: ['crisis_response_team', 'emergency_prebunks', 'expert_deployment']
      });
    } else if (vulnerabilityScore > 0.5) {
      recommendations.push({
        type: 'intensive_support',
        message: 'Community needs intensive immunity building support',
        actions: ['targeted_education', 'peer_networks', 'regular_monitoring']
      });
    } else if (vulnerabilityScore > 0.3) {
      recommendations.push({
        type: 'preventive_measures',
        message: 'Implement preventive measures to maintain immunity',
        actions: ['awareness_campaigns', 'skill_building', 'community_engagement']
      });
    }
    
    return recommendations;
  }

  /**
   * Count protected variants for user
   * @private
   */
  _countProtectedVariants(userProfile) {
    let protectedCount = 0;
    
    for (const [variantId, immunityLevel] of userProfile.immunityProfile.variantSpecificImmunity) {
      if (immunityLevel >= this.immunityThreshold) {
        protectedCount++;
      }
    }
    
    return protectedCount;
  }
}

module.exports = CommunityImmunityService;
