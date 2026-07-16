/**
 * TimeBasedAccess - ATM Security App Color Scheme
 *
 * A premium dark theme with electric blue accents
 * conveying trust, security, and modern technology.
 */

export const Colors = {
  // ── Primary Backgrounds ──
  background: '#06090F',        // Deep space black
  backgroundAlt: '#0C1220',     // Slightly lighter card bg
  surface: '#111827',           // Card / panel surface
  surfaceElevated: '#1A2236',   // Elevated elements

  // ── Primary Accent ──
  primary: '#00B4FF',           // Electric blue — main CTA
  primaryLight: '#38CBFF',      // Lighter variant
  primaryDark: '#0088CC',       // Pressed state
  primaryGlow: 'rgba(0, 180, 255, 0.15)', // Glow / shadow

  // ── Secondary Accent ──
  accent: '#FFB800',            // Amber gold — security badge
  accentLight: '#FFCC40',
  accentDark: '#CC9300',

  // ── Security Indicator ──
  secure: '#00E676',            // Green — authenticated / safe
  secureDark: '#00C853',
  warning: '#FF9100',           // Orange — caution
  danger: '#FF3D71',            // Red — error / critical

  // ── Text ──
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',     // Muted text
  textTertiary: '#4B5563',      // Placeholder / disabled
  textOnPrimary: '#FFFFFF',

  // ── Borders & Dividers ──
  border: 'rgba(148, 163, 184, 0.12)',
  borderFocused: 'rgba(0, 180, 255, 0.5)',
  divider: 'rgba(148, 163, 184, 0.08)',

  // ── Input Fields ──
  inputBackground: 'rgba(17, 24, 39, 0.8)',
  inputBorder: 'rgba(148, 163, 184, 0.15)',
  inputBorderFocused: '#00B4FF',

  // ── Overlays ──
  overlay: 'rgba(6, 9, 15, 0.7)',
  shimmer: 'rgba(255, 255, 255, 0.03)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
