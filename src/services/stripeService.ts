import { StripePaymentData, PaymentFormData, ExportOptions } from '../types';
import SessionManager from '../utils/sessionManager';

interface StripeConfig {
  publishableKey: string;
  apiUrl: string;
}

class StripeService {
  private config: StripeConfig;
  private sessionManager: SessionManager;

  constructor() {
    this.config = {
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001'
    };
    this.sessionManager = SessionManager.getInstance();
  }

  async createPaymentSession(
    fileId: string, 
    exportOptions: ExportOptions,
    customerData: PaymentFormData
  ): Promise<string> {
    const sessionId = this.sessionManager.getSessionId();
    if (!sessionId) {
      throw new Error('No active session found');
    }

    const paymentData: StripePaymentData = {
      sessionId,
      amount: 60000, // $600 in cents
      currency: 'usd',
      description: `LAS File Export - ${exportOptions.format.toUpperCase()}`,
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      metadata: {
        fileId,
        format: exportOptions.format,
        includeQC: exportOptions.includeQC,
        includeProcessingHistory: exportOptions.includeProcessingHistory
      }
    };

    try {
      const response = await fetch(`${this.config.apiUrl}/api/payment/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          customerInfo: customerData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const result = await response.json();
      
      // Store Stripe session ID
      this.sessionManager.setStripeSessionId(result.sessionId);
      
      return result.sessionId;
    } catch (error) {
      console.error('Error creating payment session:', error);
      throw error;
    }
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      // Load Stripe.js
      const stripe = await this.loadStripe();
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(sessionId: string): Promise<{ fileId: string; downloadUrl: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/payment/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      
      // Update session payment status
      this.sessionManager.setPaymentStatus('completed');
      
      return {
        fileId: result.fileId,
        downloadUrl: result.downloadUrl
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      this.sessionManager.setPaymentStatus('failed');
      throw error;
    }
  }

  async processImmediateDownload(
    fileId: string, 
    exportOptions: ExportOptions,
    paymentData: PaymentFormData
  ): Promise<string> {
    try {
      // Create payment session
      const sessionId = await this.createPaymentSession(fileId, exportOptions, paymentData);
      
      // Redirect to Stripe Checkout
      await this.redirectToCheckout(sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Error processing immediate download:', error);
      throw error;
    }
  }

  private async loadStripe(): Promise<any> {
    // Check if Stripe is already loaded
    if (window.Stripe) {
      return window.Stripe(this.config.publishableKey);
    }

    // Load Stripe.js dynamically
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        if (window.Stripe) {
          resolve(window.Stripe(this.config.publishableKey));
        } else {
          reject(new Error('Stripe failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Stripe'));
      document.head.appendChild(script);
    });
  }

  // Alternative method for direct payment processing (if not using Checkout)
  async processDirectPayment(
    fileId: string,
    exportOptions: ExportOptions,
    paymentData: PaymentFormData,
    paymentMethodId: string
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionManager.getSessionId(),
          fileId,
          exportOptions,
          paymentData,
          paymentMethodId
        })
      });

      const result = await response.json();

      if (result.success) {
        this.sessionManager.setPaymentStatus('completed');
        return { success: true, downloadUrl: result.downloadUrl };
      } else {
        this.sessionManager.setPaymentStatus('failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error processing direct payment:', error);
      this.sessionManager.setPaymentStatus('failed');
      return { success: false, error: 'Payment processing failed' };
    }
  }
}

// Add Stripe to window object for TypeScript
declare global {
  interface Window {
    Stripe?: any;
  }
}

export default StripeService; 