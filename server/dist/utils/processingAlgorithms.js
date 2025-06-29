"use strict";
/**
 * POLISH Processing Algorithms
 *
 * This module contains the core signal processing algorithms used in POLISH
 * for petrophysical data cleaning and enhancement.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingAlgorithms = void 0;
class ProcessingAlgorithms {
    /**
     * Savitzky-Golay Filter Implementation (scientifically rigorous)
     *
     * Uses least-squares polynomial fitting to compute convolution coefficients.
     * Reference: https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter
     */
    savitzkyGolay(data, windowSize, polynomialOrder) {
        if (windowSize % 2 === 0) {
            throw new Error('Window size must be odd');
        }
        if (polynomialOrder >= windowSize) {
            throw new Error('Polynomial order must be less than window size');
        }
        const halfWindow = Math.floor(windowSize / 2);
        const result = new Array(data.length);
        // Compute convolution coefficients for the central point
        const coeffs = this.computeSGCoefficients(windowSize, polynomialOrder);
        for (let i = 0; i < data.length; i++) {
            let acc = 0;
            let norm = 0;
            for (let j = -halfWindow; j <= halfWindow; j++) {
                const idx = i + j;
                if (idx >= 0 && idx < data.length && !isNaN(data[idx])) {
                    acc += data[idx] * coeffs[j + halfWindow];
                    norm += coeffs[j + halfWindow];
                }
            }
            result[i] = norm !== 0 ? acc / norm : data[i];
        }
        return result;
    }
    /**
     * Compute Savitzky-Golay convolution coefficients using least-squares fitting.
     * Returns the coefficients for smoothing at the central point.
     */
    computeSGCoefficients(windowSize, polynomialOrder) {
        // Build the Vandermonde matrix
        const half = Math.floor(windowSize / 2);
        const A = [];
        for (let i = -half; i <= half; i++) {
            const row = [];
            for (let j = 0; j <= polynomialOrder; j++) {
                row.push(Math.pow(i, j));
            }
            A.push(row);
        }
        // Compute (A^T A)^-1 A^T
        const AT = this.transpose(A);
        const ATA = this.multiply(AT, A);
        const ATAinv = this.inverse(ATA);
        const pseudoInv = this.multiply(ATAinv, AT);
        // The filter coefficients are the first row of the pseudo-inverse
        return pseudoInv[0];
    }
    // Matrix helpers for small matrices (sufficient for window sizes < 25)
    transpose(m) {
        return m[0].map((_, i) => m.map((row) => row[i]));
    }
    multiply(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }
    inverse(m) {
        // Gauss-Jordan elimination for small matrices
        const n = m.length;
        const I = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
        const M = m.map((row) => row.slice());
        for (let i = 0; i < n; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i]))
                    maxRow = k;
            }
            // Swap rows
            [M[i], M[maxRow]] = [M[maxRow], M[i]];
            [I[i], I[maxRow]] = [I[maxRow], I[i]];
            // Normalize pivot row
            const pivot = M[i][i];
            if (Math.abs(pivot) < 1e-12)
                throw new Error('Matrix is singular');
            for (let j = 0; j < n; j++) {
                M[i][j] /= pivot;
                I[i][j] /= pivot;
            }
            // Eliminate other rows
            for (let k = 0; k < n; k++) {
                if (k === i)
                    continue;
                const factor = M[k][i];
                for (let j = 0; j < n; j++) {
                    M[k][j] -= factor * M[i][j];
                    I[k][j] -= factor * I[i][j];
                }
            }
        }
        return I;
    }
    /**
     * Hampel Filter for Spike Detection
     *
     * The Hampel filter is a robust outlier detection method that uses the median
     * absolute deviation (MAD) to identify and replace outliers.
     *
     * @param data - Input data array
     * @param windowSize - Size of the moving window
     * @param threshold - Threshold multiplier for MAD
     * @returns Object with cleaned data and spike indices
     */
    hampelFilter(data, windowSize, threshold) {
        const halfWindow = Math.floor(windowSize / 2);
        const cleanedData = [...data];
        const spikeIndices = [];
        for (let i = halfWindow; i < data.length - halfWindow; i++) {
            const window = data.slice(i - halfWindow, i + halfWindow + 1)
                .filter(val => !isNaN(val));
            if (window.length === 0)
                continue;
            // Calculate median
            const sortedWindow = [...window].sort((a, b) => a - b);
            const median = sortedWindow[Math.floor(sortedWindow.length / 2)];
            // Calculate MAD (Median Absolute Deviation)
            const deviations = window.map(val => Math.abs(val - median));
            const sortedDeviations = deviations.sort((a, b) => a - b);
            const mad = sortedDeviations[Math.floor(sortedDeviations.length / 2)];
            // Check if current point is an outlier
            const deviation = Math.abs(data[i] - median);
            if (deviation > threshold * mad) {
                spikeIndices.push(i);
                cleanedData[i] = median; // Replace with median
            }
        }
        return { cleanedData, spikeIndices };
    }
    /**
     * PCHIP (Piecewise Cubic Hermite Interpolating Polynomial) Interpolation
     *
     * PCHIP interpolation preserves monotonicity and is shape-preserving,
     * making it ideal for petrophysical data where physical relationships
     * must be maintained.
     */
    pchipInterpolation(x, y, xi) {
        const n = x.length;
        const h = new Array(n - 1);
        const delta = new Array(n - 1);
        for (let i = 0; i < n - 1; i++) {
            h[i] = x[i + 1] - x[i];
            delta[i] = (y[i + 1] - y[i]) / h[i];
        }
        // Fritsch-Carlson method for slope calculation
        const d = new Array(n);
        d[0] = delta[0];
        d[n - 1] = delta[n - 2];
        for (let i = 1; i < n - 1; i++) {
            if (delta[i - 1] * delta[i] <= 0) {
                d[i] = 0;
            }
            else {
                const w1 = 2 * h[i] + h[i - 1];
                const w2 = h[i] + 2 * h[i - 1];
                d[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
            }
        }
        const result = [];
        for (const val of xi) {
            let i = 0;
            while (i < n - 1 && x[i + 1] < val)
                i++;
            if (i === n - 1) {
                result.push(y[i]);
                continue;
            }
            const t = (val - x[i]) / h[i];
            const t2 = t * t;
            const t3 = t2 * t;
            const h00 = 2 * t3 - 3 * t2 + 1;
            const h10 = t3 - 2 * t2 + t;
            const h01 = -2 * t3 + 3 * t2;
            const h11 = t3 - t2;
            const interpolatedValue = h00 * y[i] + h10 * h[i] * d[i] + h01 * y[i + 1] + h11 * h[i] * d[i + 1];
            result.push(interpolatedValue);
        }
        return result;
    }
    /**
     * Wavelet Denoising using Haar Wavelet Transform
     *
     * Implements VisuShrink with a universal threshold.
     * Reference: Donoho & Johnstone (1994), "Ideal spatial adaptation by wavelet shrinkage."
     */
    waveletDenoise(data) {
        const n = data.length;
        let powerOf2 = 1;
        while (powerOf2 < n)
            powerOf2 *= 2;
        // Pad data to the next power of 2
        const paddedData = [...data];
        for (let i = n; i < powerOf2; i++) {
            paddedData.push(0);
        }
        // Forward DWT (Haar)
        let coeffs = [...paddedData];
        let len = powerOf2;
        while (len > 1) {
            len /= 2;
            for (let i = 0; i < len; i++) {
                const a = (coeffs[2 * i] + coeffs[2 * i + 1]) / 2;
                const d = (coeffs[2 * i] - coeffs[2 * i + 1]) / 2;
                coeffs[i] = a;
                coeffs[i + len] = d;
            }
        }
        // Universal thresholding (VisuShrink)
        const variance = this.calculateVariance(coeffs.slice(1)); // Exclude approximation coeff
        const sigma = Math.sqrt(variance);
        const threshold = sigma * Math.sqrt(2 * Math.log(powerOf2));
        for (let i = 1; i < powerOf2; i++) {
            if (Math.abs(coeffs[i]) < threshold) {
                coeffs[i] = 0;
            }
            else {
                coeffs[i] = Math.sign(coeffs[i]) * (Math.abs(coeffs[i]) - threshold);
            }
        }
        // Inverse DWT (Haar)
        len = 1;
        while (len < powerOf2) {
            len *= 2;
            for (let i = 0; i < len / 2; i++) {
                const a = coeffs[i];
                const d = coeffs[i + len / 2];
                coeffs[2 * i] = a + d;
                coeffs[2 * i + 1] = a - d;
            }
        }
        return coeffs.slice(0, n); // Return unpadded data
    }
    /**
     * Baseline Correction using Polynomial Detrending
     *
     * Fits a low-order polynomial to the data and subtracts it to remove
     * low-frequency drift.
     */
    async baselineCorrection(data, options) {
        try {
            const processedData = { ...data };
            const metrics = {};
            for (const curve of data.curves) {
                if (curve.dataType !== 'log')
                    continue;
                const originalValues = data.data.map((d) => d[curve.mnemonic]);
                const nonNullIndices = originalValues
                    .map((v, i) => (v !== null && v !== undefined && !isNaN(v) ? i : -1))
                    .filter((i) => i !== -1);
                if (nonNullIndices.length < options.polynomialOrder + 1)
                    continue;
                const x = nonNullIndices.map((i) => i);
                const y = nonNullIndices.map((i) => originalValues[i]);
                // Fit polynomial using least squares
                const coeffs = this.polynomialFit(x, y, options.polynomialOrder);
                // Subtract the trend
                let valueIndex = 0;
                const trendCorrectedValues = [...originalValues];
                nonNullIndices.forEach((i) => {
                    let trend = 0;
                    for (let j = 0; j < coeffs.length; j++) {
                        trend += coeffs[j] * Math.pow(i, j);
                    }
                    trendCorrectedValues[i] = originalValues[i] - trend;
                });
                processedData.data = processedData.data.map((d, i) => ({
                    ...d,
                    [curve.mnemonic]: trendCorrectedValues[i]
                }));
                metrics[curve.mnemonic] = {
                    polynomialCoefficients: coeffs,
                    pointsProcessed: nonNullIndices.length
                };
            }
            return { success: true, data: processedData, metrics };
        }
        catch (error) {
            console.error('Baseline correction failed:', error);
            return { success: false, data, metrics: {} };
        }
    }
    /**
     * Fits a polynomial of a given order to the data (x, y) using least squares.
     * Returns the polynomial coefficients.
     */
    polynomialFit(x, y, order) {
        const n = x.length;
        const A = [];
        const b = [];
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j <= order; j++) {
                row.push(Math.pow(x[i], j));
            }
            A.push(row);
            b.push([y[i]]);
        }
        const AT = this.transpose(A);
        const ATA = this.multiply(AT, A);
        const ATb = this.multiply(AT, b);
        const ATAinv = this.inverse(ATA);
        const coeffsMatrix = this.multiply(ATAinv, ATb);
        return coeffsMatrix.map(row => row[0]);
    }
    /**
     * Main denoising function that applies the selected algorithm
     */
    async denoise(data, options) {
        try {
            this.validateProcessingParams(options);
            const processedData = { ...data };
            const metrics = {};
            // Process each curve
            for (const curve of data.curves) {
                if (curve.dataType !== 'log')
                    continue;
                const originalValues = data.data.map((d) => d[curve.mnemonic])
                    .filter((v) => v !== null && v !== undefined && !isNaN(v));
                this.validateCurveData(originalValues);
                let processedValues;
                switch (options.method) {
                    case 'savitzky_golay':
                        processedValues = this.savitzkyGolay(originalValues, options.windowSize, options.polynomialOrder || 3);
                        break;
                    case 'wavelet':
                        processedValues = this.waveletDenoise(originalValues);
                        break;
                    case 'moving_average':
                        processedValues = this.movingAverage(originalValues, options.windowSize);
                        break;
                    case 'gaussian':
                        processedValues = this.gaussianFilter(originalValues, options.windowSize);
                        break;
                    default:
                        processedValues = originalValues;
                }
                // Apply strength parameter (blend original and processed)
                const blendedValues = originalValues.map((orig, idx) => orig * (1 - options.strength) + processedValues[idx] * options.strength);
                // Update data
                let valueIndex = 0;
                processedData.data = processedData.data.map((d) => {
                    if (d[curve.mnemonic] !== null && d[curve.mnemonic] !== undefined && !isNaN(d[curve.mnemonic])) {
                        return { ...d, [curve.mnemonic]: blendedValues[valueIndex++] };
                    }
                    return d;
                });
                // Calculate metrics
                const noiseReduction = this.calculateNoiseReduction(originalValues, blendedValues);
                metrics[curve.mnemonic] = {
                    noiseReduction,
                    pointsProcessed: originalValues.length,
                    method: options.method
                };
            }
            return { success: true, data: processedData, metrics };
        }
        catch (error) {
            console.error('Denoising failed:', error);
            return { success: false, data, metrics: {} };
        }
    }
    /**
     * Main despiking function
     */
    async despike(data, options) {
        try {
            this.validateProcessingParams(options);
            const processedData = { ...data };
            let totalSpikesDetected = 0;
            let totalSpikesRemoved = 0;
            for (const curve of data.curves) {
                if (curve.dataType !== 'log')
                    continue;
                const values = data.data.map((d) => d[curve.mnemonic]);
                const validValues = values.filter((v) => v !== null && v !== undefined && !isNaN(v));
                this.validateCurveData(validValues);
                let result;
                switch (options.method) {
                    case 'hampel':
                        result = this.hampelFilter(validValues, options.windowSize, options.threshold);
                        break;
                    case 'modified_zscore':
                        result = this.modifiedZScore(validValues, options.threshold);
                        break;
                    case 'iqr':
                        result = this.iqrMethod(validValues, options.threshold);
                        break;
                    default:
                        result = { cleanedData: validValues, spikeIndices: [] };
                }
                totalSpikesDetected += result.spikeIndices.length;
                totalSpikesRemoved += result.spikeIndices.length;
                // Update data with cleaned values
                let valueIndex = 0;
                processedData.data = processedData.data.map((d) => {
                    if (d[curve.mnemonic] !== null && d[curve.mnemonic] !== undefined && !isNaN(d[curve.mnemonic])) {
                        return { ...d, [curve.mnemonic]: result.cleanedData[valueIndex++] };
                    }
                    return d;
                });
            }
            return {
                success: true,
                data: processedData,
                spikesDetected: totalSpikesDetected,
                spikesRemoved: totalSpikesRemoved
            };
        }
        catch (error) {
            console.error('Despiking failed:', error);
            return {
                success: false,
                data,
                spikesDetected: 0,
                spikesRemoved: 0
            };
        }
    }
    // Helper methods
    movingAverage(data, windowSize) {
        const result = new Array(data.length);
        const halfWindow = Math.floor(windowSize / 2);
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
                if (!isNaN(data[j])) {
                    sum += data[j];
                    count++;
                }
            }
            result[i] = count > 0 ? sum / count : data[i];
        }
        return result;
    }
    gaussianFilter(data, windowSize) {
        const sigma = windowSize / 6; // Standard deviation
        const halfWindow = Math.floor(windowSize / 2);
        const result = new Array(data.length);
        // Generate Gaussian kernel
        const kernel = [];
        let kernelSum = 0;
        for (let i = -halfWindow; i <= halfWindow; i++) {
            const weight = Math.exp(-(i * i) / (2 * sigma * sigma));
            kernel.push(weight);
            kernelSum += weight;
        }
        // Normalize kernel
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= kernelSum;
        }
        // Apply filter
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let weightSum = 0;
            for (let j = -halfWindow; j <= halfWindow; j++) {
                const index = i + j;
                if (index >= 0 && index < data.length && !isNaN(data[index])) {
                    sum += data[index] * kernel[j + halfWindow];
                    weightSum += kernel[j + halfWindow];
                }
            }
            result[i] = weightSum > 0 ? sum / weightSum : data[i];
        }
        return result;
    }
    modifiedZScore(data, threshold) {
        const median = this.calculateMedian(data);
        const mad = this.calculateMAD(data, median);
        const cleanedData = [...data];
        const spikeIndices = [];
        for (let i = 0; i < data.length; i++) {
            const modifiedZScore = 0.6745 * (data[i] - median) / mad;
            if (Math.abs(modifiedZScore) > threshold) {
                spikeIndices.push(i);
                cleanedData[i] = median;
            }
        }
        return { cleanedData, spikeIndices };
    }
    iqrMethod(data, threshold) {
        const sortedData = [...data].sort((a, b) => a - b);
        const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
        const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - threshold * iqr;
        const upperBound = q3 + threshold * iqr;
        const cleanedData = [...data];
        const spikeIndices = [];
        const median = this.calculateMedian(data);
        for (let i = 0; i < data.length; i++) {
            if (data[i] < lowerBound || data[i] > upperBound) {
                spikeIndices.push(i);
                cleanedData[i] = median;
            }
        }
        return { cleanedData, spikeIndices };
    }
    calculateMedian(data) {
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    calculateMAD(data, median) {
        const deviations = data.map(val => Math.abs(val - median));
        return this.calculateMedian(deviations);
    }
    calculateNoiseReduction(original, processed) {
        const originalVariance = this.calculateVariance(original);
        const processedVariance = this.calculateVariance(processed);
        return ((originalVariance - processedVariance) / originalVariance) * 100;
    }
    calculateVariance(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    }
    validateProcessingParams(options) {
        if (options.windowSize < 3 || options.windowSize > 21) {
            throw new Error('Window size must be between 3 and 21');
        }
        if (options.windowSize % 2 === 0) {
            throw new Error('Window size must be odd');
        }
        if ('polynomialOrder' in options) {
            const { polynomialOrder } = options;
            if (polynomialOrder !== undefined && (polynomialOrder < 1 || polynomialOrder >= options.windowSize)) {
                throw new Error('Polynomial order must be between 1 and window size - 1');
            }
        }
        if ('threshold' in options) {
            const { threshold } = options;
            if (threshold <= 0) {
                throw new Error('Threshold must be positive');
            }
        }
    }
    validateCurveData(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid curve data: must be non-empty array');
        }
        const validPoints = data.filter(v => v !== null && v !== undefined && !isNaN(v));
        if (validPoints.length < 3) {
            throw new Error('Insufficient valid data points for processing');
        }
    }
}
exports.ProcessingAlgorithms = ProcessingAlgorithms;
//# sourceMappingURL=processingAlgorithms.js.map