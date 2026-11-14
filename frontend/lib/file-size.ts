export type SizeUnit = "byte" | "kilobyte" | "megabyte" | "gigabyte" | "terabyte"

const SIZE_UNITS: SizeUnit[] = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"]

export function toSizeUnit(bytes: number): { value: number; unit: SizeUnit } {
  if (!Number.isFinite(bytes) || bytes < 1024) return { value: Math.max(0, Math.round(bytes) || 0), unit: "byte" }
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1)
  return { value: Math.round((bytes / 1024 ** index) * 100) / 100, unit: SIZE_UNITS[index] }
}
