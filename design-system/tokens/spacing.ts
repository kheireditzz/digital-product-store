// design-system/tokens/spacing.ts
export const spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  48: 48,
  64: 64
} as const;

export type Spacing = typeof spacing;
