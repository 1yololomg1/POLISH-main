/**
 * POLISH Processing Algorithms
 *
 * This module contains the core signal processing algorithms used in POLISH
 * for petrophysical data cleaning and enhancement.
 */
export interface DenoiseOptions {
    method: 'savitzky_golay' | 'wavelet' | 'moving_average' | 'gaussian';
    windowSize: number;
    polynomialOrder?: number;
    strength: number;
    preserveSpikes: boolean;
}
export interface DespikeOptions {
    method: 'hampel' | 'modified_zscore' | 'iqr' | 'manual';
    threshold: number;
    windowSize: number;
    replacementMethod: 'pchip' | 'linear' | 'median' | 'null';
}
export declare class ProcessingAlgorithms {
    /**
     * Savitzky-Golay Filter Implementation (scientifically rigorous)
     *
     * Uses least-squares polynomial fitting to compute convolution coefficients.
     * Reference: https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter
     */
    private savitzkyGolay;
    /**
     * Compute Savitzky-Golay convolution coefficients using least-squares fitting.
     * Returns the coefficients for smoothing at the central point.
     */
    private computeSGCoefficients;
    private transpose;
    private multiply;
    private inverse;
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
    private hampelFilter;
    /**
     * PCHIP (Piecewise Cubic Hermite Interpolating Polynomial) Interpolation
     *
     * PCHIP interpolation preserves monotonicity and is shape-preserving,
     * making it ideal for petrophysical data where physical relationships
     * must be maintained.
     */
    private pchipInterpolation;
    /**
     * Wavelet Denoising using Haar Wavelet Transform
     *
     * Implements VisuShrink with a universal threshold.
     * Reference: Donoho & Johnstone (1994), "Ideal spatial adaptation by wavelet shrinkage."
     */
    private waveletDenoise;
    /**
     * Baseline Correction using Polynomial Detrending
     *
     * Fits a low-order polynomial to the data and subtracts it to remove
     * low-frequency drift.
     */
    baselineCorrection(data: any, options: {
        enabled: boolean;
        method: 'polynomial';
        polynomialOrder: number;
    }): Promise<{
        success: boolean;
        data: any;
        metrics: any;
    }>;
    /**
     * Fits a polynomial of a given order to the data (x, y) using least squares.
     * Returns the polynomial coefficients.
     */
    private polynomialFit;
    /**
     * Main denoising function that applies the selected algorithm
     */
    denoise(data: any, options: DenoiseOptions): Promise<{
        success: boolean;
        data: any;
        metrics: any;
    }>;
    /**
     * Main despiking function
     */
    despike(data: any, options: DespikeOptions): Promise<{
        success: boolean;
        data: any;
        spikesDetected: number;
        spikesRemoved: number;
    }>;
    private movingAverage;
    private gaussianFilter;
    private modifiedZScore;
    private iqrMethod;
    private calculateMedian;
    private calculateMAD;
    private calculateNoiseReduction;
    private calculateVariance;
    private validateProcessingParams;
    private validateCurveData;
}
//# sourceMappingURL=processingAlgorithms.d.ts.map