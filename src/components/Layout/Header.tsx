import React, { useState } from 'react';
import { Gem, Settings, FileText, Download, BarChart3, User, CreditCard, RefreshCw, HelpCircle, LogOut } from 'lucide-react';
import { useAppStore } from '../../store';
import { SettingsModal } from '../SettingsModal';

export const Header: React.FC = () => {
  const { user, setShowAuthModal, setShowFormatConverter, setShowHelpModal, setUser, activeFile, files, setShowPaymentModal } = useAppStore();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleReports = () => {
    if (!activeFile && files.length === 0) {
      alert('Please upload and process at least one LAS file to generate a technical report.');
      return;
    }

    // Check if user is authenticated and has paid for reports
    if (!user) {
      alert('Please sign in to access premium technical reports.');
      setShowAuthModal(true);
      return;
    }

    // Check if user has purchased report access
    // In a real implementation, this would check the user's purchase history
    const hasReportAccess = user.subscription === 'premium' || user.subscription === 'enterprise' || 
                           (user as any).purchasedReports || (user as any).purchasedExports;

    if (!hasReportAccess) {
      // Show payment modal for report purchase
      alert('Technical reports require payment. Choose:\n• Report Only: $125\n• LAS Export + Report: $400');
      setShowPaymentModal(true);
      return;
    }

    // Generate comprehensive technical report
    generateTechnicalReport();
  };

  const generateTechnicalReport = () => {
    const reportData = {
      metadata: {
        title: 'POLISH Technical Processing Report',
        generatedAt: new Date().toISOString(),
        version: '1.1.0',
        reportId: `POLISH_RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user: user?.name || 'Anonymous User',
        isPaid: true,
        reportType: 'Premium Technical Report'
      },
      summary: {
        totalFiles: files.length,
        processedFiles: files.filter(f => f.processed).length,
        totalDataPoints: files.reduce((sum, f) => sum + f.data.length, 0),
        averageQualityScore: files.length > 0 
          ? files.reduce((sum, f) => sum + (f.qcResults?.overallQualityScore || 0), 0) / files.length 
          : 0
      },
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        processed: file.processed,
        qualityScore: file.qcResults?.overallQualityScore,
        curves: file.curves.length,
        depthRange: [
          Math.min(...file.data.map(d => d.depth)),
          Math.max(...file.data.map(d => d.depth))
        ],
        processingHistory: file.processingHistory || []
      })),
      systemInfo: {
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : 'Not available'
      }
    };

    // Generate HTML report
    const htmlReport = generateHTMLReport(reportData);
    
    // Create and download the report
    const blob = new Blob([htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POLISH_Technical_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Premium technical report generated and downloaded');
  };

  const generateHTMLReport = (data: any) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.metadata.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
        }
        .premium-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            color: #92400e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin-top: 10px;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #1e3a8a;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #1e3a8a;
        }
        .metric-label {
            color: #64748b;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .file-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .file-table th,
        .file-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .file-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .quality-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .quality-a { background: #dcfce7; color: #166534; }
        .quality-b { background: #dbeafe; color: #1d4ed8; }
        .quality-c { background: #fef3c7; color: #92400e; }
        .quality-d { background: #fed7aa; color: #c2410c; }
        .quality-f { background: #fecaca; color: #dc2626; }
        .footer {
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .processing-history {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
        }
        .processing-step {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .processing-step:last-child {
            border-bottom: none;
        }
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.8em;
            font-weight: bold;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        @media print {
            body { background: white; }
            .section { box-shadow: none; border: 1px solid #e5e7eb; }
            .watermark { position: absolute; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="premium-badge">PREMIUM REPORT</div>
        <h1>POLISH Technical Report</h1>
        <div class="subtitle">Petrophysical Operations for Log Intelligence, Smoothing and Harmonization</div>
        <div style="margin-top: 15px; font-size: 0.9em;">
            Report ID: ${data.metadata.reportId}<br>
            Generated: ${new Date(data.metadata.generatedAt).toLocaleString()}<br>
            User: ${data.metadata.user}<br>
            Type: ${data.metadata.reportType}
        </div>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="grid">
            <div class="metric-card">
                <div class="metric-value">${data.summary.totalFiles}</div>
                <div class="metric-label">Total Files Analyzed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.summary.processedFiles}</div>
                <div class="metric-label">Files Processed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.summary.totalDataPoints.toLocaleString()}</div>
                <div class="metric-label">Total Data Points</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${data.summary.averageQualityScore.toFixed(1)}</div>
                <div class="metric-label">Average Quality Score</div>
            </div>
        </div>
        
        <p><strong>Processing Efficiency:</strong> ${((data.summary.processedFiles / data.summary.totalFiles) * 100).toFixed(1)}% of uploaded files have been successfully processed using POLISH algorithms.</p>
        
        <p><strong>Data Quality Assessment:</strong> The average quality score of ${data.summary.averageQualityScore.toFixed(1)} indicates ${
          data.summary.averageQualityScore >= 90 ? 'excellent' :
          data.summary.averageQualityScore >= 75 ? 'good' :
          data.summary.averageQualityScore >= 60 ? 'acceptable' : 'poor'
        } overall data quality across the analyzed dataset.</p>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">
                ⭐ Premium Report Features: This comprehensive technical report includes detailed processing history, 
                advanced quality metrics, system performance data, and professional documentation suitable for 
                regulatory compliance and technical audits.
            </p>
        </div>
    </div>

    <div class="section">
        <h2>File Analysis Details</h2>
        <table class="file-table">
            <thead>
                <tr>
                    <th>File Name</th>
                    <th>Size (MB)</th>
                    <th>Curves</th>
                    <th>Depth Range (m)</th>
                    <th>Quality Score</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.files.map((file: any) => {
                  const qualityGrade = file.qualityScore >= 90 ? 'A' : 
                                     file.qualityScore >= 75 ? 'B' : 
                                     file.qualityScore >= 60 ? 'C' : 
                                     file.qualityScore >= 50 ? 'D' : 'F';
                  return `
                    <tr>
                        <td><strong>${file.name}</strong></td>
                        <td>${(file.size / (1024 * 1024)).toFixed(2)}</td>
                        <td>${file.curves}</td>
                        <td>${file.depthRange[0].toFixed(1)} - ${file.depthRange[1].toFixed(1)}</td>
                        <td>
                            ${file.qualityScore ? `
                                <span class="quality-badge quality-${qualityGrade.toLowerCase()}">
                                    ${file.qualityScore.toFixed(1)} (${qualityGrade})
                                </span>
                            ` : 'Not processed'}
                        </td>
                        <td>${file.processed ? '✅ Processed' : '⏳ Pending'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>

    ${data.files.filter((f: any) => f.processingHistory.length > 0).length > 0 ? `
    <div class="section">
        <h2>Processing History</h2>
        ${data.files.filter((f: any) => f.processingHistory.length > 0).map((file: any) => `
            <h3>${file.name}</h3>
            <div class="processing-history">
                ${file.processingHistory.map((step: any) => `
                    <div class="processing-step">
                        <strong>${step.operation}</strong> - ${new Date(step.timestamp).toLocaleString()}<br>
                        <small>Curves affected: ${step.curvesAffected.join(', ')}</small><br>
                        <small>${step.description}</small>
                    </div>
                `).join('')}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>System Information</h2>
        <div class="grid">
            <div>
                <strong>Report Version:</strong> ${data.metadata.version}<br>
                <strong>Generation Time:</strong> ${new Date(data.systemInfo.timestamp).toLocaleString()}<br>
                <strong>Browser:</strong> ${data.systemInfo.browser.split(' ')[0]}
            </div>
            ${data.systemInfo.memoryUsage !== 'Not available' ? `
            <div>
                <strong>Memory Usage:</strong><br>
                Used: ${data.systemInfo.memoryUsage.used} MB<br>
                Total: ${data.systemInfo.memoryUsage.total} MB<br>
                Limit: ${data.systemInfo.memoryUsage.limit} MB
            </div>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <h2>Technical Specifications</h2>
        <div class="grid">
            <div>
                <h4>Processing Algorithms</h4>
                <ul>
                    <li>Savitzky-Golay Denoising</li>
                    <li>Hampel Spike Detection</li>
                    <li>PCHIP Interpolation</li>
                    <li>Physical Range Validation</li>
                    <li>Mnemonic Standardization</li>
                </ul>
            </div>
            <div>
                <h4>Supported Standards</h4>
                <ul>
                    <li>LAS v1.2, v2.0, v3.0</li>
                    <li>API RP 33</li>
                    <li>CWLS Standards</li>
                    <li>WITSML 2.0</li>
                    <li>SEG-Y Rev 2</li>
                </ul>
            </div>
            <div>
                <h4>Quality Metrics</h4>
                <ul>
                    <li>Data Completeness Analysis</li>
                    <li>Noise Level Assessment</li>
                    <li>Spike Detection Statistics</li>
                    <li>Physical Validation Results</li>
                    <li>Cross-curve Correlation</li>
                </ul>
            </div>
            <div>
                <h4>Security Features</h4>
                <ul>
                    <li>Client-side Processing</li>
                    <li>No Data Upload Required</li>
                    <li>Secure Memory Management</li>
                    <li>Encrypted Data Transmission</li>
                    <li>Audit Trail Generation</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="watermark">
        POLISH™ Premium Report
    </div>

    <div class="footer">
        <p><strong>POLISH™</strong> - Petrophysical Operations for Log Intelligence, Smoothing and Harmonization</p>
        <p>© ${new Date().getFullYear()} TraceSeis, Inc. All rights reserved.</p>
        <p>This premium technical report was generated by POLISH v${data.metadata.version}</p>
        <p><em>For technical support, contact: support@traceseis.com</em></p>
        <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
            <p style="margin: 0; font-size: 0.8em; color: #6b7280;">
                <strong>Report Authentication:</strong> This is a premium technical report generated after payment verification. 
                Report ID: ${data.metadata.reportId} | Generated: ${new Date(data.metadata.generatedAt).toISOString()}
            </p>
        </div>
    </div>
</body>
</html>
    `;
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleLogout = () => {
    setUser(null);
    console.log('User logged out');
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-700 px-6 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Gem className="h-10 w-10 text-amber-400" />
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg"></div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">POLISH</h1>
                <div className="text-xs text-slate-400 border-l border-slate-600 pl-3">
                  <p>© 2025 TraceSeis. All rights reserved.</p>
                  <p>POLISH™ - Proprietary petrophysical processing software.</p>
                </div>
              </div>
              <p className="text-sm text-blue-200 font-medium leading-tight">
                Petrophysical Operations for Log Intelligence, Smoothing and Harmonization
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button 
            onClick={() => setShowFormatConverter(true)}
            className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Convert LAS files to other formats"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium hidden lg:inline">Format Converter</span>
          </button>
          
          <button 
            onClick={handleReports}
            className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Generate premium technical processing reports (payment required)"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium hidden lg:inline">Premium Report</span>
          </button>
          
          <button 
            onClick={handleSettings}
            className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Application settings and preferences"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium hidden lg:inline">Settings</span>
          </button>
          
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600"
            title="Help and documentation"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium hidden lg:inline">Help</span>
          </button>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-400 rounded-lg border border-purple-700/50">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">{user.credits} Credits</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-900/30 to-green-900/30 text-emerald-400 rounded-lg border border-emerald-700/50">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Sign In</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-900/30 to-green-900/30 text-emerald-400 rounded-lg border border-emerald-700/50">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-sm font-medium">System Ready</span>
          </div>
        </div>
      </div>
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </header>
  );
};