import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Page } from '@/components/Marketplace';
import { BrandLogo, POPULAR_BRANDS } from '@/components/BrandLogos';
import { VehicleCardFeatured } from '@/components/CardDesigns';
import { useDriveFlex } from '@/context/AppContext';
import { useLocationFilter } from '@/context/LocationContext';
import { useColors } from '@/hooks/useColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaRoute: string;
  image: any;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'PREMIUM CAR RENTALS',
    headline: 'Find your kind\nof drive.',
    subtitle: 'Luxury, comfort, and performance —\nall in one place.',
    ctaText: 'Explore Cars',
    ctaRoute: '/(tabs)/search',
    image: require('@/assets/images/hero-luxury-cars.jpg'),
  },
  {
    id: 'slide-2',
    eyebrow: 'EXECUTIVE & CHAUFFEUR',
    headline: 'Arrive in\nunforgettable style.',
    subtitle: 'Curated flagship sedans & grand tourers\nfor your finest moments.',
    ctaText: 'View Collection',
    ctaRoute: '/(tabs)/search',
    image: require('@/assets/images/hero-slide-2-executive.jpg'),
  },
  {
    id: 'slide-3',
    eyebrow: 'NEXT-GEN ELECTRIC',
    headline: 'Zero emissions.\nPure adrenaline.',
    subtitle: 'Instant torque, smart range & seamless\ncontactless mobile key handovers.',
    ctaText: 'Book Instant',
    ctaRoute: '/(tabs)/search',
    image: require('@/assets/images/hero-slide-3-electric.jpg'),
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const {
    vehicles,
    theme,
    toggleTheme,
    session,
  } = useDriveFlex();
  const { currentCity } = useLocationFilter();

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [heroCardWidth, setHeroCardWidth] = useState(SCREEN_WIDTH - 40);
  const heroScrollRef = React.useRef<ScrollView>(null);

  // Curated featured cars for the horizontal carousel (1 car per brand in the current city)
  const featuredCars = useMemo(() => {
    const activeVehicles = vehicles.filter((v) => !v.isDelisted && v.status !== 'maintenance');
    const cityVehicles = activeVehicles.filter(
      (v) =>
        (v.city_name || v.location).toLowerCase().includes(currentCity.name.toLowerCase())
    );
    const source = cityVehicles.length > 0 ? cityVehicles : activeVehicles;
    const seenBrands = new Set<string>();
    const onePerBrand = source.filter((v) => {
      const bKey = v.brand.trim().toLowerCase();
      if (seenBrands.has(bKey)) return false;
      seenBrands.add(bKey);
      return true;
    });
    return onePerBrand;
  }, [vehicles, currentCity.name]);

  const handleBrandSelect = (brandQuery: string) => {
    router.push({
      pathname: '/(tabs)/search',
      params: { brand: brandQuery },
    });
  };

  const userAvatarUri =
    session?.role === 'host'
      ? 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200'
      : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200';

  return (
    <Page tabbed>
      {/* ─── 1. TOP HEADER (DriveFlex Brand Title + Theme Toggle + Profile Avatar) ─── */}
      <View style={styles.topHeader}>
        <View style={styles.brandTitleWrap}>
          <Text style={[styles.brandTitle, { color: colors.foreground }]}>DriveFlex</Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Theme Toggle (Light/Dark mode) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onPress={toggleTheme}
            style={[styles.headerIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather
              name={theme === 'dark' ? 'sun' : 'moon'}
              size={17}
              color={colors.accent}
            />
          </Pressable>

          {/* User Profile Avatar */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Profile"
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.avatarBtn, { borderColor: colors.border }]}
          >
            <Image
              source={{ uri: userAvatarUri }}
              contentFit="cover"
              style={styles.avatarImage}
            />
          </Pressable>
        </View>
      </View>

      {/* ─── 2. HERO BANNER (Promotional Slides) ─── */}
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - heroCardWidth) > 1) {
            setHeroCardWidth(w);
          }
        }}
        style={[
          styles.heroContainer,
          {
            backgroundColor: colors.isDark ? '#0F1318' : '#FFFFFF',
            borderColor: colors.isDark ? '#212732' : colors.border,
          },
        ]}
      >
        <ScrollView
          ref={heroScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={heroCardWidth}
          snapToAlignment="start"
          onMomentumScrollEnd={(e) => {
            const offset = e.nativeEvent.contentOffset.x;
            const nextIdx = Math.round(offset / heroCardWidth);
            if (nextIdx >= 0 && nextIdx < HERO_SLIDES.length && nextIdx !== heroSlideIndex) {
              setHeroSlideIndex(nextIdx);
            }
          }}
          scrollEventThrottle={16}
          style={{ width: heroCardWidth, height: '100%' }}
        >
          {HERO_SLIDES.map((slide) => (
            <View key={slide.id} style={[styles.heroSlideCard, { width: heroCardWidth }]}>
              <Image
                source={slide.image}
                contentFit="cover"
                contentPosition="right center"
                style={StyleSheet.absoluteFill}
                transition={200}
              />
              <LinearGradient
                colors={
                  colors.isDark
                    ? [
                        'rgba(11, 15, 23, 0.96)',
                        'rgba(11, 15, 23, 0.88)',
                        'rgba(11, 15, 23, 0.40)',
                        'rgba(11, 15, 23, 0.05)',
                        'transparent',
                      ]
                    : [
                        'rgba(255, 255, 255, 0.98)',
                        'rgba(255, 255, 255, 0.90)',
                        'rgba(255, 255, 255, 0.42)',
                        'rgba(255, 255, 255, 0.08)',
                        'transparent',
                      ]
                }
                locations={[0, 0.35, 0.50, 0.70, 0.88]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFill, { pointerEvents: 'none' } as any]}
              />

              <View style={styles.heroForegroundContent}>
                <View
                  style={[
                    styles.heroEyebrowPill,
                    {
                      backgroundColor: colors.isDark
                        ? 'rgba(177, 18, 38, 0.18)'
                        : 'rgba(177, 18, 38, 0.08)',
                      borderColor: colors.isDark
                        ? 'rgba(177, 18, 38, 0.35)'
                        : 'rgba(177, 18, 38, 0.2)',
                    },
                  ]}
                >
                  <Text style={[styles.heroEyebrow, { color: colors.primary }]}>
                    {slide.eyebrow}
                  </Text>
                </View>

                <Text numberOfLines={2} style={[styles.heroHeadline, { color: colors.foreground }]}>
                  {slide.headline}
                </Text>

                <Text numberOfLines={2} style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
                  {slide.subtitle}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={slide.ctaText}
                  onPress={() => router.push(slide.ctaRoute as any)}
                  style={({ pressed }) => [
                    styles.heroCtaBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text style={styles.heroCtaBtnText}>{slide.ctaText}</Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 5 }} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.heroDotsRow, { pointerEvents: 'box-none' } as any]}>
          {HERO_SLIDES.map((_, idx) => (
            <Pressable
              key={idx}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${idx + 1}`}
              onPress={() => {
                setHeroSlideIndex(idx);
                heroScrollRef.current?.scrollTo({ x: idx * heroCardWidth, animated: true });
              }}
              hitSlop={10}
              style={[
                styles.heroDot,
                {
                  backgroundColor: idx === heroSlideIndex ? colors.primary : colors.mutedForeground,
                  opacity: idx === heroSlideIndex ? 1 : 0.35,
                  width: idx === heroSlideIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* ─── 3. PROXIMITY QUICK ACTION ─── */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Find premium rides closer to you"
        onPress={() => router.push('/(tabs)/search')}
        style={({ pressed }) => [
          styles.proximityCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.94 },
        ]}
      >
        <View
          style={[
            styles.proximityPinCircle,
            { backgroundColor: colors.isDark ? 'rgba(177, 18, 38, 0.2)' : '#FDF0F2' },
          ]}
        >
          <Feather name="map-pin" size={18} color={colors.primary} />
        </View>

        <View style={styles.proximityTextWrap}>
          <Text style={[styles.proximityTitle, { color: colors.foreground }]}>
            Premium rides, closer to you
          </Text>
          <Text style={[styles.proximitySub, { color: colors.mutedForeground }]}>
            Find the perfect car for your next journey in {currentCity.name}
          </Text>
        </View>

        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </Pressable>

      {/* ─── 4. EXPLORE BY BRAND ─── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            Explore by Brand
          </Text>
          <Text style={[styles.sectionSubheading, { color: colors.mutedForeground }]}>
            Choose from top brands and find your match.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all brands"
          onPress={() => router.push('/(tabs)/search')}
        >
          <Text style={[styles.seeAllLink, { color: colors.primary }]}>See All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsScroll}
      >
        {POPULAR_BRANDS.map((item) => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${item.name}`}
            onPress={() => handleBrandSelect(item.query)}
            style={({ pressed }) => [
              styles.brandItem,
              pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View
              style={[
                styles.brandCircle,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <BrandLogo brand={item.name} size={30} color={colors.foreground} />
            </View>
            <Text style={[styles.brandItemLabel, { color: colors.foreground }]}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ─── 5. FEATURED CARS SECTION ─── */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <View>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            Featured Cars
          </Text>
          <Text style={[styles.sectionSubheading, { color: colors.mutedForeground }]}>
            Top picks for your next ride
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all featured cars"
          onPress={() => router.push('/(tabs)/search')}
        >
          <Feather name="arrow-right" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredCarsScroll}
      >
        {featuredCars.slice(0, 6).map((vehicle) => (
          <VehicleCardFeatured
            key={vehicle.id}
            vehicle={vehicle}
            onPress={() =>
              router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })
            }
          />
        ))}
      </ScrollView>

      {/* ─── 6. FIND CARS NEAR YOU MAP TEASER CARD ─── */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Discover available cars near you on map"
        onPress={() => router.push('/map')}
        style={({ pressed }) => [
          styles.mapTeaserCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.94 },
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 340 76"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Rect
            x="0"
            y="0"
            width="340"
            height="76"
            fill={colors.isDark ? '#0C121A' : '#EFF5FA'}
          />
          <Path
            d="M-10 25 Q100 20 220 30 T350 25 M-10 50 Q160 45 350 55 M40 0 L40 76 M120 0 L120 76 M200 0 L200 76 M280 0 L280 76"
            stroke={colors.isDark ? '#162433' : '#DDE8F0'}
            strokeWidth="1.5"
            fill="none"
          />
          <Path
            d="M0 35 C90 40 180 50 340 55"
            stroke={colors.isDark ? '#233A52' : '#CADCE8'}
            strokeWidth="3.5"
            fill="none"
          />
        </Svg>

        <View style={styles.mapTeaserContent}>
          <View
            style={[
              styles.mapTeaserPinWrap,
              { backgroundColor: colors.isDark ? 'rgba(177, 18, 38, 0.25)' : '#FDE8EB' },
            ]}
          >
            <View style={[styles.mapTeaserPinInner, { backgroundColor: colors.primary }]}>
              <Feather name="navigation" size={13} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.mapTeaserTextWrap}>
            <Text style={[styles.mapTeaserTitle, { color: colors.foreground }]}>
              Find cars near you
            </Text>
            <Text style={[styles.mapTeaserSub, { color: colors.mutedForeground }]}>
              Discover available cars in {currentCity.name} on the map.
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </View>
      </Pressable>

      {/* ─── 7. BOTTOM PROMO CARD ─── */}
      <View style={styles.promoCardContainer}>
        <View style={styles.promoDarkCard}>
          <View style={styles.promoLeftContent}>
            <Text style={styles.promoTitle}>Drive the extraordinary</Text>
            <Text style={styles.promoSubtitle}>
              Premium cars for every occasion.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Book Now"
              onPress={() => router.push('/(tabs)/search')}
              style={({ pressed }) => [
                styles.promoBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.promoBtnText}>Book Now</Text>
            </Pressable>
          </View>

          <View style={styles.promoRightVisual}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
              }}
              contentFit="cover"
              style={styles.promoHeadlightImage}
            />
          </View>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  /* Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginBottom: 16,
    marginTop: 2,
  },
  brandTitleWrap: {
    height: 40,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    lineHeight: 28,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 40,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Hero Section */
  heroContainer: {
    height: 230,
    borderRadius: 24,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroSlideCard: {
    height: 230,
    position: 'relative',
    overflow: 'hidden',
  },
  heroForegroundContent: {
    width: '48%',
    maxWidth: 185,
    height: '100%',
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 18,
    justifyContent: 'center',
    zIndex: 10,
  },
  heroEyebrowPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  heroEyebrow: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 10.5,
    lineHeight: 14.5,
    marginBottom: 12,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 7.5,
    borderRadius: 20,
    shadowColor: '#B11226',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  heroCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroDotsRow: {
    position: 'absolute',
    bottom: 14,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 20,
  },
  heroDot: {
    height: 5,
    borderRadius: 2.5,
  },

  /* Proximity Card */
  proximityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  proximityPinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proximityTextWrap: {
    flex: 1,
  },
  proximityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  proximitySub: {
    fontSize: 11,
    marginTop: 2,
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    fontSize: 11,
    marginTop: 2,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Brands Strip */
  brandsScroll: {
    paddingRight: 20,
    gap: 14,
  },
  brandItem: {
    alignItems: 'center',
    width: 58,
  },
  brandCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  brandItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Featured Cars Horizontal Scroll */
  featuredCarsScroll: {
    paddingRight: 20,
  },

  /* Map Teaser Card */
  mapTeaserCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 22,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapTeaserContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  mapTeaserPinWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTeaserPinInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTeaserTextWrap: {
    flex: 1,
  },
  mapTeaserTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  mapTeaserSub: {
    fontSize: 11,
    marginTop: 2,
  },

  /* Dark Promo Card */
  promoCardContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  promoDarkCard: {
    backgroundColor: '#0D1117',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#21262D',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 16,
    position: 'relative',
    minHeight: 120,
  },
  promoLeftContent: {
    flex: 1.1,
    zIndex: 2,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 14,
  },
  promoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  promoRightVisual: {
    flex: 0.9,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  promoHeadlightImage: {
    width: '100%',
    height: '100%',
  },
});