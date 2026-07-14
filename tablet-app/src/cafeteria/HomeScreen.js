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
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { getSession, clearSession } from '../utils/session';
import { sanitizeName } from '../utils/validators';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: 'sunny-outline' },
  { key: 'comida', label: 'Comida', icon: 'restaurant-outline' },
  { key: 'cena', label: 'Cena', icon: 'moon-outline' },
];

export default function CafeteriaHomeScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 720 });
  const s = createStyles(scale);

  const [session, setSession] = useState(null);
  const [now, setNow] = useState(new Date());
  const [horarios, setHorarios] = useState([]);

  const [pisos, setPisos] = useState([]);
  const [pisoFiltro, setPisoFiltro] = useState('');
  const [comidaFiltro, setComidaFiltro] = useState('todos');
  const [nombreFiltro, setNombreFiltro] = useState('');

  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [entregasPorPaciente, setEntregasPorPaciente] = useState({});
  const [loadingEntregas, setLoadingEntregas] = useState({});

  const [showNuevoPaciente, setShowNuevoPaciente] = useState(false);
  const [dischargingId, setDischargingId] = useState(null);

  useEffect(() => {
    getSession().then(setSession).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/cafeteria/horarios`)
      .then((res) => res.json())
      .then(setHorarios)
      .catch(() => setHorarios([]));
  }, []);

  const cargarPisos = useCallback(() => {
    fetch(`${API_URL}/api/cafeteria/pisos`)
      .then((res) => res.json())
      .then(setPisos)
      .catch(() => setPisos([]));
  }, []);

  useEffect(() => {
    cargarPisos();
  }, [cargarPisos]);

  const cargarPacientes = useCallback((options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoading(true);
    const params = new URLSearchParams();
    if (pisoFiltro) params.append('piso', pisoFiltro);
    if (nombreFiltro.trim()) params.append('nombre', nombreFiltro.trim());

    fetch(`${API_URL}/api/cafeteria/pacientes?${params.toString()}`)
      .then((res) => res.json())
      .then(setPacientes)
      .catch(() => {
        if (!silent) setPacientes([]);
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  }, [pisoFiltro, nombreFiltro]);

  useEffect(() => {
    const timeout = setTimeout(cargarPacientes, 300);
    return () => clearTimeout(timeout);
  }, [cargarPacientes]);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => cargarPacientes({ silent: true }), 5000);
      return () => clearInterval(interval);
    }, [cargarPacientes])
  );

  const handleLogout = async () => {
    await clearSession();
    router.replace('/');
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!entregasPorPaciente[id]) {
      setLoadingEntregas((prev) => ({ ...prev, [id]: true }));
      fetch(`${API_URL}/api/cafeteria/pacientes/${id}/entregas`)
        .then((res) => res.json())
        .then((data) => setEntregasPorPaciente((prev) => ({ ...prev, [id]: data })))
        .catch(() => setEntregasPorPaciente((prev) => ({ ...prev, [id]: [] })))
        .finally(() => setLoadingEntregas((prev) => ({ ...prev, [id]: false })));
    }
  };

  const handleDarAlta = (paciente) => {
    Alert.alert(
      'Dar de alta',
      `¿Confirmas que ${paciente.nombre} ya no está en la habitación ${paciente.habitacion}? Dejará de aparecer en el tablero.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Dar de alta',
          style: 'destructive',
          onPress: () => {
            setDischargingId(paciente.id);
            fetch(`${API_URL}/api/cafeteria/pacientes/${paciente.id}/alta`, { method: 'PUT' })
              .then((res) => res.json())
              .then((data) => {
                if (!data.success) {
                  Alert.alert('No se pudo dar de alta', data.mensaje || 'Intenta de nuevo');
                  return;
                }
                if (expandedId === paciente.id) setExpandedId(null);
                cargarPisos();
                cargarPacientes();
              })
              .catch(() => Alert.alert('Error', 'No hay conexión con el servidor'))
              .finally(() => setDischargingId(null));
          },
        },
      ]
    );
  };

  const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const turnoActual = horarios.find((h) => nowStr >= h.hora_inicio && nowStr <= h.hora_fin) || null;
  const entregasHoy = pacientes.reduce((acc, p) => acc + Number(p.entregas_hoy || 0), 0);
  const pendientesTurno = turnoActual
    ? pacientes.filter((p) => !p[`${turnoActual.tipo_comida}_hora`]).length
    : 0;

  const mealsToShow = comidaFiltro === 'todos' ? MEALS : MEALS.filter((m) => m.key === comidaFiltro);

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
            <View style={s.headerLeft}>
              <View style={s.homeIconContainer}>
                <Ionicons name="restaurant-outline" size={22 * scale} color={COLORS.white} />
              </View>
              <View>
                <Text style={s.headerSubtitle}>MÓDULO DE CAFETERÍA</Text>
                <Text style={s.headerTitle}>Control de Comidas</Text>
              </View>
            </View>

            <View style={s.headerActions}>
              <TouchableOpacity onPress={() => router.push('/cafeteria/registrar')} style={s.iconButton} activeOpacity={0.7}>
                <Ionicons name="checkmark-done-outline" size={18 * scale} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/cafeteria/historial')} style={s.iconButton} activeOpacity={0.7}>
                <Ionicons name="time-outline" size={18 * scale} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={s.iconButton} activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={18 * scale} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statChip}>
              <Text style={s.statLabel}>TURNO ACTUAL</Text>
              <Text style={s.statValue} numberOfLines={1}>
                {turnoActual ? turnoActual.tipo_comida.charAt(0).toUpperCase() + turnoActual.tipo_comida.slice(1) : 'Sin turno'}
              </Text>
            </View>
            <View style={s.statChip}>
              <Text style={s.statLabel}>ENTREGAS HOY</Text>
              <Text style={s.statValue}>{entregasHoy}</Text>
            </View>
            <View style={s.statChip}>
              <Text style={s.statLabel}>PENDIENTES</Text>
              <Text style={s.statValue}>{pendientesTurno}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>
          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16 * scale} color={COLORS.silver} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar habitación o paciente..."
              placeholderTextColor="#9ca3af"
              value={nombreFiltro}
              onChangeText={setNombreFiltro}
            />
          </View>

          <View style={s.chipRow}>
            <TouchableOpacity
              style={[s.chip, comidaFiltro === 'todos' && s.chipSelected]}
              onPress={() => setComidaFiltro('todos')}
            >
              <Text style={[s.chipText, comidaFiltro === 'todos' && s.chipTextSelected]}>
                Todos {pacientes.length}
              </Text>
            </TouchableOpacity>
            {MEALS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[s.chip, comidaFiltro === m.key && s.chipSelected]}
                onPress={() => setComidaFiltro(m.key)}
              >
                <Text style={[s.chipText, comidaFiltro === m.key && s.chipTextSelected]}>
                  {m.label} {pacientes.length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.chipRow}>
            <TouchableOpacity style={[s.pisoChip, pisoFiltro === '' && s.chipSelected]} onPress={() => setPisoFiltro('')}>
              <Text style={[s.chipText, pisoFiltro === '' && s.chipTextSelected]}>Todos los pisos</Text>
            </TouchableOpacity>
            {pisos.map((p) => (
              <TouchableOpacity
                key={p}
                style={[s.pisoChip, pisoFiltro === p && s.chipSelected]}
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
          ) : pacientes.length === 0 ? (
            <View style={s.statusContainer}>
              <Ionicons name="bed-outline" size={40 * scale} color={COLORS.silver} />
              <Text style={s.emptyText}>No hay pacientes registrados con estos filtros</Text>
            </View>
          ) : (
            <FlatList
              data={pacientes}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={s.listContent}
              renderItem={({ item }) => {
                const expanded = expandedId === item.id;
                const entregas = entregasPorPaciente[item.id] || [];
                return (
                  <View style={s.card}>
                    <TouchableOpacity style={s.cardHeader} activeOpacity={0.8} onPress={() => toggleExpand(item.id)}>
                      <View style={s.habBadge}>
                        <Text style={s.habBadgeText}>HAB{'\n'}{item.habitacion}</Text>
                      </View>
                      <View style={s.cardInfo}>
                        <Text style={s.cardNombre} numberOfLines={1}>{item.nombre}</Text>
                        <Text style={s.cardEntregas}>{item.entregas_hoy}/3 entregas</Text>
                      </View>
                      <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18 * scale}
                        color={COLORS.silver}
                      />
                    </TouchableOpacity>

                    <View style={s.mealsRow}>
                      {mealsToShow.map((meal) => {
                        const hora = item[`${meal.key}_hora`];
                        const horario = horarios.find((h) => h.tipo_comida === meal.key);
                        const entregado = !!hora;
                        return (
                          <View key={meal.key} style={[s.mealChip, entregado ? s.mealChipDone : s.mealChipPending]}>
                            <Ionicons
                              name={entregado ? 'checkmark-circle' : meal.icon}
                              size={16 * scale}
                              color={entregado ? '#1E8E5A' : COLORS.silver}
                            />
                            <Text style={[s.mealChipLabel, entregado && s.mealChipLabelDone]}>{meal.label}</Text>
                            <Text style={[s.mealChipHora, entregado && s.mealChipHoraDone]}>
                              {entregado ? hora : horario ? `${horario.hora_inicio}-${horario.hora_fin}` : '--'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {expanded && (
                      <View style={s.historialDia}>
                        <Text style={s.historialTitulo}>HISTORIAL DEL DÍA</Text>
                        {loadingEntregas[item.id] ? (
                          <ActivityIndicator color={COLORS.royalBlue} style={{ marginVertical: 8 * scale }} />
                        ) : entregas.length === 0 ? (
                          <Text style={s.hintText}>Aún no se ha registrado ninguna comida hoy</Text>
                        ) : (
                          entregas.map((e, idx) => (
                            <View key={idx} style={s.historialRow}>
                              <Ionicons
                                name={MEALS.find((m) => m.key === e.tipo_comida)?.icon || 'restaurant-outline'}
                                size={15 * scale}
                                color={COLORS.royalBlue}
                              />
                              <View style={s.historialRowInfo}>
                                <Text style={s.historialPlatillo}>
                                  {e.platillo || (e.tipo_comida.charAt(0).toUpperCase() + e.tipo_comida.slice(1))}
                                </Text>
                                <Text style={s.historialLugar}>
                                  {e.lugar_entrega === 'habitacion' ? 'Entregado en habitación' : 'Entregado en comedor'}
                                </Text>
                              </View>
                              <Text style={s.historialHora}>{e.hora}</Text>
                            </View>
                          ))
                        )}

                        <TouchableOpacity
                          style={s.altaButton}
                          activeOpacity={0.8}
                          disabled={dischargingId === item.id}
                          onPress={() => handleDarAlta(item)}
                        >
                          {dischargingId === item.id ? (
                            <ActivityIndicator color={COLORS.brandRed} size="small" />
                          ) : (
                            <>
                              <Ionicons name="log-out-outline" size={15 * scale} color={COLORS.brandRed} />
                              <Text style={s.altaButtonText}>Dar de alta / salida</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>

      <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={() => setShowNuevoPaciente(true)}>
        <Ionicons name="add" size={26 * scale} color={COLORS.white} />
      </TouchableOpacity>

      <NuevoPacienteModal
        visible={showNuevoPaciente}
        scale={scale}
        idUsuario={session?.id}
        onClose={() => setShowNuevoPaciente(false)}
        onSaved={() => {
          setShowNuevoPaciente(false);
          cargarPisos();
          cargarPacientes();
        }}
      />
    </SafeAreaView>
  );
}

function NuevoPacienteModal({ visible, scale, idUsuario, onClose, onSaved }) {
  const s = createStyles(scale);

  const [pisos, setPisos] = useState([]);
  const [isLoadingPisos, setIsLoadingPisos] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoadingHabitaciones, setIsLoadingHabitaciones] = useState(false);

  const [piso, setPiso] = useState('');
  const [habitacion, setHabitacion] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPiso('');
    setHabitacion('');
    setNombre('');
    setError('');
    setIsLoadingPisos(true);
    fetch(`${API_URL}/api/hospital/pisos`)
      .then((res) => res.json())
      .then((data) => setPisos(data.map((p) => p.piso)))
      .catch(() => setPisos([]))
      .finally(() => setIsLoadingPisos(false));
  }, [visible]);

  const seleccionarPiso = (nuevoPiso) => {
    setPiso(nuevoPiso);
    setHabitacion('');
    setIsLoadingHabitaciones(true);
    fetch(`${API_URL}/api/hospital/habitaciones?piso=${encodeURIComponent(nuevoPiso)}`)
      .then((res) => res.json())
      .then(setHabitaciones)
      .catch(() => setHabitaciones([]))
      .finally(() => setIsLoadingHabitaciones(false));
  };

  const handleGuardar = () => {
    if (!piso || !habitacion || !nombre.trim()) {
      setError('Selecciona piso, habitación y captura el nombre del paciente');
      return;
    }
    setError('');
    setSaving(true);
    fetch(`${API_URL}/api/cafeteria/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ piso, habitacion, nombre: nombre.trim(), id_usuario_registro: idUsuario }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.mensaje || 'No se pudo registrar al paciente');
          return;
        }
        onSaved();
      })
      .catch(() => setError('No hay conexión con el servidor'))
      .finally(() => setSaving(false));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Nuevo paciente</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22 * scale} color={COLORS.silver} />
            </TouchableOpacity>
          </View>

          <Text style={s.inputLabel}>PISO</Text>
          {isLoadingPisos ? (
            <ActivityIndicator color={COLORS.royalBlue} style={{ marginVertical: 8 * scale }} />
          ) : (
            <View style={s.chipRow}>
              {pisos.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[s.chip, piso === p && s.chipSelected]}
                  onPress={() => seleccionarPiso(p)}
                >
                  <Text style={[s.chipText, piso === p && s.chipTextSelected]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {piso ? (
            <>
              <Text style={[s.inputLabel, { marginTop: 12 * scale }]}>HABITACIÓN</Text>
              {isLoadingHabitaciones ? (
                <ActivityIndicator color={COLORS.royalBlue} style={{ marginVertical: 8 * scale }} />
              ) : habitaciones.length === 0 ? (
                <Text style={s.hintText}>Este piso no tiene habitaciones registradas</Text>
              ) : (
                <View style={s.chipRow}>
                  {habitaciones.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[s.chip, habitacion === h && s.chipSelected]}
                      onPress={() => setHabitacion(h)}
                    >
                      <Text style={[s.chipText, habitacion === h && s.chipTextSelected]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : null}

          <Text style={[s.inputLabel, { marginTop: 12 * scale }]}>NOMBRE DEL PACIENTE</Text>
          <TextInput
            style={s.modalInput}
            placeholder="Nombre completo"
            placeholderTextColor="#9ca3af"
            value={nombre}
            onChangeText={(t) => setNombre(sanitizeName(t))}
            autoCapitalize="words"
          />

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[s.modalButton, saving && s.modalButtonDisabled]} onPress={handleGuardar} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={s.modalButtonText}>Registrar paciente</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },

    header: {
      paddingHorizontal: 24 * scale,
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

    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 * scale },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
    homeIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 44 * scale,
      height: 44 * scale,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12 * scale,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    headerSubtitle: { color: COLORS.periwinkle, fontSize: 11 * scale, fontWeight: '700', letterSpacing: 1.3, marginBottom: 3 },
    headerTitle: { color: COLORS.white, fontSize: 20 * scale, fontWeight: 'bold' },

    headerActions: { flexDirection: 'row', gap: 8 * scale },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 36 * scale,
      height: 36 * scale,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },

    statsRow: { flexDirection: 'row', gap: 10 * scale },
    statChip: {
      flex: 1,
      backgroundColor: 'rgba(3, 30, 93, 0.5)',
      borderRadius: 14,
      paddingVertical: 10 * scale,
      paddingHorizontal: 12 * scale,
      borderWidth: 1,
      borderColor: 'rgba(184,199,238,0.20)',
    },
    statLabel: { color: '#8FA0C7', fontSize: 9 * scale, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
    statValue: { color: COLORS.white, fontSize: 16 * scale, fontWeight: 'bold' },

    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1, paddingHorizontal: 20 * scale, paddingTop: 16 * scale },

    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8 * scale,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 12 * scale,
      paddingVertical: Platform.OS === 'ios' ? 12 * scale : 2 * scale,
      marginBottom: 14 * scale,
    },
    searchInput: { flex: 1, fontSize: 14 * scale, color: '#111827' },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 * scale, marginBottom: 12 * scale },
    chip: {
      paddingHorizontal: 14 * scale,
      paddingVertical: 8 * scale,
      borderRadius: 20,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    pisoChip: {
      paddingHorizontal: 14 * scale,
      paddingVertical: 8 * scale,
      borderRadius: 12,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    chipSelected: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    chipText: { color: '#4b5563', fontSize: 12 * scale, fontWeight: '600' },
    chipTextSelected: { color: COLORS.white },

    statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 * scale, paddingVertical: 60 * scale },
    emptyText: { color: COLORS.silver, fontSize: 14 * scale, textAlign: 'center' },

    listContent: { paddingBottom: 100 * scale },

    card: {
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
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 * scale },
    habBadge: {
      width: 44 * scale,
      height: 44 * scale,
      borderRadius: 10,
      backgroundColor: COLORS.royalBlueSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12 * scale,
    },
    habBadgeText: { color: COLORS.royalBlue, fontSize: 10 * scale, fontWeight: 'bold', textAlign: 'center', lineHeight: 12 * scale },
    cardInfo: { flex: 1 },
    cardNombre: { color: COLORS.palatinateBlue, fontSize: 15 * scale, fontWeight: 'bold', marginBottom: 2 },
    cardEntregas: { color: COLORS.silver, fontSize: 12 * scale, fontWeight: '600' },

    mealsRow: { flexDirection: 'row', gap: 8 * scale },
    mealChip: {
      flex: 1,
      alignItems: 'center',
      borderRadius: 12,
      paddingVertical: 10 * scale,
      borderWidth: 1,
      gap: 2 * scale,
    },
    mealChipPending: { backgroundColor: '#F9FAFB', borderColor: '#F0F2F8' },
    mealChipDone: { backgroundColor: 'rgba(30,142,90,0.10)', borderColor: 'rgba(30,142,90,0.25)' },
    mealChipLabel: { color: '#4b5563', fontSize: 11 * scale, fontWeight: '700', marginTop: 2 },
    mealChipLabelDone: { color: '#1E8E5A' },
    mealChipHora: { color: COLORS.silver, fontSize: 10 * scale, fontWeight: '600' },
    mealChipHoraDone: { color: '#1E8E5A' },

    historialDia: { marginTop: 12 * scale, paddingTop: 12 * scale, borderTopWidth: 1, borderTopColor: '#F0F2F8' },
    historialTitulo: { color: COLORS.silver, fontSize: 10 * scale, fontWeight: '700', letterSpacing: 1, marginBottom: 8 * scale },
    historialRow: { flexDirection: 'row', alignItems: 'center', gap: 10 * scale, paddingVertical: 6 * scale },
    historialRowInfo: { flex: 1 },
    historialPlatillo: { color: '#111827', fontSize: 13 * scale, fontWeight: '600' },
    historialLugar: { color: COLORS.silver, fontSize: 11 * scale },
    historialHora: { color: COLORS.palatinateBlue, fontSize: 12 * scale, fontWeight: 'bold' },
    hintText: { color: COLORS.silver, fontSize: 12 * scale },

    altaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6 * scale,
      marginTop: 12 * scale,
      paddingVertical: 10 * scale,
      borderRadius: 10,
      backgroundColor: COLORS.brandRedSoft,
    },
    altaButtonText: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: '700' },

    fab: {
      position: 'absolute',
      right: 20 * scale,
      bottom: 20 * scale,
      width: 56 * scale,
      height: 56 * scale,
      borderRadius: 28,
      backgroundColor: COLORS.royalBlue,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(3,30,93,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 * scale },
    modalCard: { width: '100%', maxWidth: 440, backgroundColor: COLORS.white, borderRadius: 20, padding: 20 * scale },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 * scale },
    modalTitle: { color: COLORS.palatinateBlue, fontSize: 18 * scale, fontWeight: 'bold' },
    inputLabel: { color: '#6b7280', fontSize: 11 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 * scale },
    modalInput: {
      backgroundColor: COLORS.royalBlueSoft,
      borderRadius: 12,
      paddingHorizontal: 14 * scale,
      paddingVertical: 12 * scale,
      fontSize: 14 * scale,
      color: '#111827',
    },
    errorText: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: '600', marginTop: 10 * scale },
    modalButton: {
      backgroundColor: COLORS.palatinateBlue,
      paddingVertical: 14 * scale,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18 * scale,
    },
    modalButtonDisabled: { opacity: 0.7 },
    modalButtonText: { color: COLORS.white, fontSize: 14 * scale, fontWeight: 'bold' },
  });
