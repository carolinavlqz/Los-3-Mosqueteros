import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  useWindowDimensions,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

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
  const useRowLayout = isTablet || isLandscape;

  return { isLandscape, isTablet, contentWidth, scale, useRowLayout };
}

export default function PostulanteFormScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale, useRowLayout } = useScale();
  const s = createStyles(scale);

  const [fotoPostulante, setFotoPostulante] = useState(null);
  const [fotoId, setFotoId] = useState(null);
  const [loadingField, setLoadingField] = useState(null);

  const [nombre, setNombre] = useState('');
  const [puesto, setPuesto] = useState('');
  const [area, setArea] = useState('');
  const [responsable, setResponsable] = useState('');
  const [tipoCita, setTipoCita] = useState('');
  const [cvEntregado, setCvEntregado] = useState(false); 
  
  const [focusedInput, setFocusedInput] = useState(null);

  const isFormValid =
    fotoPostulante &&
    fotoId &&
    nombre.trim() !== '' &&
    puesto.trim() !== '' &&
    area.trim() !== '' &&
    responsable.trim() !== '' &&
    tipoCita.trim() !== '';

  const capturePhoto = async (field) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
        return;
      }

      setLoadingField(field);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        if (field === 'postulante') setFotoPostulante(result.assets[0].uri);
        else setFotoId(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    } finally {
      setLoadingField(null);
    }
  };

  const handleRegister = () => {
    if (!isFormValid) return;
    router.push({
      pathname: '/postulante-exito',
      params: { nombre, puesto }
    });
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
            <Ionicons name="camera-outline" size={28 * scale} color="#8ba4c9" />
          </View>
          <Text style={s.captureLabel}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderInput = (id, label, placeholder, value, setValue) => (
    <View style={s.inputWrapper}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput
        style={[s.textInput, focusedInput === id && s.textInputFocused]}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={setValue}
        onFocus={() => setFocusedInput(id)}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize="words"
      />
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#284b82" />

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
                  <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton}>
                    <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={s.headerSubtitle}>CHECK IN · VISITAS</Text>
                <Text style={s.headerTitle}>Registro Postulante</Text>
              </View>

              {/* Body */}
              <View style={s.bottomSection}>
                
                {/* Fotos */}
                <Text style={s.sectionLabel}>FOTOGRAFÍAS *</Text>
                <View style={[s.captureContainer, useRowLayout && s.captureContainerRow]}>
                  {renderCaptureBox('postulante', fotoPostulante, 'Foto del postulante')}
                  {renderCaptureBox('id', fotoId, 'Identificación')}
                </View>

                {/* Datos del Candidato */}
                {renderInput('nombre', 'NOMBRE COMPLETO *', 'Nombre y apellidos', nombre, setNombre)}

                {/* Separador visual amarillo para RH */}
                <View style={s.postulacionCard}>
                  <Text style={s.postulacionTitle}>DATOS DE LA POSTULACIÓN</Text>
                  <Text style={s.postulacionSubtitle}>Información del proceso de selección</Text>
                </View>

                {/* Formulario de Postulación */}
                {renderInput('puesto', 'PUESTO AL QUE APLICA *', 'Ej. Enfermero General, Médico...', puesto, setPuesto)}
                {renderInput('area', 'ÁREA / DEPARTAMENTO *', 'Seleccionar área...', area, setArea)}
                {renderInput('responsable', 'PERSONAL DE RH QUE LO ATIENDE *', 'Nombre del reclutador', responsable, setResponsable)}
                {renderInput('tipoCita', 'TIPO DE CITA *', 'Seleccionar tipo...', tipoCita, setTipoCita)}

                {/* Checkbox CV */}
                <TouchableOpacity 
                  style={s.checkboxRow} 
                  activeOpacity={0.7} 
                  onPress={() => setCvEntregado(!cvEntregado)}
                >
                  <View style={[s.checkbox, cvEntregado && s.checkboxChecked]}>
                    {cvEntregado && <Ionicons name="checkmark" size={16 * scale} color="#ffffff" />}
                  </View>
                  <Text style={s.checkboxLabel}>CV / Currículum entregado en recepción</Text>
                </TouchableOpacity>

                {/* Botón Final */}
                <TouchableOpacity
                  style={[s.registerButton, !isFormValid && s.registerButtonDisabled]}
                  onPress={() => router.push('/postulante-exito')}
                  disabled={!isFormValid}
                  activeOpacity={0.85}
                >
                  <Text style={s.registerText}>Registrar Entrada</Text>
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
      backgroundColor: '#284b82',
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 24 * scale,
    },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 * scale },
    iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 44 * scale, height: 44 * scale, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    headerSubtitle: { color: '#8ba4c9', fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { color: '#ffffff', fontSize: 26 * scale, fontWeight: 'bold' },

    bottomSection: { paddingHorizontal: 24 * scale, paddingTop: 24 * scale, paddingBottom: 40 * scale },
    
    sectionLabel: { color: '#6b7280', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 * scale },
    
    captureContainer: { gap: 16 * scale, marginBottom: 24 * scale },
    captureContainerRow: { flexDirection: 'row' },
    captureBox: {
      aspectRatio: 1.5, 
      borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 16,
      justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', overflow: 'hidden',
    },
    captureBoxFilled: { borderStyle: 'solid', borderColor: '#284b82' },
    captureBoxRow: { flex: 1 },
    cameraIconCircle: { width: 50 * scale, height: 50 * scale, borderRadius: 14, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginBottom: 8 * scale },
    captureLabel: { color: '#6b7280', fontSize: 13 * scale, fontWeight: '600' },
    capturedImage: { width: '100%', height: '100%' },
    checkBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#00a884', padding: 4, borderRadius: 12 },

    inputWrapper: { marginBottom: 20 * scale },
    inputLabel: { color: '#4b5563', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 * scale },
    textInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, fontSize: 15 * scale, color: '#111827' },
    textInputFocused: { borderColor: '#284b82', backgroundColor: '#ffffff', borderWidth: 2 },

    // Estilos del recuadro amarillo/naranja
    postulacionCard: { backgroundColor: '#fef3c7', padding: 16 * scale, borderRadius: 12, marginBottom: 20 * scale, marginTop: 10 * scale, borderWidth: 1, borderColor: '#fde68a' },
    postulacionTitle: { color: '#b45309', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1 },
    postulacionSubtitle: { color: '#d97706', fontSize: 14 * scale, marginTop: 4 },

    // Estilos del Checkbox de CV
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 * scale, marginTop: 4 * scale, backgroundColor: '#ffffff', padding: 16 * scale, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' },
    checkbox: { width: 24 * scale, height: 24 * scale, borderRadius: 6, borderWidth: 2, borderColor: '#9ca3af', marginRight: 12 * scale, alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: '#284b82', borderColor: '#284b82' },
    checkboxLabel: { color: '#374151', fontSize: 15 * scale, flex: 1, fontWeight: '500' },

    registerButton: { backgroundColor: '#284b82', padding: 18 * scale, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerButtonDisabled: { backgroundColor: '#cbd5e1' },
    registerText: { color: '#ffffff', fontSize: 17 * scale, fontWeight: 'bold' },
  });