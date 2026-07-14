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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MEAL_ICONS = {
  desayuno: 'sunny-outline',
  comida: 'restaurant-outline',
  cena: 'moon-outline',
};

export default function CafeteriaHistorialScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 700 });
  const s = createStyles(scale);

  const [pisos, setPisos] = useState([]);
  const [pisoFiltro, setPisoFiltro] = useState('');
  const [comidaFiltro, setComidaFiltro] = useState('');
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [soloHoy, setSoloHoy] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/cafeteria/pisos`)
      .then((res) => res.json())
      .then(setPisos)
      .catch(() => setPisos([]));
  }, []);

  const cargarHistorial = useCallback((options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoading(true);
    const params = new URLSearchParams();
    if (pisoFiltro) params.append('piso', pisoFiltro);
    if (comidaFiltro) params.append('tipo_comida', comidaFiltro);
    if (nombreFiltro.trim()) params.append('nombre', nombreFiltro.trim());
    if (soloHoy) {
      const hoy = new Date();
      const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      params.append('fecha', fecha);
    }

    fetch(`${API_URL}/api/cafeteria/historial?${params.toString()}`)
      .then((res) => res.json())
      .then(setRegistros)
      .catch(() => {
        if (!silent) setRegistros([]);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  }, [pisoFiltro, comidaFiltro, nombreFiltro, soloHoy]);

  useEffect(() => {
    const timeout = setTimeout(cargarHistorial, 300);
    return () => clearTimeout(timeout);
  }, [cargarHistorial]);

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
            <TouchableOpacity onPress={() => router.push('/cafeteria')} style={s.iconButton}>
              <Ionicons name="home-outline" size={16 * scale} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>MÓDULO DE CAFETERÍA</Text>
          <Text style={s.headerTitle}>Historial de entregas</Text>
        </View>
      </LinearGradient>

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>
          <View style={s.filtersRow}>
            <View style={s.searchBox}>
              <Ionicons name="search-outline" size={16 * scale} color={COLORS.silver} />
              <TextInput
                style={s.searchInput}
                placeholder="Buscar por nombre o habitación..."
                placeholderTextColor="#9ca3af"
                value={nombreFiltro}
                onChangeText={setNombreFiltro}
              />
            </View>
            <TouchableOpacity
              style={[s.todayToggle, soloHoy && s.todayToggleActive]}
              onPress={() => setSoloHoy((v) => !v)}
            >
              <Ionicons name="calendar-outline" size={15 * scale} color={soloHoy ? COLORS.white : COLORS.royalBlue} />
              <Text style={[s.todayToggleText, soloHoy && s.todayToggleTextActive]}>Solo hoy</Text>
            </TouchableOpacity>
          </View>

          <View style={s.chipRow}>
            <TouchableOpacity style={[s.chip, comidaFiltro === '' && s.chipSelected]} onPress={() => setComidaFiltro('')}>
              <Text style={[s.chipText, comidaFiltro === '' && s.chipTextSelected]}>Todas las comidas</Text>
            </TouchableOpacity>
            {Object.keys(MEAL_ICONS).map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[s.chip, comidaFiltro === tipo && s.chipSelected]}
                onPress={() => setComidaFiltro(tipo)}
              >
                <Text style={[s.chipText, comidaFiltro === tipo && s.chipTextSelected]}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.chipRow}>
            <TouchableOpacity style={[s.chip, pisoFiltro === '' && s.chipSelected]} onPress={() => setPisoFiltro('')}>
              <Text style={[s.chipText, pisoFiltro === '' && s.chipTextSelected]}>Todos los pisos</Text>
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
              <Text style={s.emptyText}>No hay entregas registradas con estos filtros</Text>
            </View>
          ) : (
            <FlatList
              data={registros}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={s.listContent}
              renderItem={({ item }) => (
                <View style={s.card}>
                  <View style={s.cardIcon}>
                    <Ionicons name={MEAL_ICONS[item.tipo_comida] || 'restaurant-outline'} size={20 * scale} color={COLORS.royalBlue} />
                  </View>
                  <View style={s.cardInfo}>
                    <Text style={s.cardNombre} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={s.cardUbicacion}>
                      {item.piso} · Hab. {item.habitacion} · {item.tipo_comida.charAt(0).toUpperCase() + item.tipo_comida.slice(1)}
                    </Text>
                    <Text style={s.cardDetalle} numberOfLines={1}>
                      {item.platillo ? `${item.platillo} · ` : ''}
                      {item.lugar_entrega === 'habitacion' ? 'Entregado en habitación' : 'Entregado en comedor'}
                      {item.registrado_por ? ` · Por ${item.registrado_por}` : ''}
                    </Text>
                  </View>
                  <View style={s.cardTimeBox}>
                    <Text style={s.cardFecha}>{item.fecha_label}</Text>
                    <Text style={s.cardHora}>{item.hora}</Text>
                  </View>
                </View>
              )}
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

    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 * scale },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 36 * scale,
      height: 36 * scale,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSubtitle: { color: COLORS.periwinkle, fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { color: COLORS.white, fontSize: 24 * scale, fontWeight: 'bold' },

    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1, paddingHorizontal: 24 * scale, paddingTop: 20 * scale },

    filtersRow: { flexDirection: 'row', gap: 10 * scale, marginBottom: 14 * scale },
    searchBox: {
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

    todayToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6 * scale,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 14 * scale,
    },
    todayToggleActive: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    todayToggleText: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '700' },
    todayToggleTextActive: { color: COLORS.white },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 * scale, marginBottom: 14 * scale },
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
      padding: 14 * scale,
      marginBottom: 12 * scale,
      borderWidth: 1,
      borderColor: '#F0F2F8',
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    cardIcon: {
      width: 44 * scale,
      height: 44 * scale,
      borderRadius: 12,
      backgroundColor: COLORS.royalBlueSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14 * scale,
    },
    cardInfo: { flex: 1 },
    cardNombre: { color: COLORS.palatinateBlue, fontSize: 15 * scale, fontWeight: 'bold', marginBottom: 2 },
    cardUbicacion: { color: '#6b7280', fontSize: 13 * scale, marginBottom: 2 },
    cardDetalle: { color: COLORS.silver, fontSize: 11 * scale, fontWeight: '600' },

    cardTimeBox: { alignItems: 'flex-end' },
    cardFecha: { color: COLORS.silver, fontSize: 11 * scale, fontWeight: '600', marginBottom: 2 },
    cardHora: { color: COLORS.palatinateBlue, fontSize: 14 * scale, fontWeight: 'bold' },
  });
