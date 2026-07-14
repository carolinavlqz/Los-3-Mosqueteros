import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { useGridColumns, clampColumns } from './useGridColumns';
import GridSizeControl from './GridSizeControl';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CONTAINER_PADDING = 24;

export default function TorreActivosScreen() {
  const router = useRouter();
  const { piso, consultorio, nombre, id } = useLocalSearchParams();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 560 });
  const s = createStyles(scale);
  const { size, columns: columnasElegidas, changeSize } = useGridColumns();

  const [personas, setPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarActivos = useCallback((options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoading(true);
    fetch(`${API_URL}/api/torre/activos?piso=${encodeURIComponent(piso)}`)
      .then((res) => res.json())
      .then(setPersonas)
      .catch(() => {
        if (!silent) setPersonas([]);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  }, [piso]);

  useEffect(() => {
    cargarActivos();
  }, [cargarActivos]);

  // Refresca en segundo plano cada 5s mientras la pantalla está en foco.
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => cargarActivos({ silent: true }), 5000);
      return () => clearInterval(interval);
    }, [cargarActivos])
  );

  const gap = 16 * scale;
  const gridWidth = contentWidth - CONTAINER_PADDING * scale * 2;
  const columns = clampColumns(columnasElegidas, gridWidth);
  const cardWidth = (gridWidth - gap * (columns - 1)) / columns;

  const handleFinalizar = () => router.push('/torre');

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
            <TouchableOpacity onPress={() => router.push('/torre')} style={s.iconButton}>
              <Ionicons name="home-outline" size={16 * scale} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>TORRE MIA 57</Text>
          <Text style={s.headerTitle}>Piso {String(piso).match(/\d+/)?.[0] || piso} · Activos</Text>
        </View>
      </LinearGradient>
      {/* ===== FIN HEADER ===== */}

      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            <View style={s.successBanner}>
              <Ionicons name="checkmark-circle" size={22 * scale} color={COLORS.royalBlue} />
              <Text style={s.successText}>
                {nombre} — Consultorio {consultorio} registrado correctamente
              </Text>
            </View>

            {!isLoading && personas.length > 0 && (
              <GridSizeControl size={size} onChange={changeSize} scale={scale} />
            )}

            {isLoading ? (
              <View style={s.statusContainer}>
                <ActivityIndicator size="large" color={COLORS.royalBlue} />
              </View>
            ) : (
              <View style={s.grid}>
                {personas.map((persona) => {
                  const esNuevo = String(persona.id) === String(id);
                  const fotoUrl = persona.foto ? `${API_URL}${persona.foto}` : null;
                  return (
                    <View
                      key={persona.id}
                      style={[s.card, { width: cardWidth, height: cardWidth * 1.15 }, esNuevo && s.cardNuevo]}
                    >
                      {fotoUrl ? (
                        <Image source={{ uri: fotoUrl }} style={s.cardPhoto} resizeMode="cover" />
                      ) : (
                        <View style={[s.cardPhoto, s.cardPhotoFallback]}>
                          <Ionicons name="person" size={30 * scale} color={COLORS.palatinateBlue} />
                        </View>
                      )}

                      <View style={s.nombreBadge}>
                        <Text style={s.nombreText} numberOfLines={1}>{persona.nombre}</Text>
                      </View>

                      <View style={s.ubicacionBadge}>
                        <Text style={s.ubicacionText}>{persona.piso} · {persona.consultorio}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={s.finalizarButton} onPress={handleFinalizar} activeOpacity={0.85}>
              <Text style={s.finalizarText}>Finalizar</Text>
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
      justifyContent: 'flex-end',
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
    headerTitle: { color: COLORS.white, fontSize: 24 * scale, fontWeight: 'bold' },

    scrollContent: { flexGrow: 1 },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: {
      flex: 1,
      paddingHorizontal: 24 * scale,
      paddingTop: 24 * scale,
      paddingBottom: 28 * scale,
    },

    statusContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 * scale },

    successBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10 * scale,
      backgroundColor: COLORS.royalBlueSoft,
      borderRadius: 14,
      padding: 14 * scale,
      marginBottom: 24 * scale,
    },
    successText: { flex: 1, color: COLORS.palatinateBlue, fontSize: 13 * scale, fontWeight: '600' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 * scale, marginBottom: 8 * scale },

    card: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#F0F2F8',
      backgroundColor: COLORS.white,
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 2,
    },
    cardNuevo: { borderColor: COLORS.royalBlue, borderWidth: 2 },

    cardPhoto: { ...StyleSheet.absoluteFillObject },
    cardPhotoFallback: {
      backgroundColor: COLORS.periwinkleSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    nombreBadge: {
      position: 'absolute',
      top: 8 * scale,
      left: 8 * scale,
      right: 8 * scale,
      backgroundColor: COLORS.palatinateBlueSoft,
      borderRadius: 8,
      paddingVertical: 4 * scale,
      paddingHorizontal: 8 * scale,
    },
    nombreText: { color: COLORS.white, fontSize: 12 * scale, fontWeight: 'bold' },

    ubicacionBadge: {
      position: 'absolute',
      bottom: 8 * scale,
      left: 8 * scale,
      backgroundColor: COLORS.palatinateBlueSoft,
      borderRadius: 8,
      paddingVertical: 4 * scale,
      paddingHorizontal: 8 * scale,
    },
    ubicacionText: { color: COLORS.white, fontSize: 11 * scale, fontWeight: '600' },

    finalizarButton: {
      backgroundColor: COLORS.royalBlue,
      padding: 18 * scale,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 16 * scale,
    },
    finalizarText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });
