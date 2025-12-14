/**
 * Format number with thousand separators
 * Examples: 1000 -> "1.000", 45455 -> "45.455"
 */
export const formatNumberWithSeparator = (num: number): string => {
  return new Intl.NumberFormat('de-DE').format(num);
};

/**
 * Format score/points for display
 */
export const formatScore = (score: number): string => {
  return formatNumberWithSeparator(score);
};
