import React from 'react';
import { Gem, Mail, Phone, MapPin, Globe, Shield, FileText, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleEmailClick = () => {
    window.location.href = 'mailto:info@traceseis.com';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+17138909249';
  };

  const handleDocumentationClick = () => {
    // Open documentation in new tab
    window.open('https://docs.traceseis.com/polish', '_blank');
  };

  const handleUserGuideClick = () => {
    // Open user guide in new tab
    window.open('https://docs.traceseis.com/polish/user-guide', '_blank');
  };

  const handleAPIReferenceClick = () => {
    // Open API reference in new tab
    window.open('https://api.traceseis.com/polish/docs', '_blank');
  };

  const handleSupportCenterClick = () => {
    // Open support center
    window.open('https://support.traceseis.com', '_blank');
  };

  const handleTrainingClick = () => {
    // Open training materials
    window.open('https://training.traceseis.com/polish', '_blank');
  };

  const handlePrivacyPolicyClick = () => {
    // Open privacy policy
    window.open('https://traceseis.com/privacy', '_blank');
  };

  const handleTermsClick = () => {
    // Open terms of service
    window.open('https://traceseis.com/terms', '_blank');
  };

  const handleCookiePolicyClick = () => {
    // Open cookie policy
    window.open('https://traceseis.com/cookies', '_blank');
  };

  const handleGDPRClick = () => {
    // Open GDPR compliance page
    window.open('https://traceseis.com/gdpr', '_blank');
  };

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Gem className="h-8 w-8 text-amber-400" />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">POLISH</h3>
                <p className="text-xs text-slate-400">by TraceSeis, Inc.</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Professional-grade petrophysical data preprocessing platform for the oil and gas industry.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Shield className="h-4 w-4" />
              <span>SOC 2 Type II Compliant</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Services</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="hover:text-white transition-colors cursor-pointer">LAS File Processing</li>
              <li className="hover:text-white transition-colors cursor-pointer">Quality Control Analysis</li>
              <li className="hover:text-white transition-colors cursor-pointer">Format Conversion</li>
              <li className="hover:text-white transition-colors cursor-pointer">Data Standardization</li>
              <li className="hover:text-white transition-colors cursor-pointer">Enterprise Solutions</li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li 
                className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
                onClick={handleDocumentationClick}
              >
                <FileText className="h-4 w-4" />
                <span>Documentation</span>
              </li>
              <li 
                className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
                onClick={handleUserGuideClick}
              >
                <Users className="h-4 w-4" />
                <span>User Guide</span>
              </li>
              <li 
                className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
                onClick={handleAPIReferenceClick}
              >
                <Globe className="h-4 w-4" />
                <span>API Reference</span>
              </li>
              <li 
                className="hover:text-white transition-colors cursor-pointer"
                onClick={handleSupportCenterClick}
              >
                Support Center
              </li>
              <li 
                className="hover:text-white transition-colors cursor-pointer"
                onClick={handleTrainingClick}
              >
                Training Materials
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div 
                className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
                onClick={handleEmailClick}
              >
                <Mail className="h-4 w-4 text-slate-400" />
                <span>info@traceseis.com</span>
              </div>
              <div 
                className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer"
                onClick={handlePhoneClick}
              >
                <Phone className="h-4 w-4 text-slate-400" />
                <span>(713) 890-9249</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Houston, TX, USA</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-400">
                Enterprise Sales & Support
              </p>
              <p 
                className="text-sm text-white font-medium hover:text-blue-400 transition-colors cursor-pointer"
                onClick={handleEmailClick}
              >
                info@traceseis.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-300">
                © {currentYear} TraceSeis, Inc. All rights reserved.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                POLISH™ - Petrophysical Operations for Log Intelligence, Smoothing and Harmonization
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-slate-400">
              <button 
                onClick={handlePrivacyPolicyClick}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={handleTermsClick}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={handleCookiePolicyClick}
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </button>
              <button 
                onClick={handleGDPRClick}
                className="hover:text-white transition-colors"
              >
                GDPR Compliance
              </button>
            </div>
          </div>

          {/* Additional Copyright Information */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 space-y-2">
              <p>
                <strong>Trademark Notice:</strong> POLISH™ is a trademark of TraceSeis, Inc. 
                All other trademarks are the property of their respective owners.
              </p>
              <p>
                <strong>Patent Notice:</strong> This software may be covered by one or more patents. 
                See our patent portfolio for details.
              </p>
              <p>
                <strong>Open Source:</strong> This application uses open source software components. 
                See our open source acknowledgments for license information.
              </p>
              <p>
                <strong>Industry Standards:</strong> Compliant with API RP 33, CWLS standards, and WITSML 2.0. 
                LAS format support includes versions 1.2, 2.0, and 3.0.
              </p>
              <p>
                <strong>Data Security:</strong> All data processing occurs locally in your browser. 
                No files are uploaded to our servers during processing operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};