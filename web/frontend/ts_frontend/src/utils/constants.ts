// Shared color constants for consistent theming across modals and components
export const COLORS = {
  // Cyberpunk/retro theme colors
  primary: '#00B4D8',      // cyan accent
  secondary: '#ff6ec7',    // pink accent
  dark: '#062A3A',         // deep cool background
  darkText: '#9BCAD8',     // muted cyan text
  white: '#ffffff',
  
  // Specific use cases
  error: '#EF4444',        // red-500
  errorHover: '#DC2626',   // red-600
  success: '#10B981',      // green-500
  warning: '#F59E0B',      // amber-500
  
  // Auth modal specific
  loginButton: '#0077B6',        // deeper blue for action
  loginButtonHover: '#0096C7',   // lighter blue for hover
  inputBg: '#E6F9FF',            // very light cyan
  lightGray: '#E6F6FB'           // light gray
} as const;

export type ColorKey = keyof typeof COLORS;
