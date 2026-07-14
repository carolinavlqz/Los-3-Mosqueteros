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
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { useGridColumns, clampColumns } from './useGridColumns';
import GridSizeControl from './GridSizeControl';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CONTAINER_PADDING = 24;

export default function TorreSalidaScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 700 });
  const s = createStyles(scale);
  const { size, columns: columnasElegidas, changeSize } = useGridColumns();

  const [pisos, setPisos] = useState([]);
  const [pisoFiltro, setPisoFiltro] = useState('');
  const [consultorioFiltro, setConsultorioFiltro] = useState('');
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [personas, setPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/torre/pisos`)
      .then((res) => res.json())
      .then((data) => setPisos(data.map((p) => p.piso)))
      .catch(() => setPisos([]));
  }, []);

  const cargarActivos = useCallback((options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoading(true);
    const params = new URLSearchParams();
    if (pisoFiltro) params.append('piso', pisoFiltro);
    if (consultorioFiltro.trim()) params.append('consultorio', consultorioFiltro.trim());
    if (nombreFiltro.trim()) params.append('nombre', nombreFiltro.trim());

    fetch(`${API_URL}/api/torre/activos?${params.toString()}`)
      .then((res) => res.json())
      .then(setPersonas)
      .catch(() => {
        if (!silent) setPersonas([]);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  }, [pisoFiltro, consultorioFiltro, nombreFiltro]);

  useEffect(() => {
    const timeout = setTimeout(cargarActivos, 300);
    return () => clearTimeout(timeout);
  }, [cargarActivos]);

  // Refresca en segundo plano cada 5s mientras la pantalla está en foco, para reflejar
  // salidas o registros hechos desde otro dispositivo (ej. el panel del administrador).
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => cargarActivos({ silent: true }), 5000);
      return () => clearInterval(interval);
    }, [cargarActivos])
  );

  const registrarSalida = (persona) => {
    setConfirmError('');
    setConfirmando(persona);
  };

  const cerrarConfirmacion = () => {
    if (isConfirming) return;
    setConfirmando(null);
    setConfirmError('');
  };

  const confirmarSalida = async () => {
    if (!confirmando) return;
    setIsConfirming(true);
    setConfirmError('');
    try {
      const response = await fetch(`${API_URL}/api/visitas/${confirmando.id}/salida`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setConfirmError(data.mensaje || 'No se pudo registrar la salida.');
        return;
      }
      setPersonas((prev) => prev.filter((p) => p.id !== confirmando.id));
      setConfirmando(null);
    } catch (err) {
      setConfirmError('No hay conexión con el servidor.');
    } finally {
      setIsConfirming(false);
    }
  };

  const gap = 16 * scale;
  const gridWidth = contentWidth - CONTAINER_PADDING * scale * 2;
  const columns = clampColumns(columnasElegidas, gridWidth);
  const cardWidth = (gridWidth - gap * (columns - 1)) / columns;

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
          <Text style={s.headerTitle}>Registrar Salida</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scrollContent}>
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

            {!isLoading && personas.length > 0 && (
              <GridSizeControl size={size} onChange={changeSize} scale={scale} />
            )}

            {isLoading ? (
              <View style={s.statusContainer}>
                <ActivityIndicator size="large" color={COLORS.royalBlue} />
              </View>
            ) : personas.length === 0 ? (
              <View style={s.statusContainer}>
                <Ionicons name="people-outline" size={40 * scale} color={COLORS.silver} />
                <Text style={s.emptyText}>No hay visitantes activos con estos filtros</Text>
              </View>
            ) : (
              <View style={s.grid}>
                {personas.map((persona) => {
                  const fotoUrl = persona.foto ? `${API_URL}${persona.foto}` : null;
                  return (
                    <View key={persona.id} style={[s.card, { width: cardWidth, height: cardWidth * 1.15 }]}>
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

                      <TouchableOpacity
                        style={s.salidaButton}
                        onPress={() => registrarSalida(persona)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="log-out-outline" size={16 * scale} color={COLORS.white} />
                      </TouchableOpacity>

                      <View style={s.ubicacionBadge}>
                        <Text style={s.ubicacionText}>{persona.piso} · {persona.consultorio}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={!!confirmando} transparent animationType="fade" onRequestClose={cerrarConfirmacion}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Registrar salida</Text>
            <Text style={s.modalText}>
              ¿Confirmar salida de <Text style={{ fontWeight: 'bold' }}>{confirmando?.nombre}</Text>?
            </Text>
            {confirmError ? <Text style={s.modalError}>{confirmError}</Text> : null}
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalCancelButton}
                onPress={cerrarConfirmacion}
                activeOpacity={0.7}
                disabled={isConfirming}
              >
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirmButton, isConfirming && s.modalConfirmButtonDisabled]}
                onPress={confirmarSalida}
                activeOpacity={0.85}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={s.modalConfirmText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

    scrollContent: { flexGrow: 1 },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1, paddingHorizontal: 24 * scale, paddingTop: 20 * scale, paddingBottom: 24 * scale },

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

    statusContainer: { alignItems: 'center', justifyContent: 'center', gap: 12 * scale, paddingVertical: 60 * scale },
    emptyText: { color: COLORS.silver, fontSize: 14 * scale, textAlign: 'center' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 * scale },

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
      right: 44 * scale,
      backgroundColor: COLORS.palatinateBlueSoft,
      borderRadius: 8,
      paddingVertical: 4 * scale,
      paddingHorizontal: 8 * scale,
    },
    nombreText: { color: COLORS.white, fontSize: 12 * scale, fontWeight: 'bold' },

    salidaButton: {
      position: 'absolute',
      top: 8 * scale,
      right: 8 * scale,
      width: 30 * scale,
      height: 30 * scale,
      borderRadius: 8,
      backgroundColor: COLORS.brandRed,
      alignItems: 'center',
      justifyContent: 'center',
    },

    ubicacionBadge: {
      position: 'absolute',
      bottom: 8 * scale,
      right: 8 * scale,
      backgroundColor: COLORS.palatinateBlueSoft,
      borderRadius: 8,
      paddingVertical: 4 * scale,
      paddingHorizontal: 8 * scale,
    },
    ubicacionText: { color: COLORS.white, fontSize: 11 * scale, fontWeight: '600' },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(3,30,93,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24 * scale,
    },
    modalCard: {
      width: '100%',
      maxWidth: 380 * scale,
      backgroundColor: COLORS.white,
      borderRadius: 20,
      padding: 24 * scale,
    },
    modalTitle: {
      color: COLORS.palatinateBlue,
      fontSize: 18 * scale,
      fontWeight: 'bold',
      marginBottom: 10 * scale,
      textAlign: 'center',
    },
    modalText: { color: '#4b5563', fontSize: 14 * scale, textAlign: 'center', lineHeight: 20 * scale },
    modalError: {
      color: COLORS.brandRed,
      fontSize: 13 * scale,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 12 * scale,
    },
    modalActions: { flexDirection: 'row', gap: 12 * scale, marginTop: 22 * scale },
    modalCancelButton: {
      flex: 1,
      paddingVertical: 14 * scale,
      borderRadius: 14,
      alignItems: 'center',
      backgroundColor: COLORS.royalBlueSoft,
    },
    modalCancelText: { color: COLORS.royalBlue, fontSize: 15 * scale, fontWeight: 'bold' },
    modalConfirmButton: {
      flex: 1,
      paddingVertical: 14 * scale,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.brandRed,
    },
    modalConfirmButtonDisabled: { opacity: 0.7 },
    modalConfirmText: { color: COLORS.white, fontSize: 15 * scale, fontWeight: 'bold' },
  });
