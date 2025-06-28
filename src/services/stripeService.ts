import { createClient } from '@supabase/supabase-js';
import { STRIPE_PRODUCTS } from '../stripe-config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class StripeService {
  /**
   * Create a Stripe checkout session for a product
   * @param productKey The key of the product in STRIPE_PRODUCTS
   * @param successUrl URL to redirect to after successful payment
   * @param cancelUrl URL to redirect to if payment is cancelled
   */
  async createCheckoutSession(
    productKey: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const product = STRIPE_PRODUCTS[productKey];
      
      if (!product) {
        throw new Error(`Product ${productKey} not found`);
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: product.priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode: product.mode
        }
      });

      if (error) {
        throw new Error(`Error creating checkout session: ${error.message}`);
      }

      return {
        sessionId: data.sessionId,
        url: data.url
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   * @param url The checkout URL from createCheckoutSession
   */
  redirectToCheckout(url: string): void {
    window.location.href = url;
  }

  /**
   * Get the current user's subscription status
   */
  async getUserSubscription() {
    try {
      const { data: subscription, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      return subscription;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  /**
   * Get the current user's order history
   */
  async getUserOrders() {
    try {
      const { data: orders, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        throw error;
      }

      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
}

export default new StripeService();