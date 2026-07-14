import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams} from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { sanitizeName } from '../utils/validators';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FamiliarFormScreen() {
  const router = useRouter();
  const { proveedorPhoto, idPhoto } = useLocalSearchParams();
  const { isLandscape, isTablet, contentWidth, scale, useRowLayout } = useScale();
  const s = createStyles(scale);

  const [fotoVisitante, setFotoVisitante] = useState(null);
  const [fotoId, setFotoId] = useState(null);
  const [loadingField, setLoadingField] = useState(null);

  const [nombre, setNombre] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [piso, setPiso] = useState('');
  const [habitacion, setHabitacion] = useState('');
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState(null);

  const [pisos, setPisos] = useState([]);
  const [isLoadingPisos, setIsLoadingPisos] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [isLoadingHabitaciones, setIsLoadingHabitaciones] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/hospital/pisos`)
      .then((res) => res.json())
      .then((data) => setPisos(data.map((p) => p.piso)))
      .catch(() => setPisos([]))
      .finally(() => setIsLoadingPisos(false));
  }, []);

  const seleccionarPiso = useCallback((nuevoPiso) => {
    setPiso(nuevoPiso);
    setHabitacion('');
    setErrors((prev) => ({ ...prev, piso: undefined, habitacion: undefined }));
    setIsLoadingHabitaciones(true);
    fetch(`${API_URL}/api/hospital/habitaciones?piso=${encodeURIComponent(nuevoPiso)}`)
      .then((res) => res.json())
      .then(setHabitaciones)
      .catch(() => setHabitaciones([]))
      .finally(() => setIsLoadingHabitaciones(false));
  }, []);

  const seleccionarHabitacion = useCallback((nuevaHabitacion) => {
    setHabitacion(nuevaHabitacion);
    setErrors((prev) => ({ ...prev, habitacion: undefined }));
  }, []);

  const validate = () => {
    const next = {};
    if (!nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!parentesco.trim()) next.parentesco = 'El parentesco es obligatorio';
    if (!piso) next.piso = 'El piso es obligatorio';
    if (!habitacion) next.habitacion = 'La habitación es obligatoria';
    if (!nombrePaciente.trim()) next.nombrePaciente = 'El nombre del paciente es obligatorio';
    setErrors(next);

    const hasPhoto = !!fotoVisitante;
    setPhotoError(hasPhoto ? null : 'Debes tomar la foto del visitante');

    return Object.keys(next).length === 0 && hasPhoto;
  };

  const capturePhoto = async (field) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
        return;
      }

      setLoadingField(field);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        if (field === 'visitante') {
          setFotoVisitante(result.assets[0].uri);
          setPhotoError(null);
        } else {
          setFotoId(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    } finally {
      setLoadingField(null);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('parentesco', parentesco);
      formData.append('piso', piso);
      formData.append('habitacion', habitacion);
      formData.append('nombrePaciente', nombrePaciente);

      if (fotoVisitante) {
        if (Platform.OS === 'web') {
          const blob = await fetch(fotoVisitante).then(r => r.blob());
          formData.append('foto_persona', blob, 'visitante.jpg');
        } else {
          formData.append('foto_persona', {
            uri: fotoVisitante,
            name: 'visitante.jpg',
            type: 'image/jpeg',
          });
        }
      }
  
      if (fotoId) {
        if (Platform.OS === 'web') {
          const blob = await fetch(fotoId).then(r => r.blob());
          formData.append('foto_ine', blob, 'ine.jpg');
        } else {
          formData.append('foto_ine', {
            uri: fotoId,
            name: 'ine.jpg',
            type: 'image/jpeg',
          });
        }
      }

      const response = await fetch(`${API_URL}/api/familiares`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: '/familiar-exito',
          params: { nombre, habitacion, folio: data.folio },
        });
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo registrar.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No hay conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCaptureBox = (field, photo, label) => (
    <TouchableOpacity
      style={[s.captureBox, useRowLayout && s.captureBoxRow, photo && s.captureBoxFilled]}
      activeOpacity={0.85}
      onPress={() => capturePhoto(field)}
      disabled={loadingField === field}
    >
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={s.capturedImage} />
          <View style={s.checkBadge}>
            <Ionicons name="checkmark" size={14 * scale} color="#ffffff" />
          </View>
        </>
      ) : (
        <>
          <View style={s.cameraIconCircle}>
            <Ionicons name="camera-outline" size={28 * scale} color={COLORS.silver} />
          </View>
          <Text style={s.captureLabel}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderChipSelector = (label, options, selected, onSelect, isLoadingOptions, errorMsg, emptyHint) => (
    <View style={s.inputWrapper}>
      <Text style={s.inputLabel}>{label}</Text>
      {isLoadingOptions ? (
        <ActivityIndicator color={COLORS.royalBlue} style={{ marginVertical: 8 * scale }} />
      ) : options.length === 0 ? (
        <Text style={s.hintText}>{emptyHint}</Text>
      ) : (
        <View style={s.chipRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.chip, selected === opt && s.chipSelected]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, selected === opt && s.chipTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}
    </View>
  );

  const renderInput = (id, label, placeholder, value, setValue, nameOnly = false) => (
    <View style={s.inputWrapper}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput
        style={[s.textInput, focusedInput === id && s.textInputFocused, errors[id] && s.textInputError]}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={(text) => {
          setValue(nameOnly ? sanitizeName(text) : text);
          if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
        }}
        onFocus={() => setFocusedInput(id)}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize="words"
      />
      {nameOnly && !errors[id] ? (
        <View style={s.hintRow}>
          <Ionicons name="information-circle-outline" size={13 * scale} color={COLORS.silver} />
          <Text style={s.hintText}>Solo letras, sin números ni caracteres especiales</Text>
        </View>
      ) : null}
      {errors[id] ? <Text style={s.errorText}>{errors[id]}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={s.outerContainer}>
            <View style={[s.container, { width: contentWidth }]}>
              
              {/* Header */}
              <View style={s.header}>
                <View style={s.headerTopRow}>
                  <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
                    <Ionicons name="chevron-back" size={22 * scale} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/hospital')} style={s.iconButton}>
                    <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={s.headerSubtitle}>CHECK IN · VISITAS</Text>
                <Text style={s.headerTitle}>Visita Familiar</Text>
              </View>

              {/* Body */}
              <View style={s.bottomSection}>
                
                {/* Fotos */}
                <Text style={s.sectionLabel}>FOTOGRAFÍAS</Text>
                <View style={[s.captureContainer, useRowLayout && s.captureContainerRow]}>
                  {renderCaptureBox('visitante', fotoVisitante, 'Foto del visitante *')}
                  {renderCaptureBox('id', fotoId, 'Identificación (opcional)')}
                </View>
                {photoError ? <Text style={s.errorText}>{photoError}</Text> : null}

                {/* Formulario Visitante */}
                {renderInput('nombre', 'NOMBRE COMPLETO DEL VISITANTE *', 'Nombre y apellidos', nombre, setNombre, true)}
                {renderInput('parentesco', 'PARENTESCO *', 'Ej. Esposo, Madre, Hijo...', parentesco, setParentesco)}

                {/* Separador visual de Paciente */}
                <View style={s.pacienteCard}>
                  <Text style={s.pacienteTitle}>DATOS DEL PACIENTE</Text>
                  <Text style={s.pacienteSubtitle}>Información del familiar internado</Text>
                </View>

                {/* Formulario Paciente */}
                {renderChipSelector('PISO *', pisos, piso, seleccionarPiso, isLoadingPisos, errors.piso)}
                {piso
                  ? renderChipSelector(
                      'HABITACIÓN / CUARTO *',
                      habitaciones,
                      habitacion,
                      seleccionarHabitacion,
                      isLoadingHabitaciones,
                      errors.habitacion,
                      'Este piso no tiene habitaciones registradas'
                    )
                  : null}
                {renderInput('nombrePaciente', 'NOMBRE DEL PACIENTE *', 'Nombre completo del paciente', nombrePaciente, setNombrePaciente, true)}

                {/* Botón Final */}
                <TouchableOpacity
                  style={[s.registerButton, isLoading && s.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text style={s.registerText}>{isLoading ? 'Guardando...' : 'Registrar Entrada'}</Text>
                  <Ionicons name="checkmark" size={20 * scale} color="#ffffff" style={{marginLeft: 8}} />
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f6f9' },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1 },

    header: {
      backgroundColor: COLORS.palatinateBlue,
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 24 * scale,
    },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 * scale },
    iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 44 * scale, height: 44 * scale, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    headerSubtitle: { color: COLORS.periwinkle, fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { color: COLORS.white, fontSize: 26 * scale, fontWeight: 'bold' },

    bottomSection: { paddingHorizontal: 24 * scale, paddingTop: 24 * scale, paddingBottom: 40 * scale },
    
    sectionLabel: { color: '#6b7280', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 * scale },
    
    captureContainer: { gap: 16 * scale, marginBottom: 24 * scale },
    captureContainerRow: { flexDirection: 'row' },
    captureBox: {
      aspectRatio: 1.5,
      borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 16,
      justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', overflow: 'hidden',
    },
    captureBoxFilled: { borderStyle: 'solid', borderColor: COLORS.royalBlue },
    captureBoxRow: { flex: 1 },
    cameraIconCircle: { width: 50 * scale, height: 50 * scale, borderRadius: 14, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginBottom: 8 * scale },
    captureLabel: { color: '#6b7280', fontSize: 13 * scale, fontWeight: '600' },
    capturedImage: { width: '100%', height: '100%' },
    checkBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.royalBlue, padding: 4, borderRadius: 12 },

    inputWrapper: { marginBottom: 20 * scale },
    inputLabel: { color: '#4b5563', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 * scale },
    textInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, fontSize: 15 * scale, color: '#111827' },
    textInputFocused: { borderColor: COLORS.royalBlue, backgroundColor: '#ffffff', borderWidth: 2 },
    textInputError: { borderColor: COLORS.brandRed },
    errorText: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: '600', marginTop: 6 * scale },
    hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 * scale },
    hintText: { color: COLORS.silver, fontSize: 11 * scale, fontStyle: 'italic' },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 * scale },
    chip: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 10 * scale,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#d1d5db',
    },
    chipSelected: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    chipText: { color: '#4b5563', fontSize: 14 * scale, fontWeight: '600' },
    chipTextSelected: { color: COLORS.white },

    pacienteCard: { backgroundColor: COLORS.royalBlueSoft, padding: 16 * scale, borderRadius: 12, marginBottom: 20 * scale, marginTop: 10 * scale },
    pacienteTitle: { color: COLORS.palatinateBlue, fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1 },
    pacienteSubtitle: { color: COLORS.royalBlue, fontSize: 14 * scale, marginTop: 4 },

    registerButton: { backgroundColor: COLORS.royalBlue, padding: 18 * scale, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 * scale },
    registerButtonDisabled: { backgroundColor: COLORS.silver },
    registerText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });