(function () {
  const NodeCache = require('node-cache');
  
  
  class Cache {
    constructor(ttlSeconds) {
      this.cache = new NodeCache({stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false});
    }
    
    get(key, getFunction) {
      const value = this.cache.get(key);
      if (value) {
        return Promise.resolve(value);
      }
      
      return getFunction().then((result) => {
        this.cache.set(key, result);
        return result;
      });
    }
  }
  
  module.exports = Cache;
  
})();
