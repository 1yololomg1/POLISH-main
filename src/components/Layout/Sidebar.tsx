import * as React from 'react';
import { useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertTriangle, Clock, Layers, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store';

export const Sidebar: React.FC = () => {
  const { files, activeFile, setActiveFile, removeFile } = useAppStore();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityGrade = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="w-96 bg-slate-800 border-r border-slate-700 flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Well Files</h2>
        </div>
        <FileUploadZone />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No LAS Files</p>
            <p className="text-sm">Upload LAS files to begin processing</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  activeFile?.id === file.id
                    ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setActiveFile(file)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate mb-1">
                      {file.header?.displayName || file.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mb-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.curves.length} curves</span>
                      <span>•</span>
                      <span>LAS {file.version}</span>
                    </div>
                    {file.header && (
                      <div className="text-xs text-slate-500 space-y-0.5">
                        {file.header.operator && (
                          <div>Operator: {file.header.operator}</div>
                        )}
                        {file.header.field && file.header.field !== file.header.well && (
                          <div>Field: {file.header.field}</div>
                        )}
                        {file.header.location && (
                          <div>Location: {file.header.location}</div>
                        )}
                        {file.header.uwi && (
                          <div>UWI: {file.header.uwi}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {file.processed ? (
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Processed</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                  
                  {file.qcResults && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Quality:</span>
                      <span className={`text-xs font-bold ${getQualityColor(file.qcResults.overallQualityScore)}`}>
                        {getQualityGrade(file.qcResults.overallQualityScore)}
                      </span>
                    </div>
                  )}
                </div>
                
                {file.qcResults && file.qcResults.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-600">
                    <div className="flex items-center text-xs text-slate-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>{file.qcResults.recommendations.length} recommendations</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FileUploadZone: React.FC = () => {
  const { addFile } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getCurveTypeAndTrack = (mnemonic: string) => {
    const upperMnemonic = mnemonic.toUpperCase();
    
    // Gamma Ray and SP
    if (['GR', 'CGR', 'SGR', 'SP'].includes(upperMnemonic)) {
      return { 
        curveType: upperMnemonic === 'SP' ? 'sp' : 'gamma_ray', 
        track: 1,
        color: upperMnemonic === 'GR' ? '#22c55e' : upperMnemonic === 'SP' ? '#8b5cf6' : '#16a34a'
      };
    }
    
    // Resistivity
    if (['RT', 'RXO', 'MSFL', 'LLS', 'LLD', 'ILD', 'SFL'].includes(upperMnemonic)) {
      return { curveType: 'resistivity', track: 2, color: '#ef4444' };
    }
    
    // Porosity
    if (['NPHI', 'RHOB', 'PEF', 'DT', 'DPHI'].includes(upperMnemonic)) {
      return { 
        curveType: 'porosity', 
        track: 3,
        color: upperMnemonic === 'NPHI' ? '#3b82f6' : upperMnemonic === 'RHOB' ? '#f59e0b' : '#8b5cf6'
      };
    }
    
    // Caliper and Drilling
    if (['CALI', 'BS', 'ROP', 'WOB', 'HKLA'].includes(upperMnemonic)) {
      return { curveType: 'caliper', track: 4, color: '#06b6d4' };
    }
    
    // Default to custom
    return { curveType: 'custom', track: 5, color: '#64748b' };
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        // Validate file
        if (!file.name.toLowerCase().endsWith('.las')) {
          throw new Error(`Invalid file type: ${file.name}. Only .las files are supported.`);
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          throw new Error(`File too large: ${file.name}. Maximum size is 100MB.`);
        }

        // Parse the actual LAS file
        const fileContent = await file.text();
        const parsedFile = await parseLASFile(fileContent, file.name, file.size);
        
        addFile(parsedFile);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  // Real LAS file parser
  const parseLASFile = async (content: string, fileName: string, fileSize: number): Promise<any> => {
    const lines = content.split('\n');
    const sections = {
      version: [] as string[],
      well: [] as string[],
      curve: [] as string[],
      data: [] as string[]
    };
    
    let currentSection = '';
    
    // Parse LAS file sections
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('~')) {
        const sectionName = trimmedLine.substring(1).toLowerCase();
        if (sectionName.startsWith('v')) currentSection = 'version';
        else if (sectionName.startsWith('w')) currentSection = 'well';
        else if (sectionName.startsWith('c')) currentSection = 'curve';
        else if (sectionName.startsWith('a')) currentSection = 'data';
      } else if (trimmedLine && !trimmedLine.startsWith('#') && currentSection) {
        sections[currentSection as keyof typeof sections].push(trimmedLine);
      }
    }

    // Parse header information
    const header = parseHeader(sections.version, sections.well);
    
    // Parse curves
    const curves = parseCurves(sections.curve);
    
    // Parse data
    const data = parseData(sections.data, curves, header);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      size: fileSize,
      uploadedAt: new Date(),
      processed: false,
      version: header.version,
      header,
      curves,
      data
    };
  };

  const parseHeader = (versionLines: string[], wellLines: string[]) => {
    const header: any = {
      version: '2.0',
      wrap: false,
      startDepth: 0,
      stopDepth: 0,
      step: 0.5,
      nullValue: -999.25,
      company: '',
      well: '',
      field: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      uwi: '',
      serviceCompany: '',
      logDate: new Date().toISOString().split('T')[0],
      elevation: 0,
      // Additional fields for business LAS files
      operator: '',
      rig: '',
      wellbore: '',
      api: '',
      county: '',
      state: '',
      country: '',
      province: '',
      block: '',
      lease: '',
      section: '',
      township: '',
      range: '',
      meridian: '',
      latitude: 0,
      longitude: 0,
      kb: 0,
      gl: 0,
      td: 0,
      md: 0,
      tvd: 0,
      comments: []
    };

    console.log('Parsing version lines:', versionLines);
    console.log('Parsing well lines:', wellLines);

    // Parse version section with more robust handling
    for (const line of versionLines) {
      if (!line.trim() || line.startsWith('~') || line.startsWith('#')) continue;
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      console.log(`Version header: ${key} = ${value}`);
      
      if (key === 'VERS') header.version = value;
      else if (key === 'WRAP') header.wrap = value.toUpperCase() === 'YES';
      else if (key === 'NULL') header.nullValue = parseFloat(value);
      else if (key === 'STRT') header.startDepth = parseFloat(value);
      else if (key === 'STOP') header.stopDepth = parseFloat(value);
      else if (key === 'STEP') header.step = parseFloat(value);
    }

    // Parse well section with comprehensive field mapping
    for (const line of wellLines) {
      if (!line.trim() || line.startsWith('~') || line.startsWith('#')) continue;
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      console.log(`Well header: ${key} = ${value}`);
      
      // Standard LAS fields
      if (key === 'COMP') header.company = value;
      else if (key === 'WELL') header.well = value;
      else if (key === 'FLD') header.field = value;
      else if (key === 'LOC') header.location = value;
      else if (key === 'DATE') header.date = value;
      else if (key === 'UWI') header.uwi = value;
      else if (key === 'SRVC') header.serviceCompany = value;
      else if (key === 'SLOG') header.logDate = value;
      
      // Business-specific fields
      else if (key === 'OPER') header.operator = value;
      else if (key === 'RIG') header.rig = value;
      else if (key === 'WELLBORE') header.wellbore = value;
      else if (key === 'API') header.api = value;
      else if (key === 'CNTY') header.county = value;
      else if (key === 'STAT') header.state = value;
      else if (key === 'CTRY') header.country = value;
      else if (key === 'PROV') header.province = value;
      else if (key === 'BLOCK') header.block = value;
      else if (key === 'LEASE') header.lease = value;
      else if (key === 'SECT') header.section = value;
      else if (key === 'TOWN') header.township = value;
      else if (key === 'RANG') header.range = value;
      else if (key === 'MERI') header.meridian = value;
      else if (key === 'LATI') header.latitude = parseFloat(value);
      else if (key === 'LONG') header.longitude = parseFloat(value);
      else if (key === 'KB') header.kb = parseFloat(value);
      else if (key === 'GL') header.gl = parseFloat(value);
      else if (key === 'TD') header.td = parseFloat(value);
      else if (key === 'MD') header.md = parseFloat(value);
      else if (key === 'TVD') header.tvd = parseFloat(value);
      else if (key === 'ELEV') header.elevation = parseFloat(value);
      
      // Handle comments and other fields
      else if (key === 'COMM' || key.startsWith('C')) {
        if (value.trim()) header.comments.push(value);
      }
      
      // Handle any other fields by storing them
      else if (value.trim()) {
        header[key.toLowerCase()] = value;
      }
    }

    // Smart field mapping for common variations
    if (!header.uwi && header.api) header.uwi = header.api;
    if (!header.api && header.uwi) header.api = header.uwi;
    if (!header.operator && header.company) header.operator = header.company;
    if (!header.company && header.operator) header.company = header.operator;

    // Validate and provide fallbacks for critical fields
    if (!header.well) {
      console.warn('No well name found in LAS file header');
      header.well = 'Unknown Well';
    }
    if (!header.company && !header.operator) {
      console.warn('No company/operator name found in LAS file header');
      header.company = 'Unknown Company';
    }
    if (!header.uwi && !header.api) {
      console.warn('No UWI/API number found in LAS file header');
      header.uwi = 'Unknown UWI';
    }

    // Create a display name for the well
    header.displayName = header.well || header.uwi || 'Unknown Well';
    if (header.field && header.field !== header.well) {
      header.displayName += ` (${header.field})`;
    }

    console.log('Parsed header:', header);
    return header;
  };

  const parseCurves = (curveLines: string[]) => {
    console.log('Parsing curves from lines:', curveLines);
    
    return curveLines.map((line, index) => {
      const [mnemonic, unit, description] = line.split(':').map(s => s.trim());
      const typeInfo = getCurveTypeAndTrack(mnemonic);
      
      console.log(`Curve ${index}:`, { mnemonic, unit, description, typeInfo });
      
      return {
        mnemonic,
        unit: unit || '',
        description: description || mnemonic,
        dataType: mnemonic.toUpperCase() === 'DEPT' ? 'depth' as const : 'log' as const,
        curveType: typeInfo.curveType,
        track: typeInfo.track,
        color: typeInfo.color,
        scale: typeInfo.curveType === 'resistivity' ? 'logarithmic' as const : 'linear' as const,
        visible: true
      };
    });
  };

  const parseData = (dataLines: string[], curves: any[], header: any) => {
    console.log('Parsing data from lines:', dataLines.length, 'curves:', curves.length);
    const data: any[] = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      const values = line.split(/\s+/).map(v => {
        const num = parseFloat(v);
        return isNaN(num) || num === header.nullValue ? null : num;
      });
      
      if (values.length >= curves.length) {
        const dataPoint: any = { depth: values[0] };
        
        for (let i = 1; i < curves.length; i++) {
          dataPoint[curves[i].mnemonic] = values[i];
        }
        
        data.push(dataPoint);
      }
    }

    console.log('Parsed data points:', data.length);
    if (data.length > 0) {
      console.log('Sample data point:', data[0]);
    }

    // Update header with actual depth range
    if (data.length > 0) {
      header.startDepth = Math.min(...data.map(d => d.depth));
      header.stopDepth = Math.max(...data.map(d => d.depth));
      if (data.length > 1) {
        header.step = data[1].depth - data[0].depth;
      }
    }

    return data;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isUploading) {
      handleFileUpload(e.target.files);
    }
    // Reset the input value so the same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isUploading 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/20'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-blue-400 font-medium">Processing files...</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-300 mb-2 font-medium">Drop LAS files here</p>
            <p className="text-xs text-slate-500 mb-4">Supports LAS v1.2, v2.0, v3.0 (max 100MB)</p>
            <label className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
              Browse Files
              <input
                type="file"
                multiple
                accept=".las,.LAS"
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </>
        )}
      </div>

      {uploadError && (
        <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Upload Error</p>
            <p className="text-xs text-red-300">{uploadError}</p>
          </div>
        </div>
      )}
    </div>
  );
};