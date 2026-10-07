import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { useDriveFlex } from '@/context/AppContext';

export function useColors() {
  const systemScheme = useColorScheme();
  let activeTheme: 'light' | 'dark' = 'light';
  try {
    const driveFlex = useDriveFlex();
    if (driveFlex && driveFlex.theme) {
      activeTheme = driveFlex.theme;
    }
  } catch {
    activeTheme = systemScheme === 'dark' ? 'dark' : 'light';
  }

  const palette = activeTheme === 'dark' ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, isDark: activeTheme === 'dark' };
}
