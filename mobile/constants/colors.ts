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
    text: '#18181a',
    tint: '#93532c',
    background: '#f8f6f2',
    foreground: '#18181a',
    card: '#ffffff',
    cardForeground: '#18181a',
    primary: '#93532c',
    primaryForeground: '#ffffff',
    secondary: '#eeeae3',
    secondaryForeground: '#18181a',
    muted: '#eeeae3',
    mutedForeground: '#7e7972',
    accent: '#93532c',
    accentForeground: '#ffffff',
    destructive: '#d63b3b',
    destructiveForeground: '#ffffff',
    border: '#eae5dc',
    input: '#ffffff',
    darkCard: '#1a1817',
    darkCardForeground: '#ffffff',
    dockBackground: 'rgba(255, 255, 255, 0.94)',
    dockBorder: '#eae5dc',
    dockActive: '#18181a',
    dockActiveIcon: '#ffffff',
    dockInactiveIcon: '#8e877e',
    star: '#d97736',
    chipInactiveBg: '#ffffff',
    chipInactiveText: '#22201e',
    chipInactiveBorder: '#eae5dc',
  },
  dark: {
    text: '#f3f0e8',
    tint: '#e0b84c',
    background: '#0a0a0a',
    foreground: '#f3f0e8',
    card: '#151515',
    cardForeground: '#f3f0e8',
    primary: '#b11236',
    primaryForeground: '#fffaf2',
    secondary: '#1e1c1a',
    secondaryForeground: '#f3f0e8',
    muted: '#1e1c1a',
    mutedForeground: '#a6a19a',
    accent: '#e0b84c',
    accentForeground: '#0a0a0a',
    destructive: '#d61f3c',
    destructiveForeground: '#fffaf2',
    border: '#302d29',
    input: '#302d29',
    darkCard: '#151515',
    darkCardForeground: '#f3f0e8',
    dockBackground: 'rgba(21, 21, 21, 0.94)',
    dockBorder: '#302d29',
    dockActive: '#f3f0e8',
    dockActiveIcon: '#0a0a0a',
    dockInactiveIcon: '#a6a19a',
    star: '#e0b84c',
    chipInactiveBg: '#151515',
    chipInactiveText: '#f3f0e8',
    chipInactiveBorder: '#302d29',
  },

  radius: 16,
};

export default colors;
