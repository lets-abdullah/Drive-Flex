/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#0F172A',
    tint: '#B11226',
    background: '#F8F9FA',
    foreground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    primary: '#B11226',
    primaryForeground: '#FFFFFF',
    secondary: '#F1F5F9',
    secondaryForeground: '#0F172A',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    accent: '#C9A227',
    accentForeground: '#0F172A',
    destructive: '#D61F3C',
    destructiveForeground: '#FFFFFF',
    border: '#E5E7EB',
    input: '#FFFFFF',
    darkCard: '#151515',
    darkCardForeground: '#F5F5F5',
    dockBackground: 'rgba(255, 255, 255, 0.96)',
    dockBorder: '#E5E7EB',
    dockActive: '#B11226',
    dockActiveIcon: '#FFFFFF',
    dockInactiveIcon: '#94A3B8',
    star: '#C9A227',
    chipInactiveBg: '#FFFFFF',
    chipInactiveText: '#475569',
    chipInactiveBorder: '#E2E8F0',
    verifiedEmerald: '#10B981',
    goldLight: '#E0B84C',
  },
  dark: {
    text: '#F5F5F5',
    tint: '#B11226',
    background: '#0A0A0A',
    foreground: '#F5F5F5',
    card: '#151515',
    cardForeground: '#F5F5F5',
    primary: '#B11226',
    primaryForeground: '#FFFFFF',
    secondary: '#1E1E1E',
    secondaryForeground: '#F5F5F5',
    muted: '#1E1E1E',
    mutedForeground: '#A3A3A3',
    accent: '#C9A227',
    accentForeground: '#0A0A0A',
    destructive: '#D61F3C',
    destructiveForeground: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.08)',
    input: '#1E1E1E',
    darkCard: '#151515',
    darkCardForeground: '#F5F5F5',
    dockBackground: 'rgba(21, 21, 21, 0.96)',
    dockBorder: 'rgba(255, 255, 255, 0.08)',
    dockActive: '#B11226',
    dockActiveIcon: '#FFFFFF',
    dockInactiveIcon: '#737373',
    star: '#C9A227',
    chipInactiveBg: '#151515',
    chipInactiveText: '#A3A3A3',
    chipInactiveBorder: 'rgba(255, 255, 255, 0.08)',
    verifiedEmerald: '#10B981',
    goldLight: '#E0B84C',
  },

  radius: 16,
};

export default colors;
