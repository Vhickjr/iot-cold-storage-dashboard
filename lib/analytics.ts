export interface Stats {
  mean: number
  stdDev: number
  count: number
}

export function computeStats(values: number[]): Stats {
  if (values.length === 0) return { mean: 0, stdDev: 0, count: 0 }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return { mean, stdDev: Math.sqrt(variance), count: values.length }
}

export function zScore(value: number, stats: Stats): number {
  if (stats.stdDev === 0) return 0
  return (value - stats.mean) / stats.stdDev
}

export interface Point {
  x: number
  y: number
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
}

export function linearRegression(points: Point[]): RegressionResult {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, rSquared: 0 }

  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const meanX = sumX / n
  const meanY = sumY / n

  const ssXY = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0)
  const ssXX = points.reduce((s, p) => s + (p.x - meanX) ** 2, 0)
  const ssYY = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)

  const slope = ssXX === 0 ? 0 : ssXY / ssXX
  const intercept = meanY - slope * meanX

  const rSquared = ssXX === 0 || ssYY === 0 ? 0 : (ssXY * ssXY) / (ssXX * ssYY)

  return { slope, intercept, rSquared }
}

export function extrapolate(regression: RegressionResult, x: number): number {
  return regression.slope * x + regression.intercept
}
