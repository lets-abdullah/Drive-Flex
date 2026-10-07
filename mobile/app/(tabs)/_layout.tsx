import React, { type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function FloatingTabBar({ state, navigation }: TabBarProps) {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const insets = useSafeAreaInsets();

  const isAndroid = Platform.OS === 'android';
  const dockBottom = isAndroid
    ? Math.max(insets.bottom, 24) + 12
    : Math.max(insets.bottom, 16) + 10;

  return (
    <View
      style={[
        styles.floatingDock,
        {
          bottom: dockBottom,
          backgroundColor: isIOS ? 'transparent' : colors.dockBackground,
          borderColor: colors.dockBorder,
          shadowOpacity: isDark ? 0.35 : 0.08,
        },
      ]}
    >
      {isIOS && (
        <BlurView
          intensity={90}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName: keyof typeof Feather.glyphMap =
          route.name === 'index'
            ? 'home'
            : route.name === 'search'
            ? 'search'
            : route.name === 'favorites'
            ? 'heart'
            : 'user';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            style={styles.tabBtn}
          >
            <View style={[styles.iconPill, isFocused && { backgroundColor: colors.dockActive }]}>
              <Feather
                name={iconName}
                size={20}
                color={isFocused ? colors.dockActiveIcon : colors.dockInactiveIcon}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saved' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingDock: {
    position: 'absolute',
    left: 28,
    right: 28,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
