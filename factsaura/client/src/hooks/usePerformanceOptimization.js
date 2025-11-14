import { useEffect, useCallback, useRef } from 'react';

/**
 * Performance optimization hook for smooth 60FPS experience
 */
export const usePerformanceOptimization = () => {
  const frameRef = useRef();
  const lastFrameTime = useRef(0);
  const fpsCounter = useRef(0);
  const fpsHistory = useRef([]);

  // Debounce function for expensive operations
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef();
    
    return useCallback((...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
  };

  // Throttle function for scroll/resize events
  const useThrottle = (callback, limit) => {
    const inThrottle = useRef(false);
    
    return useCallback((...args) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => inThrottle.current = false, limit);
      }
    }, [callback, limit]);
  };

  // Request animation frame wrapper
  const useAnimationFrame = (callback) => {
    const requestRef = useRef();
    
    const animate = useCallback((time) => {
      callback(time);
      requestRef.current = requestAnimationFrame(animate);
    }, [callback]);
    
    useEffect(() => {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }, [animate]);
  };

  // FPS monitoring
  const monitorFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;
    
    if (delta > 0) {
      const fps = 1000 / delta;
      fpsHistory.current.push(fps);
      
      // Keep only last 60 frames
      if (fpsHistory.current.length > 60) {
        fpsHistory.current.shift();
      }
      
      fpsCounter.current = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
    }
  }, []);

  // Intersection Observer for lazy loading
  const useIntersectionObserver = (options = {}) => {
    const elementRef = useRef();
    const observerRef = useRef();
    
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && options.onIntersect) {
            options.onIntersect(entry);
          }
        });
      }, {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      });
      
      observerRef.current.observe(element);
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [options]);
    
    return elementRef;
  };

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }, []);

  // Optimize images for performance
  const optimizeImage = useCallback((src, options = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // Create optimized image URL (you can integrate with image CDN)
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('f', format);
    
    return `${src}?${params.toString()}`;
  }, []);

  // Preload critical resources
  const preloadResource = useCallback((href, as = 'fetch', crossorigin = 'anonymous') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  // Virtual scrolling for large lists
  const useVirtualScrolling = (items, itemHeight, containerHeight) => {
    const scrollTop = useRef(0);
    const visibleStart = Math.floor(scrollTop.current / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    const visibleItems = items.slice(visibleStart, visibleEnd);
    const offsetY = visibleStart * itemHeight;
    
    const handleScroll = useThrottle((e) => {
      scrollTop.current = e.target.scrollTop;
    }, 16); // ~60fps
    
    return {
      visibleItems,
      offsetY,
      handleScroll,
      totalHeight: items.length * itemHeight
    };
  };

  // Bundle splitting helper
  const loadComponent = useCallback(async (importFn) => {
    try {
      const module = await importFn();
      return module.default || module;
    } catch (error) {
      console.error('Failed to load component:', error);
      throw error;
    }
  }, []);

  return {
    useDebounce,
    useThrottle,
    useAnimationFrame,
    useIntersectionObserver,
    useVirtualScrolling,
    monitorFPS,
    getMemoryUsage,
    optimizeImage,
    preloadResource,
    loadComponent,
    getCurrentFPS: () => Math.round(fpsCounter.current)
  };
};

/**
 * Hook for optimizing React renders
 */
export const useRenderOptimization = () => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    const renderTime = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
  });
  
  const memoizedCallback = useCallback((fn, deps) => {
    return useCallback(fn, deps);
  }, []);
  
  const memoizedValue = useCallback((fn, deps) => {
    return useMemo(fn, deps);
  }, []);
  
  return {
    renderCount: renderCount.current,
    memoizedCallback,
    memoizedValue
  };
};

/**
 * Hook for network optimization
 */
export const useNetworkOptimization = () => {
  const requestCache = useRef(new Map());
  const pendingRequests = useRef(new Map());
  
  // Request deduplication
  const deduplicateRequest = useCallback(async (key, requestFn) => {
    // Return cached result if available
    if (requestCache.current.has(key)) {
      return requestCache.current.get(key);
    }
    
    // Return pending request if in progress
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }
    
    // Make new request
    const promise = requestFn().then(result => {
      requestCache.current.set(key, result);
      pendingRequests.current.delete(key);
      return result;
    }).catch(error => {
      pendingRequests.current.delete(key);
      throw error;
    });
    
    pendingRequests.current.set(key, promise);
    return promise;
  }, []);
  
  // Clear cache
  const clearCache = useCallback((key) => {
    if (key) {
      requestCache.current.delete(key);
    } else {
      requestCache.current.clear();
    }
  }, []);
  
  // Prefetch data
  const prefetch = useCallback((key, requestFn) => {
    if (!requestCache.current.has(key) && !pendingRequests.current.has(key)) {
      deduplicateRequest(key, requestFn).catch(() => {
        // Ignore prefetch errors
      });
    }
  }, [deduplicateRequest]);
  
  return {
    deduplicateRequest,
    clearCache,
    prefetch,
    getCacheSize: () => requestCache.current.size
  };
};

export default usePerformanceOptimization;