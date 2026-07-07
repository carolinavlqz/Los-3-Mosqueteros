import React, { useState, useEffect, useMemo } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH_PHONE = 480;
const MAX_CONTENT_WIDTH_TABLET = 760;

function useScale() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= TABLET_BREAKPOINT;

  const contentWidth = isTablet
    ? Math.min(width * 0.9, MAX_CONTENT_WIDTH_TABLET)
    : Math.min(width, MAX_CONTENT_WIDTH_PHONE);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.3));

  return { isLandscape, isTablet, contentWidth, scale };
}

export default function CheckOutScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale();
  const s = createStyles(scale);

  // Inicializamos vacío, ya no usamos el MOCK
  const [visitors, setVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Obtener los visitantes reales al entrar a la pantalla
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await fetch('http://10.1.17.35:3000/api/visitas/activas');
        const data = await res.json();
        if (res.ok) {
          setVisitors(data);
        }
      } catch (error) {
        console.error("Error al cargar visitas:", error);
      }
    };
    fetchVisitors();
  }, []);

  const filteredVisitors = useMemo(() => {
  return visitors.filter(v => {
    const nombre = (v.nombre || '').toLowerCase();
    const folio = (v.folio || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return nombre.includes(query) || folio.includes(query);
  });
}, [visitors, searchQuery]);

  // 2. Enviar actualización al servidor cuando se registra la salida
  const handleCheckOut = async (id) => {
    try {
      const res = await fetch(`http://10.1.17.35:3000/api/visitas/${id}/salida`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        // Actualizamos la vista localmente para que se ponga verde inmediatamente
        setVisitors(prev => prev.map(v => v.id === id ? { ...v, estado: 'salida' } : v));
      } else {
        Alert.alert('Error', 'Hubo un problema registrando la salida.');
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo contactar con el servidor.');
    }
  };

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

      {/* Header Fijo */}
      <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
        <View style={s.headerContentContainer}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
              <Ionicons name="chevron-back" size={22 * scale} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton}>
              <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>CHECK OUT</Text>
          <Text style={s.headerTitle}>Registrar Salida</Text>
        </View>
      </View>

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>
          
          {/* Buscador */}
          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={20 * scale} color="#9ca3af" />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar por nombre o folio..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={s.resultsCount}>VISITAS ACTIVAS HOY — {filteredVisitors.length} REGISTROS</Text>

          {/* Lista de Visitantes */}
          <ScrollView contentContainerStyle={s.listContainer}>
            {filteredVisitors.map((v) => {
              const isCheckedOut = v.estado === 'salida';
              return (
                <View key={v.id} style={[s.card, isCheckedOut && s.cardCheckedOut]}>
                  
                  <View style={s.cardHeader}>
                    <Text style={s.visitorName}>{v.nombre}</Text>
                    <View style={s.timeContainer}>
                      <Text style={s.timeText}>{v.hora}</Text>
                      <Text style={s.timePeriod}>entrada</Text>
                    </View>
                  </View>

                  <View style={s.badgesRow}>
                    <View style={[s.badge, getBadgeStyle(v.tipo)]}>
                      <Text style={[s.badgeText, getBadgeTextStyle(v.tipo)]}>{v.tipo}</Text>
                    </View>
                    <Text style={s.folioText}>{v.folio}</Text>
                  </View>

                  <View style={s.locationRow}>
                    <Ionicons name="location-outline" size={16 * scale} color="#6b7280" />
                    <Text style={s.locationText}>{v.destino}</Text>
                  </View>

                  {isCheckedOut ? (
                    <View style={s.checkedOutStatus}>
                      <Ionicons name="checkmark" size={20 * scale} color="#10b981" />
                      <Text style={s.checkedOutText}>Salida registrada</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={s.checkOutButton} activeOpacity={0.8} onPress={() => handleCheckOut(v.id)}>
                      <Ionicons name="log-out-outline" size={20 * scale} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={s.checkOutButtonText}>Registrar Salida</Text>
                    </TouchableOpacity>
                  )}

                </View>
              );
            })}
            
            {/* Mensaje de estado vacío si no hay visitantes */}
            {filteredVisitors.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 20 * scale }}>
                  No hay visitas activas en este momento.
                </Text>
            )}
          </ScrollView>

        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f6f9' },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1 },

    header: { backgroundColor: '#284b82', alignItems: 'center' },
    headerContentContainer: { width: '100%', maxWidth: MAX_CONTENT_WIDTH_TABLET, paddingHorizontal: 28 * scale, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 24 * scale },
    headerLandscape: { paddingHorizontal: 48 * scale },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 * scale },
    iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 44 * scale, height: 44 * scale, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    headerSubtitle: { color: '#8ba4c9', fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { color: '#ffffff', fontSize: 26 * scale, fontWeight: 'bold' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 24 * scale, marginTop: 24 * scale, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
    searchInput: { flex: 1, marginLeft: 10 * scale, fontSize: 16 * scale, color: '#111827' },

    resultsCount: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginHorizontal: 24 * scale, marginTop: 24 * scale, marginBottom: 16 * scale },

    listContainer: { paddingHorizontal: 24 * scale, paddingBottom: 40 * scale, gap: 16 * scale },
    
    card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20 * scale, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
    cardCheckedOut: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 * scale },
    visitorName: { color: '#111827', fontSize: 18 * scale, fontWeight: 'bold', flex: 1 },
    timeContainer: { alignItems: 'flex-end' },
    timeText: { color: '#1e3a68', fontSize: 18 * scale, fontWeight: '900' },
    timePeriod: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: '600' },

    badgesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 * scale },
    badge: { paddingHorizontal: 10 * scale, paddingVertical: 4 * scale, borderRadius: 12, marginRight: 10 * scale },
    badgeProveedor: { backgroundColor: '#e0f2fe' },
    badgeTextProveedor: { color: '#0284c7', fontSize: 12 * scale, fontWeight: 'bold' },
    badgeFamiliar: { backgroundColor: '#e0e7ff' },
    badgeTextFamiliar: { color: '#4f46e5', fontSize: 12 * scale, fontWeight: 'bold' },
    badgePostulante: { backgroundColor: '#fef3c7' },
    badgeTextPostulante: { color: '#d97706', fontSize: 12 * scale, fontWeight: 'bold' },
    folioText: { color: '#9ca3af', fontSize: 13 * scale, fontWeight: '600' },

 locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 * scale },
    locationText: { color: '#4b5563', fontSize: 13 * scale, marginLeft: 6 * scale },

    checkOutButton: { backgroundColor: '#1d4ed8', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14 * scale, borderRadius: 12 },
    checkOutButtonText: { color: '#ffffff', fontSize: 16 * scale, fontWeight: 'bold' },
    checkedOutStatus: { flexDirection: 'row', alignItems: 'center' },
    checkedOutText: { color: '#10b981', fontSize: 15 * scale, fontWeight: 'bold', marginLeft: 8 * scale },
  });