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
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { getSession } from '../utils/session';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: 'sunny-outline' },
  { key: 'comida', label: 'Comida', icon: 'restaurant-outline' },
  { key: 'cena', label: 'Cena', icon: 'moon-outline' },
];

const LUGARES = [
  { key: 'habitacion', label: 'Habitación', icon: 'bed-outline' },
  { key: 'comedor', label: 'Comedor', icon: 'restaurant-outline' },
];

export default function CafeteriaRegistrarScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 620 });
  const s = createStyles(scale);

  const [session, setSession] = useState(null);
  const [horarios, setHorarios] = useState([]);

  const [nombreFiltro, setNombreFiltro] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [isLoadingPacientes, setIsLoadingPacientes] = useState(true);

  const [paciente, setPaciente] = useState(null);
  const [entregasHoy, setEntregasHoy] = useState([]);
  const [isLoadingEntregas, setIsLoadingEntregas] = useState(false);

  const [tipoComida, setTipoComida] = useState(null);
  const [lugarEntrega, setLugarEntrega] = useState(null);
  const [platillo, setPlatillo] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSession().then(setSession).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/cafeteria/horarios`)
      .then((res) => res.json())
      .then(setHorarios)
      .catch(() => setHorarios([]));
  }, []);

  const cargarPacientes = useCallback((options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoadingPacientes(true);
    const params = new URLSearchParams();
    if (nombreFiltro.trim()) params.append('nombre', nombreFiltro.trim());

    fetch(`${API_URL}/api/cafeteria/pacientes?${params.toString()}`)
      .then((res) => res.json())
      .then(setPacientes)
      .catch(() => {
        if (!silent) setPacientes([]);
      })
      .finally(() => {
        if (!silent) setIsLoadingPacientes(false);
      });
  }, [nombreFiltro]);

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

  const cargarEntregasHoy = useCallback((idPaciente) => {
    setIsLoadingEntregas(true);
    fetch(`${API_URL}/api/cafeteria/pacientes/${idPaciente}/entregas`)
      .then((res) => res.json())
      .then(setEntregasHoy)
      .catch(() => setEntregasHoy([]))
      .finally(() => setIsLoadingEntregas(false));
  }, []);

  const seleccionarPaciente = (p) => {
    setPaciente(p);
    setTipoComida(null);
    setLugarEntrega(null);
    setPlatillo('');
    setError('');
    setSuccess('');
    cargarEntregasHoy(p.id);
  };

  const cambiarPaciente = () => {
    setPaciente(null);
    setEntregasHoy([]);
    setTipoComida(null);
    setLugarEntrega(null);
    setPlatillo('');
    setError('');
    setSuccess('');
    cargarPacientes();
  };

  const nowStr = (() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  })();

  const estadoComida = (mealKey) => {
    const yaEntregada = entregasHoy.some((e) => e.tipo_comida === mealKey);
    const horario = horarios.find((h) => h.tipo_comida === mealKey);
    const dentroDeHorario = horario ? nowStr >= horario.hora_inicio && nowStr <= horario.hora_fin : false;

    if (yaEntregada) return { disabled: true, motivo: 'Ya se registró hoy' };
    if (!dentroDeHorario) return { disabled: true, motivo: horario ? `Horario ${horario.hora_inicio}-${horario.hora_fin}` : '' };
    return { disabled: false, motivo: horario ? `Horario ${horario.hora_inicio}-${horario.hora_fin}` : '' };
  };

  const handleRegistrar = () => {
    if (!paciente) {
      setError('Selecciona un paciente');
      return;
    }
    if (!tipoComida) {
      setError('Selecciona qué comida vas a registrar');
      return;
    }
    if (!lugarEntrega) {
      setError('Indica si la entrega fue en habitación o en comedor');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    fetch(`${API_URL}/api/cafeteria/entregas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_paciente: paciente.id,
        tipo_comida: tipoComida,
        lugar_entrega: lugarEntrega,
        platillo: platillo.trim() || undefined,
        id_usuario_registro: session?.id,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          setError(data.mensaje || 'No se pudo registrar la entrega');
          return;
        }
        setSuccess(`Se registró ${tipoComida} de ${paciente.nombre}`);
        setTipoComida(null);
        setLugarEntrega(null);
        setPlatillo('');
        cargarEntregasHoy(paciente.id);
      })
      .catch(() => setError('No hay conexión con el servidor'))
      .finally(() => setIsSubmitting(false));
  };

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
          <Text style={s.headerTitle}>Registrar entrega</Text>
        </View>
      </LinearGradient>

      {!paciente ? (
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth, flex: 1 }]}>
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

            {isLoadingPacientes ? (
              <View style={s.statusContainer}>
                <ActivityIndicator size="large" color={COLORS.royalBlue} />
              </View>
            ) : pacientes.length === 0 ? (
              <View style={s.statusContainer}>
                <Ionicons name="bed-outline" size={36 * scale} color={COLORS.silver} />
                <Text style={s.emptyText}>No hay pacientes registrados con estos filtros</Text>
              </View>
            ) : (
              <FlatList
                data={pacientes}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={s.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.pacienteCard} activeOpacity={0.8} onPress={() => seleccionarPaciente(item)}>
                    <View style={s.habBadge}>
                      <Text style={s.habBadgeText}>HAB{'\n'}{item.habitacion}</Text>
                    </View>
                    <View style={s.pacienteInfo}>
                      <Text style={s.pacienteNombre} numberOfLines={1}>{item.nombre}</Text>
                      <Text style={s.pacientePiso}>{item.piso} · {item.entregas_hoy}/3 entregas</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18 * scale} color={COLORS.silver} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={s.outerContainer}>
              <View style={[s.container, { width: contentWidth }]}>
                <TouchableOpacity style={s.pacienteSeleccionado} activeOpacity={0.8} onPress={cambiarPaciente}>
                  <View style={s.habBadge}>
                    <Text style={s.habBadgeText}>HAB{'\n'}{paciente.habitacion}</Text>
                  </View>
                  <View style={s.pacienteInfo}>
                    <Text style={s.pacienteNombre} numberOfLines={1}>{paciente.nombre}</Text>
                    <Text style={s.pacientePiso}>{paciente.piso}</Text>
                  </View>
                  <Text style={s.cambiarText}>Cambiar</Text>
                </TouchableOpacity>

                <Text style={s.inputLabel}>COMIDA</Text>
                <View style={s.optionsRow}>
                  {MEALS.map((meal) => {
                    const estado = estadoComida(meal.key);
                    const selected = tipoComida === meal.key;
                    return (
                      <TouchableOpacity
                        key={meal.key}
                        style={[
                          s.optionCard,
                          selected && s.optionCardSelected,
                          estado.disabled && s.optionCardDisabled,
                        ]}
                        disabled={estado.disabled}
                        onPress={() => setTipoComida(meal.key)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={meal.icon}
                          size={22 * scale}
                          color={selected ? COLORS.white : estado.disabled ? COLORS.silver : COLORS.royalBlue}
                        />
                        <Text style={[s.optionLabel, selected && s.optionLabelSelected]}>{meal.label}</Text>
                        <Text style={[s.optionMotivo, selected && s.optionMotivoSelected]} numberOfLines={1}>
                          {estado.motivo}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[s.inputLabel, { marginTop: 18 * scale }]}>LUGAR DE ENTREGA</Text>
                <View style={s.optionsRow}>
                  {LUGARES.map((lugar) => {
                    const selected = lugarEntrega === lugar.key;
                    return (
                      <TouchableOpacity
                        key={lugar.key}
                        style={[s.optionCard, selected && s.optionCardSelected]}
                        onPress={() => setLugarEntrega(lugar.key)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={lugar.icon} size={22 * scale} color={selected ? COLORS.white : COLORS.royalBlue} />
                        <Text style={[s.optionLabel, selected && s.optionLabelSelected]}>{lugar.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[s.inputLabel, { marginTop: 18 * scale }]}>PLATILLO (OPCIONAL)</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="Ej. Hotcakes con miel"
                  placeholderTextColor="#9ca3af"
                  value={platillo}
                  onChangeText={setPlatillo}
                />

                {isLoadingEntregas ? (
                  <ActivityIndicator color={COLORS.royalBlue} style={{ marginTop: 16 * scale }} />
                ) : null}

                {error ? <Text style={s.errorText}>{error}</Text> : null}
                {success ? <Text style={s.successText}>{success}</Text> : null}

                <TouchableOpacity
                  style={[s.submitButton, isSubmitting && s.submitButtonDisabled]}
                  onPress={handleRegistrar}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={s.submitButtonText}>Registrar entrega</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
    container: { flex: 1, paddingHorizontal: 24 * scale, paddingTop: 20 * scale, paddingBottom: 32 * scale },

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

    statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 * scale, paddingVertical: 60 * scale },
    emptyText: { color: COLORS.silver, fontSize: 14 * scale, textAlign: 'center' },

    listContent: { paddingBottom: 24 * scale },
    pacienteCard: {
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

    pacienteSeleccionado: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 12 * scale,
      marginBottom: 20 * scale,
      borderWidth: 1.5,
      borderColor: COLORS.royalBlue,
    },
    cambiarText: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '700' },

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
    pacienteInfo: { flex: 1 },
    pacienteNombre: { color: COLORS.palatinateBlue, fontSize: 15 * scale, fontWeight: 'bold', marginBottom: 2 },
    pacientePiso: { color: COLORS.silver, fontSize: 12 * scale, fontWeight: '600' },

    inputLabel: { color: '#6b7280', fontSize: 11 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 * scale },
    textInput: {
      backgroundColor: COLORS.royalBlueSoft,
      borderWidth: 1.5,
      borderColor: 'transparent',
      borderRadius: 12,
      paddingHorizontal: 16 * scale,
      paddingVertical: 14 * scale,
      fontSize: 15 * scale,
      color: '#111827',
    },

    optionsRow: { flexDirection: 'row', gap: 10 * scale },
    optionCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: COLORS.white,
      borderRadius: 14,
      paddingVertical: 16 * scale,
      borderWidth: 1.5,
      borderColor: '#e5e7eb',
      gap: 4 * scale,
    },
    optionCardSelected: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    optionCardDisabled: { opacity: 0.5 },
    optionLabel: { color: COLORS.palatinateBlue, fontSize: 13 * scale, fontWeight: 'bold' },
    optionLabelSelected: { color: COLORS.white },
    optionMotivo: { color: COLORS.silver, fontSize: 10 * scale, fontWeight: '600' },
    optionMotivoSelected: { color: 'rgba(255,255,255,0.85)' },

    errorText: { color: COLORS.brandRed, fontSize: 13 * scale, fontWeight: '600', marginTop: 16 * scale, textAlign: 'center' },
    successText: { color: '#1E8E5A', fontSize: 13 * scale, fontWeight: '600', marginTop: 16 * scale, textAlign: 'center' },

    submitButton: {
      backgroundColor: COLORS.palatinateBlue,
      paddingVertical: 16 * scale,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 20 * scale,
    },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: COLORS.white, fontSize: 15 * scale, fontWeight: 'bold', letterSpacing: 0.5 },
  });
