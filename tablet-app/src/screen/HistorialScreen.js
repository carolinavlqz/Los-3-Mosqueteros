import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HistorialScreen() {
  const router = useRouter();
  const { contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/visitas/historial`);
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filters = ['Todos', 'Proveedor', 'Familiar', 'Postulante'];

  const filteredHistory = useMemo(() => {
    return history.filter(v => {
      const nombreValido = v.nombre ? v.nombre.toLowerCase() : '';
      const folioValido = v.folio ? v.folio.toLowerCase() : '';
      const busqueda = searchQuery.toLowerCase();

      const matchesSearch = nombreValido.includes(busqueda) || folioValido.includes(busqueda);
      const matchesType = activeFilter === 'Todos' || v.tipo === activeFilter;
      return matchesSearch && matchesType;
    });
  }, [history, searchQuery, activeFilter]);

  const hoyStats = useMemo(() => history.filter(v => v.fecha === 'Hoy'), [history]);
  const totalHoy = hoyStats.length;
  const activosHoy = hoyStats.filter(v => v.estado === 'activa').length;
  const completadosHoy = hoyStats.filter(v => v.estado === 'finalizada').length;

  const getBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'Proveedor': return s.badgeProveedor;
      case 'Familiar': return s.badgeFamiliar;
      case 'Postulante': return s.badgePostulante;
      default: return s.badgeProveedor;
    }
  };

  const getBadgeTextStyle = (tipo) => {
    switch (tipo) {
      case 'Proveedor': return s.badgeTextProveedor;
      case 'Familiar': return s.badgeTextFamiliar;
      case 'Postulante': return s.badgeTextPostulante;
      default: return s.badgeTextProveedor;
    }
  };

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
        {/* Detalles decorativos tipo "glow" */}
        <View style={s.glowCircleTop} pointerEvents="none" />
        <View style={s.glowCircleBottom} pointerEvents="none" />

        <View style={s.headerContentContainer}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
              <Ionicons name="chevron-back" size={22 * scale} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton}>
              <Ionicons name="home-outline" size={20 * scale} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>REGISTROS</Text>
          <Text style={s.headerTitle}>Historial de Visitas</Text>
        </View>
      </LinearGradient>
      {/* ===== FIN HEADER ===== */}

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
        <View style={[s.container, { width: contentWidth }]}>

          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={20 * scale} color={COLORS.silver} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar registros..."
              placeholderTextColor={COLORS.silver}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={s.filtersContainer}>
            {filters.map((filter, i) => (
              <TouchableOpacity
                key={i}
                style={[s.filterChip, activeFilter === filter && s.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[s.filterText, activeFilter === filter && s.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={[s.statNumber, { color: COLORS.palatinateBlue }]}>{totalHoy}</Text>
              <Text style={s.statLabel}>Total hoy</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNumber, { color: COLORS.royalBlue }]}>{activosHoy}</Text>
              <Text style={s.statLabel}>Activos</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNumber, { color: COLORS.silver }]}>{completadosHoy}</Text>
              <Text style={s.statLabel}>Completados</Text>
            </View>
          </View>

          <Text style={s.sectionHeader}>TODOS LOS REGISTROS · {filteredHistory.length}</Text>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.royalBlue} style={{ marginTop: 50 }} />
          ) : (
            <View style={s.listContainer}>
              {filteredHistory.map(v => {
                const fotoUri = v.foto_persona ? `${API_URL}${v.foto_persona}` : null;
                const isActivo = v.estado === 'activa';
                return (
                  <View key={v.id} style={s.card}>
                    <View style={s.cardContent}>
                      {fotoUri ? (
                        <Image source={{ uri: fotoUri }} style={s.avatar} />
                      ) : (
                        <View style={s.avatarPlaceholder}>
                          <Ionicons name="person-outline" size={22 * scale} color={COLORS.silver} />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text style={s.visitorName}>{v.nombre || 'Sin nombre'}</Text>
                        <View style={s.badgesRow}>
                          <View style={[s.badge, getBadgeStyle(v.tipo)]}>
                            <Text style={[s.badgeText, getBadgeTextStyle(v.tipo)]}>{v.tipo}</Text>
                          </View>
                          <Text style={s.folioText}>{v.folio}</Text>
                        </View>
                        <View style={s.locationRow}>
                          <Ionicons name="location-outline" size={14 * scale} color={COLORS.silver} />
                          <Text style={s.locationText}>{v.destino || 'Sin destino asignado'}</Text>
                        </View>
                        <Text style={s.dateText}>{v.fecha}</Text>
                      </View>

                      <View style={s.timesContainer}>
                        <Text style={s.timeText}>E: <Text style={s.timeValue}>{v.horaEntrada}</Text></Text>
                        {isActivo ? (
                          <View style={s.activeBadge}><Text style={s.activeBadgeText}>Activo</Text></View>
                        ) : (
                          <Text style={s.timeText}>S: <Text style={s.timeValue}>{v.horaSalida}</Text></Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

              {filteredHistory.length === 0 && (
                <Text style={s.emptyText}>No se encontraron registros que coincidan.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
    container: { paddingBottom: 40 * scale },

    header: {
      alignItems: 'center',
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    },
    headerContentContainer: { 
      width: '100%', 
      maxWidth: 760,
      paddingHorizontal: 28 * scale, 
      paddingTop: Platform.OS === 'android' ? 40 : 20, 
      paddingBottom: 24 * scale 
    },
    
    // Detalles Glow del Header
    glowCircleTop: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(219,24,48,0.16)', // Toque del brandRed
    },
    glowCircleBottom: {
      position: 'absolute',
      bottom: -60,
      left: -50,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(184,199,238,0.10)', // Toque del periwinkle
    },

    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 * scale },
    iconButton: { 
      backgroundColor: 'rgba(255, 255, 255, 0.15)', 
      width: 44 * scale, 
      height: 44 * scale, 
      borderRadius: 12, 
      alignItems: 'center', 
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    headerSubtitle: { 
      color: COLORS.periwinkle, 
      fontSize: 12 * scale, 
      fontWeight: '600', 
      letterSpacing: 1.5, 
      marginBottom: 4,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3, 
    },
    headerTitle: { 
      color: COLORS.white, 
      fontSize: 26 * scale, 
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4, 
    },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 24 * scale, marginTop: 24 * scale, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
    searchInput: { flex: 1, marginLeft: 10 * scale, fontSize: 16 * scale, color: '#111827' },

    filtersContainer: { flexDirection: 'row', marginHorizontal: 24 * scale, marginTop: 16 * scale, gap: 10 * scale, flexWrap: 'wrap' },
    filterChip: { backgroundColor: COLORS.white, paddingHorizontal: 16 * scale, paddingVertical: 8 * scale, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
    filterChipActive: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    filterText: { color: '#4b5563', fontSize: 13 * scale, fontWeight: '600' },
    filterTextActive: { color: COLORS.white },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24 * scale, marginTop: 24 * scale, gap: 12 * scale },
    statCard: { flex: 1, backgroundColor: COLORS.white, paddingVertical: 16 * scale, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#031E5D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, elevation: 2 },
    statNumber: { fontSize: 24 * scale, fontWeight: '900', marginBottom: 4 },
    statLabel: { color: COLORS.silver, fontSize: 12 * scale, fontWeight: '600' },

    sectionHeader: { color: COLORS.silver, fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1.5, marginHorizontal: 24 * scale, marginTop: 32 * scale, marginBottom: 12 * scale },

    listContainer: { paddingHorizontal: 24 * scale, gap: 12 * scale },
    card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 * scale, shadowColor: '#031E5D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
    cardContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 * scale },

    avatar: { width: 44 * scale, height: 44 * scale, borderRadius: 22 * scale, backgroundColor: '#e5e7eb' },
    avatarPlaceholder: { width: 44 * scale, height: 44 * scale, borderRadius: 22 * scale, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },

    visitorName: { color: '#111827', fontSize: 16 * scale, fontWeight: 'bold', marginBottom: 8 * scale },

    badgesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 * scale },
    badge: { paddingHorizontal: 10 * scale, paddingVertical: 4 * scale, borderRadius: 12, marginRight: 10 * scale },
    badgeProveedor: { backgroundColor: COLORS.royalBlueSoft },
    badgeTextProveedor: { color: COLORS.royalBlue, fontSize: 11 * scale, fontWeight: 'bold' },
    badgeFamiliar: { backgroundColor: COLORS.periwinkleSoft },
    badgeTextFamiliar: { color: COLORS.palatinateBlue, fontSize: 11 * scale, fontWeight: 'bold' },
    badgePostulante: { backgroundColor: COLORS.brandRedSoft },
    badgeTextPostulante: { color: COLORS.brandRed, fontSize: 11 * scale, fontWeight: 'bold' },
    folioText: { color: COLORS.silver, fontSize: 12 * scale, fontWeight: '600' },

    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationText: { color: '#6b7280', fontSize: 12 * scale, marginLeft: 4 * scale },
    dateText: { color: '#c1c7d0', fontSize: 11 * scale, fontWeight: '600', marginTop: 6 * scale },

    timesContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    timeText: { color: COLORS.silver, fontSize: 13 * scale, fontWeight: '600', marginBottom: 6 * scale },
    timeValue: { color: COLORS.palatinateBlue, fontWeight: 'bold' },
    activeBadge: { backgroundColor: COLORS.royalBlueSoft, paddingHorizontal: 10 * scale, paddingVertical: 4 * scale, borderRadius: 8 },
    activeBadgeText: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: COLORS.silver, marginTop: 20 * scale, fontSize: 14 * scale },
  });