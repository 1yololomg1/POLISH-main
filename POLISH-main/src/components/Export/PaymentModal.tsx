import * as React from 'react';
import { useState } from 'react';
import { useAppStore } from '../../store';
import { PaymentFormData, ExportOptions } from '../../types';
import StripeService from '../../services/stripeService';

interface PaymentModalProps {
  fileId: string;
  exportOptions: ExportOptions;
  onSuccess: (downloadUrl: string) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  fileId, 
  exportOptions, 
  onSuccess, 
  onCancel 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    name: '',
    email: '',
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const stripeService = new StripeService();

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PaymentFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.billingAddress.line1.trim()) {
      setError('Billing address is required');
      return false;
    }
    if (!formData.billingAddress.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.billingAddress.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!formData.billingAddress.postalCode.trim()) {
      setError('Postal code is required');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const sessionId = await stripeService.processImmediateDownload(
        fileId,
        exportOptions,
        formData
      );
      
      // The user will be redirected to Stripe Checkout
      // On success, they'll be redirected back with the session ID
      console.log('Payment session created:', sessionId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Complete Payment
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Total Amount</span>
              <span className="text-lg font-bold text-blue-900">$600.00 USD</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              One-time payment for LAS file export
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                disabled={isProcessing}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
                disabled={isProcessing}
              />
            </div>

            {/* Billing Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Address *
              </label>
              <input
                type="text"
                value={formData.billingAddress.line1}
                onChange={(e) => handleInputChange('billingAddress.line1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St"
                disabled={isProcessing}
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.billingAddress.line2}
                onChange={(e) => handleInputChange('billingAddress.line2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apt 4B (optional)"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City *"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State *"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={formData.billingAddress.postalCode}
                onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Postal Code *"
                disabled={isProcessing}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Pay $600.00'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>• Your payment information is processed securely by Stripe</p>
          <p>• No account creation required</p>
          <p>• Download link will be provided immediately after payment</p>
          <p>• Files are automatically deleted after 4 hours</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;