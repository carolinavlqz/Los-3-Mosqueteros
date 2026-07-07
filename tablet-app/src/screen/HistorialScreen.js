import React, { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH_PHONE = 480;
const MAX_CONTENT_WIDTH_TABLET = 760;

function useScale() {
  const { width } = useWindowDimensions();
  const isLandscape = width > width;
  const isTablet = width >= TABLET_BREAKPOINT;
  const contentWidth = isTablet ? Math.min(width * 0.9, MAX_CONTENT_WIDTH_TABLET) : Math.min(width, MAX_CONTENT_WIDTH_PHONE);
  const scale = Math.max(0.85, Math.min(contentWidth / BASE_WIDTH, 1.3));
  return { isLandscape, isTablet, contentWidth, scale };
}

const MOCK_HISTORY = [
  { id: '1', nombre: 'Carlos Mendoza Reyes', tipo: 'Proveedor', folio: 'MIA-2847', horaEntrada: '09:14', horaSalida: null, destino: 'Piso 2 — Hospitalización Ala A', estado: 'activo', fecha: 'Hoy' },
  { id: '2', nombre: 'María González López', tipo: 'Familiar', folio: 'MIA-2846', horaEntrada: '08:50', horaSalida: '11:20', destino: 'Piso 1 — Consultorios Externos', estado: 'completado', fecha: 'Hoy' },
  { id: '3', nombre: 'Ing. Roberto Salinas', tipo: 'Proveedor', folio: 'MIA-2845', horaEntrada: '08:22', horaSalida: '10:45', destino: 'Piso 3 — Quirófanos', estado: 'completado', fecha: 'Hoy' },
  { id: '4', nombre: 'Laura Castillo Vega', tipo: 'Postulante', folio: 'MIA-2844', horaEntrada: '08:05', horaSalida: '09:30', destino: 'Piso 4 — Recursos Humanos', estado: 'completado', fecha: 'Hoy' },
  { id: '5', nombre: 'Distribuidora Farmacias SA', tipo: 'Proveedor', folio: 'MIA-2843', horaEntrada: '14:30', horaSalida: '15:10', destino: 'Planta Baja — Farmacia', estado: 'completado', fecha: 'Ayer' },
];

export default function HistorialScreen() {
  const router = useRouter();
  const { contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Proveedor', 'Familiar', 'Postulante'];

  const filteredHistory = useMemo(() => {
    return MOCK_HISTORY.filter(v => {
      const matchesSearch = v.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || v.folio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeFilter === 'Todos' || v.tipo === activeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, activeFilter]);

  const hoyStats = MOCK_HISTORY.filter(v => v.fecha === 'Hoy');
  const totalHoy = hoyStats.length;
  const activosHoy = hoyStats.filter(v => v.estado === 'activo').length;
  const completadosHoy = hoyStats.filter(v => v.estado === 'completado').length;

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
      <StatusBar barStyle="light-content" backgroundColor="#284b82" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerContentContainer}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
              <Ionicons name="chevron-back" size={22 * scale} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton}>
              <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>REGISTROS</Text>
          <Text style={s.headerTitle}>Historial de Visitas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
        <View style={[s.container, { width: contentWidth }]}>
          
          {/* Buscador */}
          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={20 * scale} color="#9ca3af" />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar registros..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filtros de Tipo */}
          <View style={s.filtersContainer}>
            {filters.map((filter, i) => (
              <TouchableOpacity
                key={i}
                style={[s.filterChip, activeFilter === filter && s.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[s.filterText, activeFilter === filter && s.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tarjetas de Estadísticas */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={[s.statNumber, {color: '#1e3a68'}]}>{totalHoy}</Text>
              <Text style={s.statLabel}>Total hoy</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNumber, {color: '#00a884'}]}>{activosHoy}</Text>
              <Text style={s.statLabel}>Activos</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNumber, {color: '#6b7280'}]}>{completadosHoy}</Text>
              <Text style={s.statLabel}>Completados</Text>
            </View>
          </View>

          {/* Lista de Registros */}
          <Text style={s.sectionHeader}>HOY · {hoyStats.length} REGISTROS</Text>
          <View style={s.listContainer}>
            {filteredHistory.filter(v => v.fecha === 'Hoy').map(v => (
              <View key={v.id} style={s.card}>
                <View style={s.cardContent}>
                  <View style={{flex: 1}}>
                    <Text style={s.visitorName}>{v.nombre}</Text>
                    <View style={s.badgesRow}>
                      <View style={[s.badge, getBadgeStyle(v.tipo)]}>
                        <Text style={[s.badgeText, getBadgeTextStyle(v.tipo)]}>{v.tipo}</Text>
                      </View>
                      <Text style={s.folioText}>{v.folio}</Text>
                    </View>
                    <View style={s.locationRow}>
                      <Ionicons name="location-outline" size={14 * scale} color="#9ca3af" />
                      <Text style={s.locationText}>{v.destino}</Text>
                    </View>
                  </View>
                  
                  {/* Tiempos (E: / S:) */}
                  <View style={s.timesContainer}>
                    <Text style={s.timeText}>E: <Text style={s.timeValue}>{v.horaEntrada}</Text></Text>
                    {v.estado === 'activo' ? (
                      <View style={s.activeBadge}>
                        <Text style={s.activeBadgeText}>Activo</Text>
                      </View>
                    ) : (
                      <Text style={s.timeText}>S: <Text style={s.timeValue}>{v.horaSalida}</Text></Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f6f9' },
    container: { paddingBottom: 40 * scale },

    header: { backgroundColor: '#284b82', alignItems: 'center' },
    headerContentContainer: { width: '100%', maxWidth: MAX_CONTENT_WIDTH_TABLET, paddingHorizontal: 28 * scale, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 24 * scale },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 * scale },
    iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 44 * scale, height: 44 * scale, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    headerSubtitle: { color: '#8ba4c9', fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { color: '#ffffff', fontSize: 26 * scale, fontWeight: 'bold' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 24 * scale, marginTop: 24 * scale, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
    searchInput: { flex: 1, marginLeft: 10 * scale, fontSize: 16 * scale, color: '#111827' },

    filtersContainer: { flexDirection: 'row', marginHorizontal: 24 * scale, marginTop: 16 * scale, gap: 10 * scale, flexWrap: 'wrap' },
    filterChip: { backgroundColor: '#ffffff', paddingHorizontal: 16 * scale, paddingVertical: 8 * scale, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
    filterChipActive: { backgroundColor: '#284b82', borderColor: '#284b82' },
    filterText: { color: '#4b5563', fontSize: 13 * scale, fontWeight: '600' },
    filterTextActive: { color: '#ffffff' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24 * scale, marginTop: 24 * scale, gap: 12 * scale },
    statCard: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 16 * scale, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
    statNumber: { fontSize: 24 * scale, fontWeight: '900', marginBottom: 4 },
    statLabel: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: '600' },

    sectionHeader: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1.5, marginHorizontal: 24 * scale, marginTop: 32 * scale, marginBottom: 12 * scale },

    listContainer: { paddingHorizontal: 24 * scale, gap: 12 * scale },
    card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20 * scale, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, elevation: 1, borderWidth: 1, borderColor: '#f3f4f6' },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
    visitorName: { color: '#111827', fontSize: 16 * scale, fontWeight: 'bold', marginBottom: 8 * scale },
    
    badgesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 * scale },
    badge: { paddingHorizontal: 10 * scale, paddingVertical: 4 * scale, borderRadius: 12, marginRight: 10 * scale },
    badgeProveedor: { backgroundColor: '#e0f2fe' },
    badgeTextProveedor: { color: '#0284c7', fontSize: 11 * scale, fontWeight: 'bold' },
    badgeFamiliar: { backgroundColor: '#e0e7ff' },
    badgeTextFamiliar: { color: '#4f46e5', fontSize: 11 * scale, fontWeight: 'bold' },
    badgePostulante: { backgroundColor: '#fef3c7' },
    badgeTextPostulante: { color: '#d97706', fontSize: 11 * scale, fontWeight: 'bold' },
    folioText: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: '600' },

    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationText: { color: '#6b7280', fontSize: 12 * scale, marginLeft: 4 * scale },

    timesContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    timeText: { color: '#9ca3af', fontSize: 13 * scale, fontWeight: '600', marginBottom: 6 * scale },
    timeValue: { color: '#1e3a68', fontWeight: 'bold' },
    activeBadge: { backgroundColor: '#fef9c3', paddingHorizontal: 10 * scale, paddingVertical: 4 * scale, borderRadius: 8 },
    activeBadgeText: { color: '#d97706', fontSize: 12 * scale, fontWeight: 'bold' },
  });