/**
 * Comprehensive monitoring and error tracking system
 * Provides performance monitoring, error tracking, and user analytics
 */

interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

interface ErrorReport {
  id: string;
  timestamp: number;
  error: Error;
  userAgent: string;
  url: string;
  userId?: string;
  context?: Record<string, any>;
  stack?: string;
  componentStack?: string;
}

interface UserEvent {
  type: 'click' | 'navigation' | 'api_call' | 'error' | 'performance';
  timestamp: number;
  data: Record<string, any>;
  userId?: string;
}

class MonitoringService {
  private errors: ErrorReport[] = [];
  private events: UserEvent[] = [];
  private metrics: PerformanceMetrics[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' ||
                    (process.env.NODE_ENV === 'development' && window.localStorage.getItem('monitoring_debug') === 'true');

    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Performance monitoring
    this.trackPageLoad();
    this.trackApiCalls();

    // Error monitoring
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    // Memory monitoring
    if ('performance' in window && 'memory' in (window.performance as any)) {
      setInterval(this.trackMemoryUsage.bind(this), 30000); // Every 30 seconds
    }
  }

  private trackPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetrics({
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            apiResponseTime: 0,
            renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          });
        }
      });
    }
  }

  private trackApiCalls() {
    // Monkey patch fetch to track API performance
    if (typeof window !== 'undefined' && 'fetch' in window) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();

          this.recordMetrics({
            loadTime: 0,
            apiResponseTime: endTime - startTime,
            renderTime: 0,
          });

          return response;
        } catch (error) {
          const endTime = performance.now();
          this.recordError(error as Error, {
            apiCall: true,
            url: typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : args[0].toString()),
            duration: endTime - startTime,
          });
          throw error;
        }
      };
    }
  }

  private trackMemoryUsage() {
    if ('performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      this.recordMetrics({
        loadTime: 0,
        apiResponseTime: 0,
        renderTime: 0,
        memoryUsage: memory.usedJSHeapSize,
      });
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    this.recordError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      global: true,
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.recordError(error, {
      unhandledPromise: true,
    });
  }

  /**
   * Record an error with context
   */
  recordError(error: Error, context?: Record<string, any>) {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      id: this.generateId(),
      timestamp: Date.now(),
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
      stack: error.stack,
    };

    this.errors.push(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error recorded:', errorReport);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(errorReport);
    }

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors.shift();
    }
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics) {
    if (!this.isEnabled) return;

    this.metrics.push({
      ...metrics,
      bundleSize: this.getBundleSize(),
    });

    // Keep only last 50 metrics in memory
    if (this.metrics.length > 50) {
      this.metrics.shift();
    }
  }

  /**
   * Record user events for analytics
   */
  recordEvent(type: UserEvent['type'], data: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: UserEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    // Keep only last 200 events in memory
    if (this.events.length > 200) {
      this.events.shift();
    }
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary() {
    if (this.metrics.length === 0) return null;

    const latest = this.metrics[this.metrics.length - 1];
    const avgLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length;
    const avgApiTime = this.metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / this.metrics.length;

    return {
      current: latest,
      averages: {
        loadTime: avgLoadTime,
        apiResponseTime: avgApiTime,
      },
      totalErrors: this.errors.length,
      recentErrors: this.errors.filter(e => Date.now() - e.timestamp < 300000).length, // Last 5 minutes
    };
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10) {
    return this.errors
      .slice(-limit)
      .reverse()
      .map(error => ({
        id: error.id,
        message: error.error.message,
        timestamp: error.timestamp,
        url: error.url,
        context: error.context,
      }));
  }

  /**
   * Clear all monitoring data
   */
  clearData() {
    this.errors = [];
    this.events = [];
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled && typeof window !== 'undefined') {
      window.localStorage.setItem('monitoring_debug', 'true');
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem('monitoring_debug');
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getBundleSize(): number | undefined {
    // This would typically be set during build time
    return (window as any).__BUNDLE_SIZE__;
  }

  private async sendErrorToService(errorReport: ErrorReport) {
    try {
      // In a real application, you would send this to your error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.

      // For now, we'll just log it
      console.warn('Error would be sent to reporting service:', {
        message: errorReport.error.message,
        timestamp: errorReport.timestamp,
        url: errorReport.url,
        userAgent: errorReport.userAgent,
        context: errorReport.context,
      });

      // Example implementation:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Export utility functions
export const recordError = (error: Error, context?: Record<string, any>) =>
  monitoring.recordError(error, context);

export const recordEvent = (type: UserEvent['type'], data: Record<string, any>) =>
  monitoring.recordEvent(type, data);

export const recordMetrics = (metrics: PerformanceMetrics) =>
  monitoring.recordMetrics(metrics);

export const getPerformanceSummary = () =>
  monitoring.getPerformanceSummary();

export const getRecentErrors = (limit?: number) =>
  monitoring.getRecentErrors(limit);

// React hook for monitoring integration
export const useMonitoring = () => {
  return {
    recordError,
    recordEvent,
    recordMetrics,
    getPerformanceSummary,
    getRecentErrors,
    clearData: () => monitoring.clearData(),
    setEnabled: (enabled: boolean) => monitoring.setEnabled(enabled),
  };
};
