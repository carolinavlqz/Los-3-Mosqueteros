import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TorreHistorialScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 700 });
  const s = createStyles(scale);

  const [pisos, setPisos] = useState([]);
  const [pisoFiltro, setPisoFiltro] = useState('');
  const [consultorioFiltro, setConsultorioFiltro] = useState('');
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/torre/pisos`)
      .then((res) => res.json())
      .then((data) => setPisos(data.map((p) => p.piso)))
      .catch(() => setPisos([]));
  }, []);

  const cargarHistorial = useCallback((options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoading(true);
    const params = new URLSearchParams();
    if (pisoFiltro) params.append('piso', pisoFiltro);
    if (consultorioFiltro.trim()) params.append('consultorio', consultorioFiltro.trim());
    if (nombreFiltro.trim()) params.append('nombre', nombreFiltro.trim());

    fetch(`${API_URL}/api/torre/historial?${params.toString()}`)
      .then((res) => res.json())
      .then(setRegistros)
      .catch(() => {
        if (!silent) setRegistros([]);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  }, [pisoFiltro, consultorioFiltro, nombreFiltro]);

  useEffect(() => {
    const timeout = setTimeout(cargarHistorial, 300);
    return () => clearTimeout(timeout);
  }, [cargarHistorial]);

  // Refresca en segundo plano cada 5s mientras la pantalla está en foco.
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => cargarHistorial({ silent: true }), 5000);
      return () => clearInterval(interval);
    }, [cargarHistorial])
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

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
          <Text style={s.headerTitle}>Historial</Text>
        </View>
      </LinearGradient>

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>
          <View style={s.filtersRow}>
            <View style={s.searchBox}>
              <Ionicons name="search-outline" size={16 * scale} color={COLORS.silver} />
              <TextInput
                style={s.searchInput}
                placeholder="Buscar por nombre..."
                placeholderTextColor="#9ca3af"
                value={nombreFiltro}
                onChangeText={setNombreFiltro}
              />
            </View>
            <View style={s.consultorioBox}>
              <Ionicons name="business-outline" size={16 * scale} color={COLORS.silver} />
              <TextInput
                style={s.searchInput}
                placeholder="Consultorio"
                placeholderTextColor="#9ca3af"
                value={consultorioFiltro}
                onChangeText={setConsultorioFiltro}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={s.chipRow}>
            <TouchableOpacity style={[s.chip, pisoFiltro === '' && s.chipSelected]} onPress={() => setPisoFiltro('')}>
              <Text style={[s.chipText, pisoFiltro === '' && s.chipTextSelected]}>Todos</Text>
            </TouchableOpacity>
            {pisos.map((p) => (
              <TouchableOpacity
                key={p}
                style={[s.chip, pisoFiltro === p && s.chipSelected]}
                onPress={() => setPisoFiltro(p)}
              >
                <Text style={[s.chipText, pisoFiltro === p && s.chipTextSelected]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <View style={s.statusContainer}>
              <ActivityIndicator size="large" color={COLORS.royalBlue} />
            </View>
          ) : registros.length === 0 ? (
            <View style={s.statusContainer}>
              <Ionicons name="document-text-outline" size={40 * scale} color={COLORS.silver} />
              <Text style={s.emptyText}>No hay registros con estos filtros</Text>
            </View>
          ) : (
            <FlatList
              data={registros}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={s.listContent}
              renderItem={({ item }) => {
                const esActivo = item.estado === 'activa';
                return (
                  <View style={s.card}>
                    {item.foto ? (
                      <Image source={{ uri: `${API_URL}${item.foto}` }} style={s.avatar} />
                    ) : (
                      <View style={[s.avatar, s.avatarFallback]}>
                        <Ionicons name="person" size={22 * scale} color={COLORS.palatinateBlue} />
                      </View>
                    )}
                    <View style={s.cardInfo}>
                      <Text style={s.cardNombre} numberOfLines={1}>{item.nombre}</Text>
                      <Text style={s.cardUbicacion}>{item.piso} · Consultorio {item.consultorio}</Text>
                      <Text style={s.cardHora}>Entrada {item.horaEntrada} · Salida {item.horaSalida}</Text>
                    </View>
                    <View style={[s.badge, esActivo ? s.badgeActivo : s.badgeFinalizado]}>
                      <Text style={[s.badgeText, esActivo ? s.badgeTextActivo : s.badgeTextFinalizado]}>
                        {esActivo ? 'Activo' : 'Finalizado'}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },

    header: {
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 24 * scale,
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
      marginBottom: 20 * scale,
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

    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1, paddingHorizontal: 24 * scale, paddingTop: 20 * scale },

    filtersRow: { flexDirection: 'row', gap: 10 * scale, marginBottom: 14 * scale },
    searchBox: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8 * scale,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 12 * scale,
      paddingVertical: Platform.OS === 'ios' ? 12 * scale : 2 * scale,
    },
    consultorioBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8 * scale,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 12 * scale,
      paddingVertical: Platform.OS === 'ios' ? 12 * scale : 2 * scale,
    },
    searchInput: { flex: 1, fontSize: 14 * scale, color: '#111827' },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 * scale, marginBottom: 18 * scale },
    chip: {
      paddingHorizontal: 14 * scale,
      paddingVertical: 8 * scale,
      borderRadius: 20,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    chipSelected: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    chipText: { color: '#4b5563', fontSize: 13 * scale, fontWeight: '600' },
    chipTextSelected: { color: COLORS.white },

    statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 * scale, paddingVertical: 60 * scale },
    emptyText: { color: COLORS.silver, fontSize: 14 * scale, textAlign: 'center' },

    listContent: { paddingBottom: 24 * scale },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 12 * scale,
      marginBottom: 12 * scale,
      borderWidth: 1,
      borderColor: '#F0F2F8',
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    avatar: { width: 52 * scale, height: 52 * scale, borderRadius: 14, marginRight: 14 * scale },
    avatarFallback: { backgroundColor: COLORS.periwinkleSoft, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1 },
    cardNombre: { color: COLORS.palatinateBlue, fontSize: 15 * scale, fontWeight: 'bold', marginBottom: 2 },
    cardUbicacion: { color: '#6b7280', fontSize: 13 * scale, marginBottom: 2 },
    cardHora: { color: COLORS.silver, fontSize: 11 * scale, fontWeight: '600' },

    badge: { paddingHorizontal: 10 * scale, paddingVertical: 6 * scale, borderRadius: 10 },
    badgeActivo: { backgroundColor: COLORS.royalBlueSoft },
    badgeFinalizado: { backgroundColor: '#F3F4F6' },
    badgeText: { fontSize: 11 * scale, fontWeight: 'bold' },
    badgeTextActivo: { color: COLORS.royalBlue },
    badgeTextFinalizado: { color: COLORS.silver },
  });
