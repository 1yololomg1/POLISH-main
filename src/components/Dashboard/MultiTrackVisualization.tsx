import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Settings, ZoomIn, ZoomOut, RotateCcw, Maximize2, BarChart3, LineChart, ScatterChart as Scatter3D, Activity, TrendingUp, Grid3X3, Layers, RefreshCw, Trash2, ExternalLink, ToggleLeft, ToggleRight, AlertTriangle, SplitSquareHorizontal, GitCompare } from 'lucide-react';
import { useAppStore } from '../../store';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { VisualizationSettingsModal } from './VisualizationSettingsModal';

type VisualizationType = 'multi-track' | 'line-chart' | 'scatter-plot' | 'histogram' | 'crossplot' | 'radar-chart' | 'area-chart' | 'correlation-matrix' | 'before-after-overlay';

export const MultiTrackVisualization: React.FC = () => {
  const { activeFile, files, visualizationSettings, updateVisualizationSettings, toggleCurveVisibility, setActiveFile } = useAppStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('multi-track');
  const [selectedCurves, setSelectedCurves] = useState<string[]>(['GR', 'NPHI', 'RHOB']);
  const [selectedWells, setSelectedWells] = useState<string[]>([]);
  const [depthRange, setDepthRange] = useState<[number, number] | null>(null);
  const [showOriginalData, setShowOriginalData] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'single' | 'side-by-side'>('single');
  const [overlayMode, setOverlayMode] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const [showVisualizationSettings, setShowVisualizationSettings] = useState(false);

  // Initialize selected wells and depth range when activeFile changes
  useEffect(() => {
    if (activeFile) {
      setSelectedWells([activeFile.id]);
      const currentData = showOriginalData && activeFile.originalData ? activeFile.originalData : activeFile.data;
      const fileDepthRange: [number, number] = [
        Math.min(...currentData.map(d => d.depth)),
        Math.max(...currentData.map(d => d.depth))
      ];
      setDepthRange(fileDepthRange);
    }
  }, [activeFile, showOriginalData]);

  const handlePopoutVisualization = () => {
    if (!activeFile) return;
    
    // Create a new window for the visualization
    const popoutWindow = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    
    if (popoutWindow) {
      // Get current visualization data
      const chartData = getMultiWellData().map(d => ({
        depth: d.depth,
        wellName: d.wellName,
        ...selectedCurves.reduce((acc, curve) => {
          acc[curve] = d[curve];
          return acc;
        }, {} as any)
      }));

      // Create HTML content for the popup with working chart
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>POLISH Visualization - ${activeFile.header.well}</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/recharts@2.8.0/umd/Recharts.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              background: #0f172a; 
              color: white; 
              font-family: system-ui, -apple-system, sans-serif;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding: 15px;
              background: linear-gradient(to right, #1e293b, #334155);
              border-radius: 8px;
              border: 1px solid #475569;
            }
            .chart-container {
              background: #1e293b;
              border-radius: 8px;
              border: 1px solid #475569;
              padding: 20px;
              height: calc(100vh - 120px);
            }
            .controls {
              display: flex;
              gap: 10px;
              margin-bottom: 15px;
            }
            .btn {
              padding: 8px 16px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
            .btn:hover { background: #2563eb; }
            .btn.active { background: #1d4ed8; }
            .chart-wrapper {
              width: 100%;
              height: calc(100% - 60px);
              position: relative;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 24px;">POLISH Visualization</h1>
              <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">
                ${activeFile.header.well} • ${selectedCurves.join(', ')} • ${visualizationType.replace('-', ' ').toUpperCase()}
                ${showOriginalData ? ' • ORIGINAL DATA' : ' • PROCESSED DATA'}
              </p>
            </div>
            <div>
              <button class="btn" onclick="window.print()">Print</button>
              <button class="btn" onclick="exportChart()">Export PNG</button>
              <button class="btn" onclick="window.close()">Close</button>
            </div>
          </div>
          
          <div class="chart-container">
            <div class="controls">
              <button class="btn active" onclick="changeVisualization('line')">Line Chart</button>
              <button class="btn" onclick="changeVisualization('scatter')">Scatter Plot</button>
              <button class="btn" onclick="changeVisualization('area')">Area Chart</button>
              <button class="btn" onclick="changeVisualization('bar')">Bar Chart</button>
            </div>
            <div class="chart-wrapper">
              <canvas id="chartCanvas" width="1200" height="600"></canvas>
            </div>
          </div>

          <script>
            const chartData = ${JSON.stringify(chartData)};
            const selectedCurves = ${JSON.stringify(selectedCurves)};
            let currentVisualization = 'line';
            let chart = null;
            
            function changeVisualization(type) {
              currentVisualization = type;
              renderChart();
              // Update button states
              document.querySelectorAll('.controls .btn').forEach(btn => btn.classList.remove('active'));
              event.target.classList.add('active');
            }
            
            function renderChart() {
              const canvas = document.getElementById('chartCanvas');
              const ctx = canvas.getContext('2d');
              
              // Clear canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              if (chartData.length === 0) {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
                return;
              }
              
              // Simple chart rendering
              const padding = 50;
              const chartWidth = canvas.width - 2 * padding;
              const chartHeight = canvas.height - 2 * padding;
              
              // Find data ranges
              const depths = chartData.map(d => d.depth);
              const minDepth = Math.min(...depths);
              const maxDepth = Math.max(...depths);
              
              const values = selectedCurves.flatMap(curve => 
                chartData.map(d => d[curve]).filter(v => v !== null && v !== undefined)
              );
              const minValue = Math.min(...values);
              const maxValue = Math.max(...values);
              
              // Draw axes
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(padding, padding);
              ctx.lineTo(padding, canvas.height - padding);
              ctx.lineTo(canvas.width - padding, canvas.height - padding);
              ctx.stroke();
              
              // Draw grid lines
              ctx.strokeStyle = '#374151';
              ctx.lineWidth = 0.5;
              for (let i = 0; i <= 10; i++) {
                const x = padding + (i / 10) * chartWidth;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, canvas.height - padding);
                ctx.stroke();
              }
              
              for (let i = 0; i <= 10; i++) {
                const y = padding + (i / 10) * chartHeight;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(canvas.width - padding, y);
                ctx.stroke();
              }
              
              // Draw data points
              const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
              
              selectedCurves.forEach((curve, curveIndex) => {
                const color = colors[curveIndex % colors.length];
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = 2;
                
                const curveData = chartData
                  .map(d => ({ depth: d.depth, value: d[curve] }))
                  .filter(d => d.value !== null && d.value !== undefined)
                  .sort((a, b) => a.depth - b.depth);
                
                if (curveData.length === 0) return;
                
                ctx.beginPath();
                curveData.forEach((point, i) => {
                  const x = padding + ((point.depth - minDepth) / (maxDepth - minDepth)) * chartWidth;
                  const y = canvas.height - padding - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
                  
                  if (i === 0) {
                    ctx.moveTo(x, y);
                  } else {
                    ctx.lineTo(x, y);
                  }
                  
                  // Draw point
                  ctx.beginPath();
                  ctx.arc(x, y, 3, 0, 2 * Math.PI);
                  ctx.fill();
                });
                ctx.stroke();
              });
              
              // Draw labels
              ctx.fillStyle = '#94a3b8';
              ctx.font = '12px Arial';
              ctx.textAlign = 'center';
              
              // X-axis labels
              for (let i = 0; i <= 5; i++) {
                const depth = minDepth + (i / 5) * (maxDepth - minDepth);
                const x = padding + (i / 5) * chartWidth;
                ctx.fillText(depth.toFixed(0) + 'm', x, canvas.height - padding + 20);
              }
              
              // Y-axis labels
              ctx.textAlign = 'right';
              for (let i = 0; i <= 5; i++) {
                const value = minValue + (i / 5) * (maxValue - minValue);
                const y = canvas.height - padding - (i / 5) * chartHeight;
                ctx.fillText(value.toFixed(1), padding - 10, y + 4);
              }
              
              // Chart title
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('${activeFile.header.well} - ' + currentVisualization.toUpperCase() + ' CHART', canvas.width / 2, 25);
            }
            
            function exportChart() {
              const canvas = document.getElementById('chartCanvas');
              const link = document.createElement('a');
              link.download = 'polish-chart.png';
              link.href = canvas.toDataURL();
              link.click();
            }
            
            // Initial render
            renderChart();
          </script>
        </body>
        </html>
      `;

      popoutWindow.document.write(htmlContent);
      popoutWindow.document.close();
    }
  };

  if (!activeFile) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700 h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-slate-700 rounded-full">
            <Maximize2 className="h-12 w-12 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Advanced Visualization Suite</h3>
            <p className="text-slate-500 mb-4">Select a LAS file to access 8+ visualization types with multi-well support</p>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
              <h4 className="text-sm font-medium text-white mb-2">Troubleshooting Visualizations</h4>
              <ul className="text-xs text-slate-300 space-y-1 text-left">
                <li>• Upload and select a LAS file from the sidebar</li>
                <li>• Ensure curves are visible (green eye icons)</li>
                <li>• For scatter plots: select at least 2 curves</li>
                <li>• For crossplots: select at least 3 curves</li>
                <li>• Use "Reset" button if charts don't appear</li>
                <li>• Adjust depth range and sampling in File Info panel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { curves, data } = activeFile;
  const currentData = showOriginalData && activeFile.originalData ? activeFile.originalData : data;
  const visibleCurves = curves.filter(c => c.visible && c.dataType === 'log');
  
  // Debug logging
  console.log('MultiTrackVisualization Debug:', {
    activeFile: activeFile.name,
    curvesCount: curves.length,
    dataCount: data.length,
    visibleCurvesCount: visibleCurves.length,
    currentDataCount: currentData.length,
    visualizationType,
    selectedCurves
  });
  
  if (curves.length === 0) {
    console.warn('No curves found in activeFile');
  }
  
  if (data.length === 0) {
    console.warn('No data found in activeFile');
  }

  // Get data from selected wells
  const getMultiWellData = () => {
    const wellData: any[] = [];
    
    selectedWells.forEach(wellId => {
      const well = files.find(f => f.id === wellId);
      if (well) {
        const wellCurrentData = showOriginalData && well.originalData ? well.originalData : well.data;
        wellCurrentData.forEach(point => {
          if (!depthRange || (point.depth >= depthRange[0] && point.depth <= depthRange[1])) {
            wellData.push({
              ...point,
              wellId: well.id,
              wellName: well.header.well
            });
          }
        });
      }
    });
    
    return wellData;
  };

  const multiWellData = getMultiWellData();
  
  // Group curves by track for multi-track view
  const trackCurves = visualizationSettings.tracks.map(track => ({
    ...track,
    curves: visibleCurves.filter(curve => curve.track === track.id)
  }));

  const currentDepthRange = depthRange || [
    Math.min(...currentData.map(d => d.depth)),
    Math.max(...currentData.map(d => d.depth))
  ];

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.5, 10);
    setZoomLevel(newZoom);
    
    if (depthRange) {
      const center = (depthRange[1] + depthRange[0]) / 2;
      const range = (depthRange[1] - depthRange[0]) / 1.5;
      setDepthRange([center - range/2, center + range/2]);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.5, 0.1);
    setZoomLevel(newZoom);
    
    if (depthRange && activeFile) {
      const center = (depthRange[1] + depthRange[0]) / 2;
      const range = (depthRange[1] - depthRange[0]) * 1.5;
      const fullRange = Math.max(...currentData.map(d => d.depth)) - Math.min(...currentData.map(d => d.depth));
      const newRange = Math.min(range, fullRange);
      setDepthRange([center - newRange/2, center + newRange/2]);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset(0);
    if (activeFile) {
      setDepthRange([
        Math.min(...currentData.map(d => d.depth)),
        Math.max(...currentData.map(d => d.depth))
      ]);
    }
  };

  const handleResetVisualization = () => {
    setVisualizationType('multi-track');
    setSelectedCurves(['GR', 'NPHI', 'RHOB']);
    setZoomLevel(1);
    setPanOffset(0);
    setComparisonMode('single');
    if (activeFile) {
      setDepthRange([
        Math.min(...currentData.map(d => d.depth)),
        Math.max(...currentData.map(d => d.depth))
      ]);
    }
    console.log('Visualization reset to defaults');
  };

  const handleResetAll = () => {
    // Reset everything including file selection
    setActiveFile(null);
    setSelectedWells([]);
    setVisualizationType('multi-track');
    setSelectedCurves(['GR', 'NPHI', 'RHOB']);
    setZoomLevel(1);
    setPanOffset(0);
    setDepthRange(null);
    setShowOriginalData(false);
    setComparisonMode('single');
    console.log('Complete reset performed');
  };

  const visualizationTypes = [
    { id: 'multi-track', name: 'Multi-Track', icon: Layers, description: 'Professional well log display' },
    { id: 'line-chart', name: 'Line Chart', icon: LineChart, description: 'Time series visualization' },
    { id: 'scatter-plot', name: 'Scatter Plot', icon: Scatter3D, description: 'Cross-plot analysis' },
    { id: 'histogram', name: 'Histogram', icon: BarChart3, description: 'Data distribution' },
    { id: 'crossplot', name: 'Crossplot Matrix', icon: Grid3X3, description: 'Multi-curve correlation' },
    { id: 'radar-chart', name: 'Radar Chart', icon: Activity, description: 'Multi-dimensional view' },
    { id: 'area-chart', name: 'Area Chart', icon: TrendingUp, description: 'Filled curves' },
    { id: 'correlation-matrix', name: 'Correlation', icon: Grid3X3, description: 'Statistical correlation' },
    ...(activeFile?.originalData && activeFile?.processed ? [
      { id: 'before-after-overlay', name: 'Before/After Overlay', icon: GitCompare, description: 'Compare original and processed data' }
    ] : [])
  ];

  const renderVisualization = () => {
    // Check if we have the minimum required data
    if (multiWellData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
          <AlertTriangle className="h-12 w-12" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">No Data Available</p>
            <p className="text-sm">Ensure you have:</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Selected a file with data</li>
              <li>• At least one visible curve (green eye icon)</li>
              <li>• Valid depth range selected</li>
              <li>• Sufficient data points in current range</li>
            </ul>
          </div>
        </div>
      );
    }

    const chartData = multiWellData.map(d => ({
      depth: d.depth,
      wellName: d.wellName,
      ...selectedCurves.reduce((acc, curve) => {
        acc[curve] = d[curve];
        return acc;
      }, {} as any)
    }));

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const wellColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

    switch (visualizationType) {
      case 'multi-track':
        return renderMultiTrackView();
      
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="depth" 
                stroke="#9CA3AF"
                label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9CA3AF" />
              {selectedWells.length > 1 ? (
                // Multi-well display
                selectedWells.map((wellId, wellIndex) => 
                  selectedCurves.map((curve, curveIndex) => (
                    <Line
                      key={`${wellId}-${curve}`}
                      type="monotone"
                      dataKey={curve}
                      stroke={wellColors[wellIndex % wellColors.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                      strokeDasharray={curveIndex > 0 ? "5,5" : "0"}
                      data={chartData.filter(d => d.wellName === files.find(f => f.id === wellId)?.header.well)}
                    />
                  ))
                )
              ) : (
                // Single well display
                selectedCurves.map((curve, index) => (
                  <Line
                    key={curve}
                    type="monotone"
                    dataKey={curve}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                ))
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      
      case 'scatter-plot':
        if (selectedCurves.length < 2) {
          return (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Select at least 2 curves for scatter plot</p>
              </div>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={selectedCurves[0]} 
                stroke="#9CA3AF"
                label={{ value: selectedCurves[0], position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey={selectedCurves[1]}
                stroke="#9CA3AF"
                label={{ value: selectedCurves[1], angle: -90, position: 'insideLeft' }}
              />
              {selectedWells.length > 1 ? (
                selectedWells.map((wellId, index) => (
                  <Scatter 
                    key={wellId}
                    dataKey={selectedCurves[1]} 
                    fill={wellColors[index % wellColors.length]}
                    fillOpacity={0.6}
                    data={chartData.filter(d => d.wellName === files.find(f => f.id === wellId)?.header.well)}
                  />
                ))
              ) : (
                <Scatter 
                  dataKey={selectedCurves[1]} 
                  fill={colors[0]}
                  fillOpacity={0.6}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'histogram':
        const histogramData = selectedCurves.map(curve => {
          const values = multiWellData.map(d => d[curve]).filter(v => v !== null && v !== undefined);
          const bins = 20;
          const min = Math.min(...values);
          const max = Math.max(...values);
          const binSize = (max - min) / bins;
          
          const histogram = Array.from({ length: bins }, (_, i) => {
            const binStart = min + i * binSize;
            const binEnd = binStart + binSize;
            const count = values.filter(v => v >= binStart && v < binEnd).length;
            return {
              bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
              count,
              curve
            };
          });
          
          return { curve, data: histogram };
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
            {histogramData.map((hist, index) => (
              <div key={hist.curve} className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">{hist.curve} Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hist.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="bin" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" />
                    <Bar dataKey="count" fill={colors[index % colors.length]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        );
      
      case 'crossplot':
        if (selectedCurves.length < 3) {
          return (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Select at least 3 curves for crossplot matrix</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-3 gap-2 h-full p-4">
            {selectedCurves.map((curveX, i) =>
              selectedCurves.map((curveY, j) => {
                if (i >= j) return <div key={`${i}-${j}`} className="bg-slate-700/20 rounded"></div>;
                
                return (
                  <div key={`${i}-${j}`} className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400 mb-1">{curveY} vs {curveX}</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <ScatterChart data={chartData}>
                        <XAxis dataKey={curveX} hide />
                        <YAxis dataKey={curveY} hide />
                        <Scatter dataKey={curveY} fill={colors[i % colors.length]} fillOpacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                );
              })
            )}
          </div>
        );
      
      case 'radar-chart':
        const radarData = multiWellData.slice(0, 10).map((d, index) => {
          const point: any = { depth: d.depth, wellName: d.wellName };
          selectedCurves.forEach(curve => {
            // Normalize values to 0-100 scale for radar chart
            const values = multiWellData.map(item => item[curve]).filter(v => v !== null && v !== undefined);
            const min = Math.min(...values);
            const max = Math.max(...values);
            point[curve] = ((d[curve] - min) / (max - min)) * 100;
          });
          return point;
        });

        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="depth" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              {selectedCurves.map((curve, index) => (
                <Radar
                  key={curve}
                  name={curve}
                  dataKey={curve}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.1}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="depth" 
                stroke="#9CA3AF"
                label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9CA3AF" />
              {selectedCurves.map((curve, index) => (
                <Area
                  key={curve}
                  type="monotone"
                  dataKey={curve}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'correlation-matrix':
        const correlationMatrix = calculateCorrelationMatrix(multiWellData, selectedCurves);
        
        return (
          <div className="p-4 h-full overflow-auto">
            <h4 className="text-white font-medium mb-4">Correlation Matrix</h4>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${selectedCurves.length + 1}, 1fr)` }}>
              <div></div>
              {selectedCurves.map(curve => (
                <div key={curve} className="text-xs text-slate-300 text-center p-2 font-medium">
                  {curve}
                </div>
              ))}
              {selectedCurves.map(curveY => (
                <React.Fragment key={curveY}>
                  <div className="text-xs text-slate-300 p-2 font-medium">{curveY}</div>
                  {selectedCurves.map(curveX => {
                    const correlation = correlationMatrix[curveY]?.[curveX] || 0;
                    const intensity = Math.abs(correlation);
                    const color = correlation > 0 ? 'bg-blue-500' : 'bg-red-500';
                    
                    return (
                      <div
                        key={`${curveY}-${curveX}`}
                        className={`${color} rounded text-white text-xs text-center p-2 font-medium`}
                        style={{ opacity: intensity }}
                      >
                        {correlation.toFixed(2)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      
      case 'before-after-overlay':
        // Check if we have both original and processed data
        if (!activeFile.originalData || !activeFile.processed) {
          return (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Before/After overlay requires both original and processed data</p>
                <p className="text-sm mt-1">Process your file first to enable this view</p>
              </div>
            </div>
          );
        }

        // Create combined data with both original and processed values
        const overlayData = activeFile.originalData.map((originalPoint, index) => {
          const processedPoint = activeFile.data[index];
          const combinedPoint: any = { depth: originalPoint.depth };
          
          selectedCurves.forEach(curve => {
            combinedPoint[`${curve}_original`] = originalPoint[curve];
            combinedPoint[`${curve}_processed`] = processedPoint?.[curve];
          });
          
          return combinedPoint;
        });

        return (
          <div className="h-full flex flex-col">
            {/* Legend */}
            <div className="bg-slate-700/30 p-3 border-b border-slate-600">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-orange-500" style={{ borderTop: '2px dashed #F97316' }}></div>
                  <span className="text-orange-400 font-medium">Original Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-green-500"></div>
                  <span className="text-green-400 font-medium">Processed Data</span>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={overlayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="depth" 
                    stroke="#9CA3AF"
                    label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis stroke="#9CA3AF" />
                  
                  {/* Original data lines (dashed, orange) */}
                  {selectedCurves.map((curve, index) => (
                    <Line
                      key={`${curve}_original`}
                      type="monotone"
                      dataKey={`${curve}_original`}
                      stroke="#F97316" // Orange
                      strokeWidth={2}
                      strokeDasharray="5,5"
                      dot={false}
                      connectNulls={false}
                      name={`${curve} (Original)`}
                    />
                  ))}
                  
                  {/* Processed data lines (solid, green) */}
                  {selectedCurves.map((curve, index) => (
                    <Line
                      key={`${curve}_processed`}
                      type="monotone"
                      dataKey={`${curve}_processed`}
                      stroke="#10B981" // Green
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                      name={`${curve} (Processed)`}
                    />
                  ))}
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      
      default:
        return renderMultiTrackView();
    }
  };

  const renderMultiTrackView = () => {
    // Render side-by-side comparison if in comparison mode and we have both datasets
    if (comparisonMode === 'side-by-side' && activeFile.processed && activeFile.originalData) {
      return (
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Original Data */}
          <div className="flex flex-col">
            <div className="bg-orange-600 text-white text-center py-2 rounded-t-lg font-medium text-sm">
              Original Data
            </div>
            <div className="flex-1 border border-orange-600 rounded-b-lg overflow-hidden">
              {renderSingleMultiTrack(activeFile.originalData, 'original')}
            </div>
          </div>
          
          {/* Processed Data */}
          <div className="flex flex-col">
            <div className="bg-green-600 text-white text-center py-2 rounded-t-lg font-medium text-sm">
              Processed Data
            </div>
            <div className="flex-1 border border-green-600 rounded-b-lg overflow-hidden">
              {renderSingleMultiTrack(activeFile.data, 'processed')}
            </div>
          </div>
        </div>
      );
    }

    // Single view
    return renderSingleMultiTrack(currentData, showOriginalData ? 'original' : 'processed');
  };

  const renderSingleMultiTrack = (dataToRender: any[], dataType: 'original' | 'processed') => (
    <div className="flex overflow-x-auto h-full">
      {/* Depth Track */}
      <div className="flex-shrink-0 w-20 bg-slate-900 border-r border-slate-600">
        <div className="h-12 bg-slate-800 border-b border-slate-600 flex items-center justify-center">
          <span className="text-xs font-medium text-slate-300">DEPTH</span>
        </div>
        <div className="h-full relative" style={{ minHeight: '600px' }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => {
              const depth = currentDepthRange[0] + (currentDepthRange[1] - currentDepthRange[0]) * (i / 19);
              const y = 48 + ((i / 19) * (100 - 8)); // Better spacing: 48px header + 8px bottom margin
              return (
                <g key={i}>
                  <line
                    x1="60"
                    y1={`${y}%`}
                    x2="80"
                    y2={`${y}%`}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    x="55"
                    y={`${y}%`}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-xs fill-slate-400"
                    style={{ fontSize: '10px' }}
                  >
                    {depth.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Data Tracks */}
      {trackCurves.map((track) => (
        <div key={track.id} className="flex-shrink-0 border-r border-slate-600" style={{ width: track.width }}>
          <div className="h-12 bg-slate-800 border-b border-slate-600 px-2 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-300 truncate">{track.name}</span>
          </div>
          
          <div className="h-full relative" style={{ backgroundColor: track.backgroundColor, minHeight: '600px' }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              {track.gridLines && (
                <g>
                  {Array.from({ length: 10 }, (_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={`${48 + ((i / 9) * (100 - 8))}%`} // Better spacing
                      x2="100%"
                      y2={`${48 + ((i / 9) * (100 - 8))}%`}
                      stroke="#374151"
                      strokeWidth="0.5"
                      opacity="0.5"
                    />
                  ))}
                  {Array.from({ length: 4 }, (_, i) => (
                    <line
                      key={i}
                      x1={`${((i + 1) / 5) * 100}%`}
                      y1="48%" // Start after header
                      x2={`${((i + 1) / 5) * 100}%`}
                      y2="92%" // End before bottom margin
                      stroke="#374151"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  ))}
                </g>
              )}

              {track.curves.map((curve) => {
                // Overlay mode: draw both original and processed if available
                if (overlayMode && activeFile.originalData && activeFile.processed) {
                  // Draw original (dashed orange)
                  const originalCurveData = activeFile.originalData.map(d => ({
                    depth: d.depth,
                    value: d[curve.mnemonic],
                    wellId: d.wellId || activeFile.id
                  })).filter(d => d.value !== null && d.value !== undefined);
                  const processedCurveData = activeFile.data.map(d => ({
                    depth: d.depth,
                    value: d[curve.mnemonic],
                    wellId: d.wellId || activeFile.id
                  })).filter(d => d.value !== null && d.value !== undefined);
                  // Calculate min/max for scaling
                  const allValues = [...originalCurveData.map(d => d.value), ...processedCurveData.map(d => d.value)];
                  const minVal = curve.minValue ?? Math.min(...allValues);
                  const maxVal = curve.maxValue ?? Math.max(...allValues);
                  // Path for original
                  const pathOriginal = originalCurveData.map((point, i) => {
                    const x = track.scale === 'logarithmic' 
                      ? (Math.log10(point.value) - Math.log10(minVal)) / (Math.log10(maxVal) - Math.log10(minVal)) * 100
                      : ((point.value - minVal) / (maxVal - minVal)) * 100;
                    const y = 48 + ((point.depth - currentDepthRange[0]) / (currentDepthRange[1] - currentDepthRange[0])) * (92 - 8);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  // Path for processed
                  const pathProcessed = processedCurveData.map((point, i) => {
                    const x = track.scale === 'logarithmic' 
                      ? (Math.log10(point.value) - Math.log10(minVal)) / (Math.log10(maxVal) - Math.log10(minVal)) * 100
                      : ((point.value - minVal) / (maxVal - minVal)) * 100;
                    const y = 48 + ((point.depth - currentDepthRange[0]) / (currentDepthRange[1] - currentDepthRange[0])) * (92 - 8);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  return (
                    <g key={curve.mnemonic}>
                      <path
                        d={pathOriginal}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.9"
                      />
                      <path
                        d={pathProcessed}
                        fill="none"
                        stroke={curve.color}
                        strokeWidth="2"
                        opacity="0.9"
                      />
                    </g>
                  );
                } else {
                  // Single mode: draw only the selected data type
                  const curveData = dataToRender.map(d => ({
                    depth: d.depth,
                    value: d[curve.mnemonic],
                    wellId: d.wellId || activeFile.id
                  })).filter(d => d.value !== null && d.value !== undefined);
                  if (curveData.length === 0) return null;
                  const values = curveData.map(d => d.value);
                  const minVal = curve.minValue ?? Math.min(...values);
                  const maxVal = curve.maxValue ?? Math.max(...values);
                  const pathData = curveData.map((point, i) => {
                    const x = track.scale === 'logarithmic' 
                      ? (Math.log10(point.value) - Math.log10(minVal)) / (Math.log10(maxVal) - Math.log10(minVal)) * 100
                      : ((point.value - minVal) / (maxVal - minVal)) * 100;
                    const y = 48 + ((point.depth - currentDepthRange[0]) / (currentDepthRange[1] - currentDepthRange[0])) * (92 - 8);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  const strokeColor = dataType === 'original' ? '#f97316' : curve.color;
                  return (
                    <path
                      key={`${curve.mnemonic}-${dataType}`}
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  );
                }
              })}
            </svg>

            <div className="absolute bottom-1 left-1 right-1 flex justify-between text-xs text-slate-400">
              {track.curves.length > 0 && (
                <>
                  <span>{track.curves[0].minValue?.toFixed(1) ?? '0'}</span>
                  <span>{track.curves[0].maxValue?.toFixed(1) ?? '100'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const calculateCorrelationMatrix = (data: any[], curves: string[]) => {
    const matrix: Record<string, Record<string, number>> = {};
    
    curves.forEach(curveY => {
      matrix[curveY] = {};
      curves.forEach(curveX => {
        const valuesX = data.map(d => d[curveX]).filter(v => v !== null && v !== undefined);
        const valuesY = data.map(d => d[curveY]).filter(v => v !== null && v !== undefined);
        
        if (valuesX.length === 0 || valuesY.length === 0) {
          matrix[curveY][curveX] = 0;
          return;
        }
        
        const meanX = valuesX.reduce((a, b) => a + b, 0) / valuesX.length;
        const meanY = valuesY.reduce((a, b) => a + b, 0) / valuesY.length;
        
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        
        for (let i = 0; i < Math.min(valuesX.length, valuesY.length); i++) {
          const diffX = valuesX[i] - meanX;
          const diffY = valuesY[i] - meanY;
          numerator += diffX * diffY;
          denomX += diffX * diffX;
          denomY += diffY * diffY;
        }
        
        const correlation = numerator / Math.sqrt(denomX * denomY);
        matrix[curveY][curveX] = isNaN(correlation) ? 0 : correlation;
      });
    });
    
    return matrix;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Advanced Visualization Suite</h3>
            <p className="text-sm text-slate-400">
              {selectedWells.length > 1 ? `${selectedWells.length} wells selected` : activeFile.header.well} • 
              {currentDepthRange[0].toFixed(1)}m - {currentDepthRange[1].toFixed(1)}m •
              {showOriginalData ? ' Original Data' : ' Processed Data'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Side-by-Side Comparison Toggle */}
            {activeFile.processed && activeFile.originalData && visualizationType === 'multi-track' && (
              <button
                onClick={() => setComparisonMode(comparisonMode === 'single' ? 'side-by-side' : 'single')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Toggle side-by-side comparison"
              >
                <SplitSquareHorizontal className="h-4 w-4" />
                <span className="text-sm font-medium hidden lg:inline">
                  {comparisonMode === 'side-by-side' ? 'Single View' : 'Compare'}
                </span>
              </button>
            )}

            {/* Before/After Toggle (only for single view) - Made more prominent */}
            {activeFile.processed && activeFile.originalData && comparisonMode === 'single' && (
              <button
                onClick={() => setShowOriginalData(!showOriginalData)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm ${
                  showOriginalData
                    ? 'bg-orange-600 text-white shadow-lg border-2 border-orange-500'
                    : 'bg-green-600 text-white shadow-lg border-2 border-green-500'
                }`}
                title={showOriginalData ? 'Switch to processed data' : 'Switch to original data'}
              >
                {showOriginalData ? (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    <span className="font-bold">ORIGINAL DATA</span>
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    <span className="font-bold">PROCESSED DATA</span>
                  </>
                )}
              </button>
            )}

            {activeFile.processed && activeFile.originalData && (
              <button
                onClick={() => setOverlayMode(!overlayMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  overlayMode ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Toggle overlay of original and processed data"
              >
                <GitCompare className="h-4 w-4" />
                <span className="text-sm font-medium hidden lg:inline">
                  {overlayMode ? 'Overlay: Both' : 'Overlay: Single'}
                </span>
              </button>
            )}

            <button
              onClick={handlePopoutVisualization}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Open in New Window"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetVisualization}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Visualization"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetAll}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Everything"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => useAppStore.getState().setShowVisualizationSettingsModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Visualization settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Multi-Well Selection */}
        {files.length > 1 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Well Selection (Multi-Well Analysis)</h4>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setSelectedWells(prev => 
                      prev.includes(file.id)
                        ? prev.filter(id => id !== file.id)
                        : prev.length < 4 ? [...prev, file.id] : prev // Limit to 4 wells
                    );
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedWells.includes(file.id)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  disabled={!selectedWells.includes(file.id) && selectedWells.length >= 4}
                >
                  <span>{file.header.well}</span>
                  {file.processed && <span className="text-xs opacity-70">✓</span>}
                </button>
              ))}
            </div>
            {selectedWells.length >= 4 && (
              <p className="text-xs text-yellow-400 mt-1">Maximum 4 wells can be compared simultaneously</p>
            )}
          </div>
        )}

        {/* Visualization Type Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {visualizationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setVisualizationType(type.id as VisualizationType)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  visualizationType === type.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={type.description}
              >
                <Icon className="h-3 w-3" />
                <span>{type.name}</span>
              </button>
            );
          })}
        </div>

        {/* Curve Selection for non-multi-track views */}
        {visualizationType !== 'multi-track' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Select Curves for Analysis</h4>
            <div className="flex flex-wrap gap-2">
              {curves.filter(c => c.dataType === 'log').map((curve) => (
                <button
                  key={curve.mnemonic}
                  onClick={() => {
                    setSelectedCurves(prev => 
                      prev.includes(curve.mnemonic)
                        ? prev.filter(c => c !== curve.mnemonic)
                        : [...prev, curve.mnemonic]
                    );
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedCurves.includes(curve.mnemonic)
                      ? 'text-white shadow-lg'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                  style={{
                    backgroundColor: selectedCurves.includes(curve.mnemonic) ? curve.color : undefined,
                    boxShadow: selectedCurves.includes(curve.mnemonic) ? `0 0 20px ${curve.color}40` : undefined
                  }}
                >
                  <span>{curve.mnemonic}</span>
                  <span className="text-xs opacity-70">({curve.unit})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visualization Content */}
      <div className="flex-1 overflow-hidden">
        {renderVisualization()}
      </div>

      {/* Visualization Settings Modal */}
      {showVisualizationSettings && (
        <VisualizationSettingsModal onClose={() => setShowVisualizationSettings(false)} />
      )}
    </div>
  );
};