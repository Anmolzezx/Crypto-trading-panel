import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { scale } from '../helpers/scaler';
import { useColors } from '../styles/colors';
import { useTheme } from '../theme/ThemeContext';
import SunIcon from '../assets/icons/SunIcon';
import MoonIcon from '../assets/icons/MoonIcon';

export function ThemeToggle() {
  const colors = useColors();
  const { isDark, setIsDark } = useTheme();

  const styles = useMemo(
    () => ({
      button: {
        width: scale(32),
        height: scale(32),
        borderRadius: 999,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: colors.Greyscale[50],
      },
    }),
    [colors],
  );

  const iconColor = colors.Greyscale[900];
  const size = 18;

  return (
    <Pressable
      onPress={() => setIsDark(!isDark)}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      }
    >
      {isDark ? (
        <SunIcon size={size} color={iconColor} />
      ) : (
        <MoonIcon size={size} color={iconColor} />
      )}
    </Pressable>
  );
}
