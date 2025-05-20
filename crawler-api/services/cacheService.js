class CacheService {
  constructor() {
    this.urlCache = new Map();
  }

  canProcessUrl(url) {
    const count = this.urlCache.get(url) || 0;
    return count < 2;
  }

  incrementUrlCount(url) {
    const count = this.urlCache.get(url) || 0;
    this.urlCache.set(url, count + 1);
  }

  getUrlCount(url) {
    return this.urlCache.get(url) || 0;
  }
}

module.exports = new CacheService(); 