/**
 * Stripe product configuration for POLISH application
 * 
 * This file defines the products available for purchase through Stripe.
 * Each product includes its price ID, name, description, and mode.
 */

export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  REPORT_ONLY: {
    priceId: 'price_1ReuZwFEphlQ7lGnUR63vCUk',
    name: 'Full Report Only',
    description: 'Petrophysical Operations for LAS Intelligence, Smoothing, and Harmonization- POLISH report',
    mode: 'payment'
  },
  LAS_WITH_REPORT: {
    priceId: 'price_1ReuTxFEphlQ7lGnMaiXtfLP',
    name: 'LAS file with report',
    description: 'Cleaned and denoised LAS file with full report',
    mode: 'payment'
  }
};