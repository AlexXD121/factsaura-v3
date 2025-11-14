// Service Registry
// Singleton pattern for shared service instances
const MisinformationFamilyTreeService = require('./misinformationFamilyTreeService');

class ServiceRegistry {
  constructor() {
    this._familyTreeService = null;
  }

  getFamilyTreeService() {
    if (!this._familyTreeService) {
      this._familyTreeService = new MisinformationFamilyTreeService();
    }
    return this._familyTreeService;
  }
}

// Export singleton instance
const serviceRegistry = new ServiceRegistry();
module.exports = serviceRegistry;