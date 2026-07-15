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
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { sanitizeName } from '../utils/validators';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ExEmpleadoFormScreen() {
  const router = useRouter();
  const { contentWidth, scale, useRowLayout } = useScale();
  const s = createStyles(scale);

  const [fotoPersona, setFotoPersona] = useState(null);
  const [fotoId, setFotoId] = useState(null);
  const [loadingField, setLoadingField] = useState(null);

  const [nombre, setNombre] = useState('');
  const [motivo] = useState('Finiquito'); // Fijo por defecto

  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState(null);

  const validate = () => {
    const next = {};
    if (!nombre.trim()) next.nombre = 'El nombre completo es obligatorio';
    setErrors(next);

    const hasPhoto = !!fotoPersona;
    setPhotoError(hasPhoto ? null : 'Debes tomar la foto del ex empleado');

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
        if (field === 'persona') {
          setFotoPersona(result.assets[0].uri);
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

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('motivo', motivo);
      formData.append('tipo_visita', 'Ex Empleado');

      // Foto Ex Empleado
      if (fotoPersona) {
        if (Platform.OS === 'web') {
          const blob = await fetch(fotoPersona).then(r => r.blob());
          formData.append('foto_persona', blob, 'ex-empleado.jpg');
        } else {
          const uriParts = fotoPersona.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('foto_persona', {
            uri: fotoPersona,
            name: `ex-empleado.${fileType}`,
            type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
          });
        }
      }

      // Foto Identificación (Opcional)
      if (fotoId) {
        if (Platform.OS === 'web') {
          const blob = await fetch(fotoId).then(r => r.blob());
          formData.append('foto_ine', blob, 'ine.jpg');
        } else {
          const uriParts = fotoId.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('foto_ine', {
            uri: fotoId,
            name: `ine.${fileType}`,
            type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
          });
        }
      }

      const response = await fetch(`${API_URL}/api/ex-empleados`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const textResponse = await response.text();
      let data = {};
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        throw new Error("El servidor no devolvió una respuesta JSON válida.");
      }

      if (response.ok) {
        router.push({
          pathname: '/postulante-exito', // Puedes usar la misma pantalla de éxito o crear una similar
          params: { nombre, puesto: motivo, folio: data.folio }
        });
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo registrar la visita.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No hay conexión con el servidor o falló el guardado.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCaptureBox = (field, photo, label) => (
    <TouchableOpacity
      style={[s.captureBox, useRowLayout && s.captureBoxRow, photo && s.captureBoxFilled]}
      activeOpacity={0.85}
      onPress={() => capturePhoto(field)}
      disabled={loadingField === field || isLoading}
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
                  <TouchableOpacity onPress={() => router.back()} style={s.iconButton} disabled={isLoading}>
                    <Ionicons name="chevron-back" size={22 * scale} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton} disabled={isLoading}>
                    <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={s.headerSubtitle}>CHECK IN · VISITAS</Text>
                <Text style={s.headerTitle}>Registro Ex Empleado</Text>
              </View>

              {/* Body */}
              <View style={s.bottomSection}>
                
                {/* Fotografía de la persona */}
                <Text style={s.sectionLabel}>FOTOGRAFÍAS</Text>
                <View style={[s.captureContainer, useRowLayout && s.captureContainerRow]}>
                  {renderCaptureBox('persona', fotoPersona, 'Foto del Ex Empleado *')}
                  {renderCaptureBox('id', fotoId, 'Identificación (opcional)')}
                </View>
                {photoError ? <Text style={s.errorText}>{photoError}</Text> : null}

                {/* Formulario */}
                <View style={s.inputWrapper}>
                  <Text style={s.inputLabel}>NOMBRE COMPLETO *</Text>
                  <TextInput
                    style={[s.textInput, focusedInput === 'nombre' && s.textInputFocused, errors.nombre && s.textInputError]}
                    placeholder="Nombre y apellidos"
                    placeholderTextColor="#9ca3af"
                    value={nombre}
                    onChangeText={(text) => {
                      setNombre(sanitizeName(text)); // Solo letras
                      if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }));
                    }}
                    onFocus={() => setFocusedInput('nombre')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                  {!errors.nombre ? (
                    <View style={s.hintRow}>
                      <Ionicons name="information-circle-outline" size={13 * scale} color={COLORS.silver} />
                      <Text style={s.hintText}>Solo letras, sin números ni caracteres especiales</Text>
                    </View>
                  ) : null}
                  {errors.nombre ? <Text style={s.errorText}>{errors.nombre}</Text> : null}
                </View>

                {/* Tarjeta del Motivo Fijo: Finiquito */}
                <View style={s.exEmpleadoCard}>
                  <Text style={s.exEmpleadoTitle}>MOTIVO DE LA VISITA (PREDETERMINADO)</Text>
                  <View style={s.exEmpleadoRow}>
                    <Ionicons name="document-text" size={20 * scale} color="#ef4444" />
                    <Text style={s.exEmpleadoSubtitle}>Firma de Finiquito Administrativo</Text>
                  </View>
                </View>

                {/* Botón Final */}
                <TouchableOpacity
                  style={[s.registerButton, isLoading && s.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text style={s.registerText}>
                    {isLoading ? 'Guardando...' : 'Registrar Salida / Finiquito'}
                  </Text>
                  {!isLoading && <Ionicons name="checkmark" size={20 * scale} color="#ffffff" style={{marginLeft: 8}} />}
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
      backgroundColor: '#1a355b',
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
    captureBoxFilled: { borderStyle: 'solid', borderColor: '#ef4444' },
    captureBoxRow: { flex: 1 },
    cameraIconCircle: { width: 50 * scale, height: 50 * scale, borderRadius: 14, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginBottom: 8 * scale },
    captureLabel: { color: '#6b7280', fontSize: 13 * scale, fontWeight: '600' },
    capturedImage: { width: '100%', height: '100%' },
    checkBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ef4444', padding: 4, borderRadius: 12 },

    inputWrapper: { marginBottom: 20 * scale },
    inputLabel: { color: '#4b5563', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 * scale },
    textInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, fontSize: 15 * scale, color: '#111827' },
    textInputFocused: { borderColor: '#ef4444', backgroundColor: '#ffffff', borderWidth: 2 },
    textInputError: { borderColor: COLORS.brandRed },
    errorText: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: '600', marginTop: 6 * scale },
    hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 * scale },
    hintText: { color: COLORS.silver, fontSize: 11 * scale, fontStyle: 'italic' },

    exEmpleadoCard: { backgroundColor: '#fef2f2', padding: 16 * scale, borderRadius: 12, marginBottom: 24 * scale, marginTop: 10 * scale, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)' },
    exEmpleadoTitle: { color: '#991b1b', fontSize: 11 * scale, fontWeight: 'bold', letterSpacing: 1 },
    exEmpleadoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 * scale, marginTop: 8 * scale },
    exEmpleadoSubtitle: { color: '#111827', fontSize: 15 * scale, fontWeight: '600' },

    registerButton: { backgroundColor: '#ef4444', padding: 18 * scale, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerButtonDisabled: { backgroundColor: COLORS.silver },
    registerText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });