import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

interface CarLoadingProps {
  message?: string;
  onFinish?: () => void;
  minDuration?: number;
}

export function CarLoadingScreen({
  message = 'PREPARING YOUR RIDE...',
  onFinish,
  minDuration = 1800,
}: CarLoadingProps) {
  const colors = useColors();

  // Animations
  const wheelSpin = useRef(new Animated.Value(0)).current;
  const carBounce = useRef(new Animated.Value(0)).current;
  const roadDash = useRef(new Animated.Value(0)).current;
  const headlightPulse = useRef(new Animated.Value(0.4)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Wheel spin loop
    const spinLoop = Animated.loop(
      Animated.timing(wheelSpin, {
        toValue: 1,
        duration: 750,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    spinLoop.start();

    // 2. Car suspension bounce (subtle realistic micro-motion)
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(carBounce, {
          toValue: -2.5,
          duration: 280,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(carBounce, {
          toValue: 0.5,
          duration: 320,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    bounceLoop.start();

    // 3. Road dashes passing by
    const roadLoop = Animated.loop(
      Animated.timing(roadDash, {
        toValue: -120,
        duration: 650,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    roadLoop.start();

    // 4. Headlight beam pulsing
    const lightLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(headlightPulse, {
          toValue: 0.85,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(headlightPulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    lightLoop.start();

    // 5. Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: minDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      // Fade out and finish
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 350,
        easing: Easing.ease,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        if (onFinish) onFinish();
      });
    });

    return () => {
      spinLoop.stop();
      bounceLoop.stop();
      roadLoop.stop();
      lightLoop.stop();
    };
  }, []);

  const spin = wheelSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const screenWidth = Dimensions.get('window').width;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: fadeOut,
        },
      ]}
    >
      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <View style={[styles.brandBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.brandIconText}>▲</Text>
        </View>
        <Text style={[styles.brandTitle, { color: colors.foreground }]}>DRIVEFLEX</Text>
        <Text style={[styles.brandSubtitle, { color: colors.mutedForeground }]}>
          LUXURY & EVERYDAY RENTALS
        </Text>
      </View>

      {/* ─── ANIMATED CAR STAGE ─── */}
      <View style={styles.carStage}>
        {/* Headlight beam */}
        <Animated.View
          style={[
            styles.headlightGlow,
            {
              opacity: headlightPulse,
            },
          ]}
        >
          <Svg width={140} height={60} viewBox="0 0 140 60">
            <Defs>
              <LinearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.accent} stopOpacity="0.5" />
                <Stop offset="0.6" stopColor="#ffffff" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d="M 0,20 L 140,0 L 140,60 L 0,35 Z" fill="url(#beamGrad)" />
          </Svg>
        </Animated.View>

        {/* Car Body with subtle bounce */}
        <Animated.View
          style={[
            styles.carBodyWrap,
            {
              transform: [{ translateY: carBounce }],
            },
          ]}
        >
          <Svg width={210} height={70} viewBox="0 0 210 70">
            <Defs>
              <LinearGradient id="carBodyGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.foreground} />
                <Stop offset="0.7" stopColor={colors.foreground} />
                <Stop offset="1" stopColor={colors.accent} />
              </LinearGradient>
              <LinearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#6ba4ff" stopOpacity="0.8" />
                <Stop offset="1" stopColor="#305080" stopOpacity="0.8" />
              </LinearGradient>
            </Defs>

            {/* Aerodynamic sports chassis */}
            <Path
              d="M 15,44 
                 C 20,44 26,30 38,24 
                 C 50,18 78,14 105,14 
                 C 132,14 150,20 168,28 
                 C 182,34 195,38 204,42 
                 C 207,43 209,47 207,50 
                 C 205,53 198,54 190,54 
                 L 165,54 
                 C 162,43 148,43 145,54 
                 L 70,54 
                 C 67,43 53,43 50,54 
                 L 16,54 
                 C 12,54 10,50 11,46 
                 Z"
              fill="url(#carBodyGrad)"
            />

            {/* Tinted Cabin Windows */}
            <Path
              d="M 52,24 
                 C 60,18 80,16 104,16 
                 C 124,16 142,20 156,26 
                 L 138,26 
                 L 88,26 
                 Z"
              fill="url(#glassGrad)"
            />
            <Path
              d="M 104,16 
                 L 104,26 
                 L 101,26 
                 L 101,16 
                 Z"
              fill="#222222"
            />

            {/* Front Headlight LED */}
            <Path
              d="M 198,42 L 206,44 L 201,47 L 194,45 Z"
              fill="#ffffff"
            />

            {/* Rear Tail Light */}
            <Path
              d="M 12,43 L 15,43 L 15,48 L 12,47 Z"
              fill="#ff3b30"
            />

            {/* Side aerodynamic accent line */}
            <Path
              d="M 38,36 Q 105,32 178,39"
              stroke={colors.accent}
              strokeWidth="1.5"
              fill="none"
              opacity={0.8}
            />
          </Svg>

          {/* Left Spinning Wheel */}
          <Animated.View
            style={[
              styles.wheel,
              styles.wheelLeft,
              {
                borderColor: colors.foreground,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="11" fill="#1c1c1e" stroke={colors.mutedForeground} strokeWidth="1.5" />
              <Circle cx="12" cy="12" r="4.5" fill={colors.accent} />
              {/* Alloy Spokes */}
              <Path d="M 12,2 L 12,22 M 2,12 L 22,12 M 5,5 L 19,19 M 5,19 L 19,5" stroke="#ffffff" strokeWidth="1" opacity={0.6} />
            </Svg>
          </Animated.View>

          {/* Right Spinning Wheel */}
          <Animated.View
            style={[
              styles.wheel,
              styles.wheelRight,
              {
                borderColor: colors.foreground,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="11" fill="#1c1c1e" stroke={colors.mutedForeground} strokeWidth="1.5" />
              <Circle cx="12" cy="12" r="4.5" fill={colors.accent} />
              {/* Alloy Spokes */}
              <Path d="M 12,2 L 12,22 M 2,12 L 22,12 M 5,5 L 19,19 M 5,19 L 19,5" stroke="#ffffff" strokeWidth="1" opacity={0.6} />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* ─── MOVING ROAD SURFACE ─── */}
        <View style={styles.roadContainer}>
          <View style={[styles.roadLine, { backgroundColor: colors.border }]} />
          <Animated.View
            style={[
              styles.roadDashWrap,
              {
                transform: [{ translateX: roadDash }],
              },
            ]}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.roadDash,
                  {
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            ))}
          </Animated.View>
        </View>
      </View>

      {/* Progress & Status Message */}
      <View style={styles.bottomSection}>
        <Text style={[styles.loadingMessage, { color: colors.mutedForeground }]}>
          {message}
        </Text>

        {/* Sleek Progress Track */}
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.accent,
                width: progressBarWidth,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  carStage: {
    width: 250,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  carBodyWrap: {
    width: 210,
    height: 70,
    position: 'relative',
    alignItems: 'center',
  },
  headlightGlow: {
    position: 'absolute',
    right: -70,
    top: 30,
    zIndex: 1,
  },
  wheel: {
    position: 'absolute',
    bottom: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  wheelLeft: {
    left: 45,
  },
  wheelRight: {
    left: 140,
  },
  roadContainer: {
    width: 240,
    height: 20,
    overflow: 'hidden',
    marginTop: 4,
    alignItems: 'center',
  },
  roadLine: {
    width: '100%',
    height: 2,
    borderRadius: 1,
  },
  roadDashWrap: {
    flexDirection: 'row',
    width: 380,
    gap: 16,
    marginTop: 6,
  },
  roadDash: {
    width: 24,
    height: 3,
    borderRadius: 2,
    opacity: 0.7,
  },
  bottomSection: {
    width: 200,
    alignItems: 'center',
    marginTop: 35,
  },
  loadingMessage: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
