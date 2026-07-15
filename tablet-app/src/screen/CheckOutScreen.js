import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CheckOutScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [visitors, setVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- CONFIGURACIÓN RESPONSIVA DE TARJETAS ---
  // En tablets o modo horizontal organizamos la lista en 2 columnas
  const useGrid = isTablet || isLandscape;
  const gapSize = 16 * scale;
  const cardWidth = useGrid ? (contentWidth - gapSize) / 2 : '100%';

  const cargarActivos = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/visitas/activas`);
      const data = await res.json();
      if (res.ok) {
        setVisitors(data);
      } else if (!silent) {
        Alert.alert('Error', 'No se pudieron cargar las visitas activas.');
      }
    } catch (error) {
      if (!silent) Alert.alert('Error de red', 'No se pudo contactar con el servidor.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarActivos();
  }, [cargarActivos]);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => cargarActivos({ silent: true }), 5000);
      return () => clearInterval(interval);
    }, [cargarActivos])
  );

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
      const nombre = (v.nombre || '').toLowerCase();
      const folio = (v.folio || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return nombre.includes(query) || folio.includes(query);
    });
  }, [visitors, searchQuery]);

  const handleCheckOut = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/visitas/${id}/salida`, {
        method: 'PUT'
      });

      if (res.ok) {
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

        <View style={[s.headerContentContainer, { width: contentWidth }]}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
              <Ionicons name="chevron-back" size={22 * scale} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/hospital')} style={s.iconButton}>
              <Ionicons name="home-outline" size={20 * scale} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={s.headerSubtitle}>CHECK OUT</Text>
          <Text style={s.headerTitle}>Registrar Salida</Text>
        </View>
      </LinearGradient>

      {/* ===== CUERPO DE LA PANTALLA ===== */}
      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>

          {/* Buscador acoplado al ancho responsivo */}
          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={20 * scale} color={COLORS.silver} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar por nombre o folio..."
              placeholderTextColor={COLORS.silver}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={s.resultsCount}>
            VISITAS ACTIVAS HOY — {filteredVisitors.length} REGISTROS
          </Text>

          <ScrollView 
            contentContainerStyle={s.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading && (
              <Text style={s.emptyText}>Cargando visitas...</Text>
            )}

            {!loading && (
              <View style={[s.grid, useGrid && s.gridRow]}>
                {filteredVisitors.map((v) => {
                  const isCheckedOut = v.estado === 'salida';
                  return (
                    <View 
                      key={v.id} 
                      style={[
                        s.card, 
                        { width: cardWidth }, // Ancho dinámico calculado
                        isCheckedOut && s.cardCheckedOut
                      ]}
                    >
                      <View style={s.cardContent}>
                        <View style={s.cardHeader}>
                          <Text style={s.visitorName} numberOfLines={1}>{v.nombre}</Text>
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
                          <Ionicons name="location-outline" size={16 * scale} color={COLORS.silver} />
                          <Text style={s.locationText} numberOfLines={1}>{v.destino}</Text>
                        </View>
                      </View>

                      {isCheckedOut ? (
                        <View style={s.checkedOutStatus}>
                          <Ionicons name="checkmark" size={20 * scale} color={COLORS.palatinateBlue} />
                          <Text style={s.checkedOutText}>Salida registrada</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          style={s.checkOutButton} 
                          activeOpacity={0.85} 
                          onPress={() => handleCheckOut(v.id)}
                        >
                          <Ionicons name="log-out-outline" size={20 * scale} color={COLORS.white} style={{ marginRight: 8 }} />
                          <Text style={s.checkOutButtonText}>Registrar Salida</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {!loading && filteredVisitors.length === 0 && (
              <Text style={s.emptyText}>No hay visitas activas en este momento.</Text>
            )}
          </ScrollView>

        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1 },

    header: { 
      alignItems: 'center', 
      width: '100%',
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    },
    headerContentContainer: { 
      paddingHorizontal: 20 * scale, 
      paddingTop: Platform.OS === 'android' ? 40 : 20, 
      paddingBottom: 24 * scale 
    },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 * scale },
    
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
      fontWeight: '700', 
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

    searchContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: COLORS.white, 
      marginHorizontal: 16 * scale, 
      marginTop: 24 * scale, 
      paddingHorizontal: 16 * scale, 
      paddingVertical: 12 * scale, 
      borderRadius: 14, 
      borderWidth: 1, 
      borderColor: '#E5E9F2' 
    },
    searchInput: { flex: 1, marginLeft: 10 * scale, fontSize: 16 * scale, color: COLORS.palatinateBlue },

    resultsCount: { 
      color: COLORS.silver, 
      fontSize: 12 * scale, 
      fontWeight: 'bold', 
      letterSpacing: 1, 
      marginHorizontal: 16 * scale, 
      marginTop: 20 * scale, 
      marginBottom: 12 * scale 
    },

    listContainer: { 
      paddingHorizontal: 16 * scale, 
      paddingBottom: 40 * scale 
    },

    // --- SISTEMA GRID ---
    grid: {
      flexDirection: 'column',
      gap: 16 * scale,
    },
    gridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    card: { 
      backgroundColor: COLORS.white, 
      borderRadius: 16, 
      padding: 18 * scale, 
      shadowColor: COLORS.palatinateBlue, 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.08, 
      shadowRadius: 8, 
      elevation: 2, 
      borderWidth: 1, 
      borderColor: '#F0F2F8',
      justifyContent: 'space-between', // Separa el contenido del botón de check-out abajo
      minHeight: 180 * scale // Mantiene la uniformidad de altura de tarjetas en grid
    },
    cardCheckedOut: { borderColor: COLORS.periwinkle, backgroundColor: '#F3F6FD' },
    cardContent: { flex: 1 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 * scale },
    visitorName: { color: COLORS.palatinateBlue, fontSize: 17 * scale, fontWeight: 'bold', flex: 1, marginRight: 8 },
    timeContainer: { alignItems: 'flex-end' },
    timeText: { color: COLORS.palatinateBlue, fontSize: 16 * scale, fontWeight: '900' },
    timePeriod: { color: COLORS.silver, fontSize: 11 * scale, fontWeight: '600', marginTop: -2 },

    badgesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 * scale },
    badge: { paddingHorizontal: 10 * scale, paddingVertical: 4 * scale, borderRadius: 12, marginRight: 10 * scale },
    badgeProveedor: { backgroundColor: '#E7EDFC' },
    badgeTextProveedor: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: 'bold' },
    badgeFamiliar: { backgroundColor: '#EDF1FB' },
    badgeTextFamiliar: { color: COLORS.palatinateBlue, fontSize: 12 * scale, fontWeight: 'bold' },
    badgePostulante: { backgroundColor: '#FBE7EA' },
    badgeTextPostulante: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: 'bold' },
    folioText: { color: COLORS.silver, fontSize: 13 * scale, fontWeight: '600' },

    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 * scale },
    locationText: { color: '#5B6B85', fontSize: 13 * scale, marginLeft: 6 * scale, flex: 1 },

    checkOutButton: { 
      backgroundColor: COLORS.royalBlue, 
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingVertical: 12 * scale, 
      borderRadius: 12,
      marginTop: 'auto' // Empuja el botón al final de la tarjeta
    },
    checkOutButtonText: { color: COLORS.white, fontSize: 15 * scale, fontWeight: 'bold' },
    checkedOutStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
    checkedOutText: { color: COLORS.palatinateBlue, fontSize: 14 * scale, fontWeight: 'bold', marginLeft: 8 * scale },
    emptyText: { textAlign: 'center', color: COLORS.silver, marginTop: 40 * scale, fontSize: 15 * scale },
  });
