/**
 * POLISH API Service
 * 
 * Handles all communication with the backend API
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  qcResults?: any;
  processingHistory?: any[];
  executionTime?: number;
  memoryUsage?: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  // Processing endpoints
  async processFile(
    fileBuffer: ArrayBuffer,
    fileName: string,
    options: any
  ): Promise<ApiResponse> {
    // Convert ArrayBuffer to base64
    const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    return this.request('/processing/process', {
      method: 'POST',
      body: JSON.stringify({
        fileBuffer: base64,
        fileName,
        options
      })
    });
  }

  async validateProcessingOptions(options: any): Promise<ApiResponse> {
    return this.request('/processing/validate', {
      method: 'POST',
      body: JSON.stringify({ options })
    });
  }

  async getProcessingStatus(jobId: string): Promise<ApiResponse> {
    return this.request(`/processing/status/${jobId}`);
  }

  // File management endpoints
  async uploadFile(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData
    });
  }

  async getFile(fileId: string): Promise<ApiResponse> {
    return this.request(`/files/${fileId}`);
  }

  // Export endpoints
  async exportLAS(fileId: string, options: any): Promise<ApiResponse> {
    return this.request('/export/las', {
      method: 'POST',
      body: JSON.stringify({ fileId, options })
    });
  }

  // Conversion endpoints
  async convertFormat(fileId: string, format: string, options: any): Promise<ApiResponse> {
    return this.request('/conversion/convert', {
      method: 'POST',
      body: JSON.stringify({ fileId, format, options })
    });
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, currency: string): Promise<ApiResponse> {
    return this.request('/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }
}

export const apiService = new ApiService(); 