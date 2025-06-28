import * as React from 'react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { Eye, EyeOff, Zap, Filter } from 'lucide-react';
import { useAppStore } from '../../store';

export const DataVisualization: React.FC = () => {
  const { activeFile } = useAppStore();
  const [visibleCurves, setVisibleCurves] = useState<Set<string>>(new Set(['GR', 'NPHI', 'RHOB']));
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  if (!activeFile) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <Zap className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No Data to Display</h3>
        <p className="text-slate-500">Select a file to view well log data</p>
      </div>
    );
  }

  const { curves, data } = activeFile;
  const logCurves = curves.filter(c => c.dataType === 'log');

  // Debug logging
  console.log('DataVisualization Debug:', {
    activeFile: activeFile.name,
    curvesCount: curves.length,
    dataCount: data.length,
    logCurvesCount: logCurves.length,
    visibleCurves: Array.from(visibleCurves)
  });

  const toggleCurveVisibility = (mnemonic: string) => {
    const newVisible = new Set(visibleCurves);
    if (newVisible.has(mnemonic)) {
      newVisible.delete(mnemonic);
    } else {
      newVisible.add(mnemonic);
    }
    setVisibleCurves(newVisible);
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Well Log Data (Debug View)</h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filters</span>
        </div>
      </div>
      
      {/* Debug Information */}
      <div className="mb-4 p-3 bg-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Debug Info</h4>
        <div className="text-xs text-slate-300 space-y-1">
          <div>File: {activeFile.name}</div>
          <div>Curves: {curves.length} total, {logCurves.length} log curves</div>
          <div>Data Points: {data.length}</div>
          <div>Visible Curves: {Array.from(visibleCurves).join(', ')}</div>
          {data.length > 0 && (
            <div>Depth Range: {Math.min(...data.map(d => d.depth)).toFixed(2)} - {Math.max(...data.map(d => d.depth)).toFixed(2)}</div>
          )}
        </div>
      </div>
      
      {/* Curve Controls */}
      <div className="mb-4 p-3 bg-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Visible Curves</h4>
        <div className="flex flex-wrap gap-2">
          {logCurves.map((curve, index) => (
            <button
              key={curve.mnemonic}
              onClick={() => toggleCurveVisibility(curve.mnemonic)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                visibleCurves.has(curve.mnemonic)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {visibleCurves.has(curve.mnemonic) ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              <span>{curve.mnemonic}</span>
              <span className="text-xs opacity-70">({curve.unit})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simple Data Table */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2">Data Preview (First 10 rows)</h4>
        <div className="bg-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-600">
                <th className="px-2 py-1 text-left">Depth</th>
                {Array.from(visibleCurves).map((mnemonic, index) => (
                  <th key={mnemonic} className="px-2 py-1 text-left" style={{ color: colors[index % colors.length] }}>
                    {mnemonic}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-slate-600">
                  <td className="px-2 py-1 text-slate-300">{row.depth?.toFixed(2)}</td>
                  {Array.from(visibleCurves).map((mnemonic, index) => (
                    <td key={mnemonic} className="px-2 py-1 text-slate-300">
                      {row[mnemonic]?.toFixed(3) || 'null'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from(visibleCurves).map((mnemonic, index) => {
          const values = data.map(d => d[mnemonic]).filter(v => v !== null && v !== undefined);
          if (values.length === 0) return null;
          
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          
          return (
            <div key={mnemonic} className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm font-medium text-white">{mnemonic}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Min:</span>
                  <span className="text-white">{min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span className="text-white">{max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg:</span>
                  <span className="text-white">{avg.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};