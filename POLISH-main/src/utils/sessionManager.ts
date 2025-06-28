import { AnonymousSession, DownloadLink } from '../types';

class SessionManager {
  private static instance: SessionManager;
  private sessionId: string | null = null;
  private sessionData: AnonymousSession | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private retentionTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSession();
    this.setupActivityTracking();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeSession(): void {
    // Check if session exists in sessionStorage
    const existingSession = sessionStorage.getItem('polish_session');
    
    if (existingSession) {
      try {
        const parsed = JSON.parse(existingSession);
        this.sessionId = parsed.sessionId;
        this.sessionData = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastActivity: new Date(parsed.lastActivity)
        };
      } catch (error) {
        console.warn('Failed to parse existing session, creating new one');
        this.createNewSession();
      }
    } else {
      this.createNewSession();
    }
  }

  private createNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.sessionData = {
      sessionId: this.sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      files: [],
      exportedFiles: [],
      retentionPolicy: 'free',
      paymentStatus: 'pending'
    };
    this.saveSession();
  }

  private saveSession(): void {
    if (this.sessionData) {
      sessionStorage.setItem('polish_session', JSON.stringify(this.sessionData));
    }
  }

  private setupActivityTracking(): void {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });

    // Set up inactivity timer (1 hour)
    this.resetInactivityTimer();
  }

  private updateActivity(): void {
    if (this.sessionData) {
      this.sessionData.lastActivity = new Date();
      this.saveSession();
      this.resetInactivityTimer();
    }
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // 1 hour inactivity timeout
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, 60 * 60 * 1000); // 1 hour
  }

  private handleInactivity(): void {
    console.log('Session inactive for 1 hour, clearing files');
    this.clearAllFiles();
    this.createNewSession();
  }

  private clearAllFiles(): void {
    // Clear files from session storage
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('file_') || key.startsWith('export_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Public methods
  getSessionId(): string | null {
    return this.sessionId;
  }

  getSessionData(): AnonymousSession | null {
    return this.sessionData;
  }

  addFile(fileId: string): void {
    if (this.sessionData) {
      if (!this.sessionData.files.includes(fileId)) {
        this.sessionData.files.push(fileId);
        this.saveSession();
      }
    }
  }

  removeFile(fileId: string): void {
    if (this.sessionData) {
      this.sessionData.files = this.sessionData.files.filter(id => id !== fileId);
      this.saveSession();
    }
  }

  addExportedFile(fileId: string): void {
    if (this.sessionData) {
      if (!this.sessionData.exportedFiles.includes(fileId)) {
        this.sessionData.exportedFiles.push(fileId);
        this.saveSession();
        this.setupRetentionTimer(fileId);
      }
    }
  }

  private setupRetentionTimer(fileId: string): void {
    // 4-hour retention for exported files
    setTimeout(() => {
      this.removeExportedFile(fileId);
    }, 4 * 60 * 60 * 1000); // 4 hours
  }

  private removeExportedFile(fileId: string): void {
    if (this.sessionData) {
      this.sessionData.exportedFiles = this.sessionData.exportedFiles.filter(id => id !== fileId);
      this.saveSession();
      
      // Remove from session storage
      sessionStorage.removeItem(`export_${fileId}`);
    }
  }

  setPaymentStatus(status: 'pending' | 'completed' | 'failed'): void {
    if (this.sessionData) {
      this.sessionData.paymentStatus = status;
      this.saveSession();
    }
  }

  setStripeSessionId(stripeSessionId: string): void {
    if (this.sessionData) {
      this.sessionData.stripeSessionId = stripeSessionId;
      this.saveSession();
    }
  }

  // File storage methods
  storeFile(fileId: string, fileData: any): void {
    sessionStorage.setItem(`file_${fileId}`, JSON.stringify(fileData));
    this.addFile(fileId);
  }

  getFile(fileId: string): any {
    const fileData = sessionStorage.getItem(`file_${fileId}`);
    return fileData ? JSON.parse(fileData) : null;
  }

  storeExport(fileId: string, exportData: any): void {
    sessionStorage.setItem(`export_${fileId}`, JSON.stringify(exportData));
    this.addExportedFile(fileId);
  }

  getExport(fileId: string): any {
    const exportData = sessionStorage.getItem(`export_${fileId}`);
    return exportData ? JSON.parse(exportData) : null;
  }

  // Download link management
  createDownloadLink(fileId: string, format: string, fileData: any): DownloadLink {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    const downloadLink: DownloadLink = {
      url: URL.createObjectURL(new Blob([fileData], { type: 'application/octet-stream' })),
      expiresAt,
      fileId,
      format,
      used: false
    };

    // Store download link
    sessionStorage.setItem(`download_${fileId}`, JSON.stringify(downloadLink));
    
    // Auto-cleanup after expiration
    setTimeout(() => {
      this.cleanupDownloadLink(fileId);
    }, 30 * 60 * 1000);

    return downloadLink;
  }

  getDownloadLink(fileId: string): DownloadLink | null {
    const linkData = sessionStorage.getItem(`download_${fileId}`);
    return linkData ? JSON.parse(linkData) : null;
  }

  markDownloadUsed(fileId: string): void {
    const link = this.getDownloadLink(fileId);
    if (link) {
      link.used = true;
      sessionStorage.setItem(`download_${fileId}`, JSON.stringify(link));
    }
  }

  private cleanupDownloadLink(fileId: string): void {
    const link = this.getDownloadLink(fileId);
    if (link && !link.used) {
      URL.revokeObjectURL(link.url);
      sessionStorage.removeItem(`download_${fileId}`);
    }
  }

  // Cleanup on page unload
  cleanup(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.retentionTimer) {
      clearTimeout(this.retentionTimer);
    }
  }
}

// Set up cleanup on page unload
window.addEventListener('beforeunload', () => {
  SessionManager.getInstance().cleanup();
});

export default SessionManager; 