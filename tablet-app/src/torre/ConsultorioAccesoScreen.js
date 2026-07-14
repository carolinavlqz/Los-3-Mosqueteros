import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

const PRIVACY_URL = 'https://medicamia.com.mx/aviso-de-privacidad-2/';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const COLUMNS = 4;
const CONTAINER_PADDING = 24;

export default function ConsultorioAccesoScreen() {
  const router = useRouter();
  const { tipo, piso } = useLocalSearchParams();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 560 });
  const s = createStyles(scale);

  const [consultorios, setConsultorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const cargarConsultorios = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    fetch(`${API_URL}/api/torre/consultorios?piso=${encodeURIComponent(piso)}`)
      .then((res) => res.json())
      .then((data) => setConsultorios(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [piso]);

  useEffect(() => {
    cargarConsultorios();
  }, [cargarConsultorios]);

  const gap = 12 * scale;
  const gridWidth = contentWidth - CONTAINER_PADDING * scale * 2;
  const tileWidth = (gridWidth - gap * (COLUMNS - 1)) / COLUMNS;

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      {/* ===== HEADER CON GRADIENTE DE MARCA ===== */}
      <LinearGradient
        colors={[COLORS.palatinateBlue, '#0A2A6B', COLORS.royalBlue]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.glowCircleTop} pointerEvents="none" />
        <View style={s.glowCircleBottom} pointerEvents="none" />

        <View style={[s.headerContentContainer, (isLandscape || isTablet) && s.headerLandscape]}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
              <Ionicons name="chevron-back" size={18 * scale} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/torre')} style={s.iconButton}>
              <Ionicons name="home-outline" size={16 * scale} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>TORRE MIA 57</Text>
          <Text style={s.headerTitle}>Consultorio a Acceder</Text>
        </View>
      </LinearGradient>
      {/* ===== FIN HEADER ===== */}

      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            {isLoading ? (
              <View style={s.statusContainer}>
                <ActivityIndicator size="large" color={COLORS.royalBlue} />
              </View>
            ) : hasError ? (
              <View style={s.statusContainer}>
                <Text style={s.errorText}>No se pudo cargar el listado de consultorios.</Text>
                <TouchableOpacity style={s.retryButton} onPress={cargarConsultorios} activeOpacity={0.85}>
                  <Text style={s.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.grid}>
                {consultorios.map((consultorio) => (
                  <TouchableOpacity
                    key={consultorio}
                    style={[s.tile, { width: tileWidth, height: tileWidth / 1.9 }]}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({ pathname: '/torre/foto', params: { tipo, piso, consultorio } })
                    }
                  >
                    <Text style={s.tileLabel}>{consultorio}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.7}>
              <Text style={s.privacyText}>
                Consulta el aviso de privacidad en:{'\n'}
                <Text style={s.privacyLink}>{PRIVACY_URL}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
    scrollContent: { flexGrow: 1 },

    header: {
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 28 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    },
    headerContentContainer: {},
    headerLandscape: { paddingHorizontal: 20 * scale },

    glowCircleTop: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(219,24,48,0.16)',
    },
    glowCircleBottom: {
      position: 'absolute',
      bottom: -60,
      left: -50,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(184,199,238,0.10)',
    },

    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24 * scale,
    },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 36 * scale,
      height: 36 * scale,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSubtitle: {
      color: COLORS.periwinkle,
      fontSize: 12 * scale,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    headerTitle: { color: COLORS.white, fontSize: 26 * scale, fontWeight: 'bold' },

    outerContainer: { flex: 1, alignItems: 'center' },
    container: {
      flex: 1,
      paddingHorizontal: 24 * scale,
      paddingTop: 28 * scale,
      paddingBottom: 28 * scale,
    },

    statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 * scale, paddingVertical: 60 * scale },
    errorText: { color: COLORS.silver, fontSize: 14 * scale, textAlign: 'center' },
    retryButton: {
      backgroundColor: COLORS.royalBlue,
      paddingHorizontal: 24 * scale,
      paddingVertical: 12 * scale,
      borderRadius: 14,
    },
    retryText: { color: COLORS.white, fontSize: 15 * scale, fontWeight: 'bold' },

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      gap: 12 * scale,
      marginBottom: 28 * scale,
    },

    tile: {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.royalBlue,
      borderWidth: 1,
      borderColor: 'rgba(3,30,93,0.10)',
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 5,
      elevation: 2,
    },
    tileLabel: {
      color: COLORS.white,
      fontSize: 15 * scale,
      fontWeight: 'bold',
    },

    privacyText: {
      textAlign: 'center',
      color: COLORS.silver,
      fontSize: 12 * scale,
      lineHeight: 18 * scale,
    },
    privacyLink: {
      color: COLORS.royalBlue,
      textDecorationLine: 'underline',
    },
  });
