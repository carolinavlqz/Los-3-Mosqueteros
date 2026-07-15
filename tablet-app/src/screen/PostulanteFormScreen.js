import React, { useRef, useState } from 'react';
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
import AutocompleteInput from '../components/AutocompleteInput';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const OPCIONES_CITA = [
  { id: 'Entrevista', label: 'Entrevista', icon: 'chatbubbles-outline' },
  { id: 'Entrega de papeles', label: 'Entrega de papeles', icon: 'document-text-outline' },
  { id: 'Nuevo ingreso', label: 'Nuevo ingreso', icon: 'person-add-outline' },
];

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

  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState(null);

  const [responsableSuggestions, setResponsableSuggestions] = useState([]);
  const [showResponsableSuggestions, setShowResponsableSuggestions] = useState(false);
  const responsableDebounceRef = useRef(null);

  const buscarResponsables = (texto) => {
    if (responsableDebounceRef.current) clearTimeout(responsableDebounceRef.current);
    if (!texto.trim()) {
      setResponsableSuggestions([]);
      return;
    }
    responsableDebounceRef.current = setTimeout(() => {
      fetch(`${API_URL}/api/postulantes/responsables?q=${encodeURIComponent(texto)}`)
        .then((res) => res.json())
        .then(setResponsableSuggestions)
        .catch(() => setResponsableSuggestions([]));
    }, 300);
  };

  const handleResponsableChange = (text) => {
    const limpio = sanitizeName(text);
    setResponsable(limpio);
    setShowResponsableSuggestions(true);
    buscarResponsables(limpio);
    if (errors.responsable) setErrors((prev) => ({ ...prev, responsable: undefined }));
  };

  const seleccionarResponsable = (nombre) => {
    setResponsable(nombre);
    setShowResponsableSuggestions(false);
    setResponsableSuggestions([]);
  };

  const handleResponsableBlur = () => {
    setFocusedInput(null);
    setTimeout(() => setShowResponsableSuggestions(false), 150);
  };

  const validate = () => {
    const next = {};
    if (!nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!puesto.trim()) next.puesto = 'El puesto es obligatorio';
    if (!area.trim()) next.area = 'El área es obligatoria';
    if (!responsable.trim()) next.responsable = 'El personal de RH es obligatorio';
    if (!tipoCita.trim()) next.tipoCita = 'Debes seleccionar un tipo de cita';
    setErrors(next);

    const hasPhoto = !!fotoPostulante;
    setPhotoError(hasPhoto ? null : 'Debes tomar la foto del postulante');

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
        if (field === 'postulante') {
          setFotoPostulante(result.assets[0].uri);
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
      formData.append('puesto', puesto);
      formData.append('area', area);
      formData.append('responsable', responsable);
      formData.append('tipoCita', tipoCita);

      if (fotoPostulante) {
        if (Platform.OS === 'web') {
          const blob = await fetch(fotoPostulante).then(r => r.blob());
          formData.append('foto_persona', blob, 'postulante.jpg');
        } else {
          formData.append('foto_persona', {
            uri: fotoPostulante,
            name: 'postulante.jpg',
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

      const response = await fetch(`${API_URL}/api/postulantes`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: '/postulante-exito',
          params: { nombre, puesto, tipoCita, folio: data.folio }
        });
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo registrar la visita.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No hay conexión con el servidor.');
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
        editable={!isLoading}
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

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={s.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.outerContainer}>
            <View style={[s.container, { width: contentWidth }]}>
              
              {/* Header */}
              <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
                <View style={s.headerTopRow}>
                  <TouchableOpacity onPress={() => router.back()} style={s.iconButton} disabled={isLoading}>
                    <Ionicons name="chevron-back" size={22 * scale} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/hospital')} style={s.iconButton} disabled={isLoading}>
                    <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={s.headerSubtitle}>CHECK IN · VISITAS</Text>
                <Text style={s.headerTitle}>Registro Postulante</Text>
              </View>

              {/* Body */}
              <View style={[s.bottomSection, (isLandscape || isTablet) && s.bottomSectionLandscape]}>
                
                {/* Fotos */}
                <Text style={s.sectionLabel}>FOTOGRAFÍAS</Text>
                <View style={[s.captureContainer, useRowLayout && s.captureContainerRow]}>
                  {renderCaptureBox('postulante', fotoPostulante, 'Foto del postulante *')}
                  {renderCaptureBox('id', fotoId, 'Identificación (opcional)')}
                </View>
                {photoError ? <Text style={[s.errorText, { marginTop: -12 * scale, marginBottom: 16 * scale }]}>{photoError}</Text> : null}

                {/* Datos del Candidato */}
                {renderInput('nombre', 'NOMBRE COMPLETO *', 'Nombre y apellidos', nombre, setNombre, true)}

                {/* Separador visual amarillo para RH */}
                <View style={s.postulacionCard}>
                  <Text style={s.postulacionTitle}>DATOS DE LA POSTULACIÓN</Text>
                  <Text style={s.postulacionSubtitle}>Información del proceso de selección</Text>
                </View>

                {/* Formulario de Postulación */}
                {renderInput('puesto', 'PUESTO AL QUE APLICA *', 'Ej. Enfermero General, Médico...', puesto, setPuesto)}
                {renderInput('area', 'ÁREA / DEPARTAMENTO *', 'Seleccionar área...', area, setArea)}
                
                <View style={s.inputWrapper}>
                  <Text style={s.inputLabel}>PERSONAL DE RH QUE LO ATIENDE *</Text>
                  <AutocompleteInput
                    scale={scale}
                    wrapperStyle={{ zIndex: 30 }}
                    inputStyle={[s.textInput, focusedInput === 'responsable' && s.textInputFocused, errors.responsable && s.textInputError]}
                    placeholder="Nombre del reclutador"
                    placeholderTextColor="#9ca3af"
                    value={responsable}
                    onChangeText={handleResponsableChange}
                    onFocus={() => { setFocusedInput('responsable'); setShowResponsableSuggestions(true); }}
                    onBlur={handleResponsableBlur}
                    suggestions={responsableSuggestions}
                    showSuggestions={showResponsableSuggestions}
                    onSelectSuggestion={seleccionarResponsable}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                  {!errors.responsable ? (
                    <View style={s.hintRow}>
                      <Ionicons name="information-circle-outline" size={13 * scale} color={COLORS.silver} />
                      <Text style={s.hintText}>Solo letras, sin números ni caracteres especiales</Text>
                    </View>
                  ) : null}
                  {errors.responsable ? <Text style={s.errorText}>{errors.responsable}</Text> : null}
                </View>

                {/* Selector de Tipo de Cita */}
                <View style={s.inputWrapper}>
                  <Text style={s.inputLabel}>TIPO DE CITA *</Text>
                  <View style={[s.selectorContainer, isLandscape && s.selectorContainerLandscape]}>
                    {OPCIONES_CITA.map((opcion) => {
                      const isSelected = tipoCita === opcion.id;
                      return (
                        <TouchableOpacity
                          key={opcion.id}
                          style={[
                            s.optionButton,
                            isSelected && s.optionButtonSelected,
                            errors.tipoCita && s.optionButtonError
                          ]}
                          activeOpacity={0.8}
                          onPress={() => {
                            setTipoCita(opcion.id);
                            if (errors.tipoCita) setErrors((prev) => ({ ...prev, tipoCita: undefined }));
                          }}
                          disabled={isLoading}
                        >
                          <Ionicons 
                            name={opcion.icon} 
                            size={18 * scale} 
                            color={isSelected ? COLORS.white : '#6b7280'} 
                            style={{ marginBottom: 4 * scale }} 
                          />
                          <Text 
                            style={[s.optionText, isSelected && s.optionTextSelected]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                          >
                            {opcion.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.tipoCita ? <Text style={s.errorText}>{errors.tipoCita}</Text> : null}
                </View>

                {/* Botón Final */}
                <TouchableOpacity
                  style={[s.registerButton, isLoading && s.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text style={s.registerText}>
                    {isLoading ? 'Guardando...' : 'Registrar Entrada'}
                  </Text>
                  {!isLoading && <Ionicons name="checkmark" size={20 * scale} color="#ffffff" style={{ marginLeft: 8 * scale }} />}
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
    safeArea: { 
      flex: 1, 
      backgroundColor: '#f4f6f9' 
    },
    scrollContainer: { 
      flexGrow: 1 
    },
    outerContainer: { 
      flex: 1, 
      alignItems: 'center',
      backgroundColor: '#f4f6f9'
    },
    container: { 
      flex: 1 
    },

    header: {
      backgroundColor: COLORS.palatinateBlue,
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 20,
      paddingBottom: 24 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerLandscape: {
      paddingHorizontal: 48 * scale,
      paddingTop: 20
    },
    headerTopRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 20 * scale 
    },
    iconButton: { 
      backgroundColor: 'rgba(255, 255, 255, 0.15)', 
      width: 44 * scale, 
      height: 44 * scale, 
      borderRadius: 12, 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    headerSubtitle: { 
      color: COLORS.periwinkle, 
      fontSize: 12 * scale, 
      fontWeight: '700', 
      letterSpacing: 1.5, 
      marginBottom: 4 
    },
    headerTitle: { 
      color: COLORS.white, 
      fontSize: 26 * scale, 
      fontWeight: 'bold' 
    },

    bottomSection: { 
      paddingHorizontal: 24 * scale, 
      paddingTop: 24 * scale, 
      paddingBottom: 40 * scale 
    },
    bottomSectionLandscape: {
      paddingHorizontal: 48 * scale
    },
    
    sectionLabel: { 
      color: '#6b7280', 
      fontSize: 12 * scale, 
      fontWeight: 'bold', 
      letterSpacing: 1, 
      marginBottom: 12 * scale 
    },
    
    captureContainer: { 
      gap: 16 * scale, 
      marginBottom: 24 * scale 
    },
    captureContainerRow: { 
      flexDirection: 'row' 
    },
    captureBox: {
      aspectRatio: 1.5, 
      borderWidth: 2, 
      borderColor: '#d1d5db', 
      borderStyle: 'dashed', 
      borderRadius: 16,
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f9fafb', 
      overflow: 'hidden',
    },
    captureBoxFilled: { 
      borderStyle: 'solid', 
      borderColor: COLORS.royalBlue 
    },
    captureBoxRow: { 
      flex: 1 
    },
    cameraIconCircle: { 
      width: 50 * scale, 
      height: 50 * scale, 
      borderRadius: 14, 
      backgroundColor: '#e5e7eb', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginBottom: 8 * scale 
    },
    captureLabel: { 
      color: '#6b7280', 
      fontSize: 13 * scale, 
      fontWeight: '600' 
    },
    capturedImage: { 
      width: '100%', 
      height: '100%' 
    },
    checkBadge: { 
      position: 'absolute', 
      top: 10 * scale, 
      right: 10 * scale, 
      backgroundColor: COLORS.royalBlue, 
      padding: 4 * scale, 
      borderRadius: 12 
    },

    inputWrapper: { 
      marginBottom: 20 * scale 
    },
    inputLabel: { 
      color: '#4b5563', 
      fontSize: 12 * scale, 
      fontWeight: 'bold', 
      letterSpacing: 1, 
      marginBottom: 8 * scale 
    },
    textInput: { 
      backgroundColor: '#ffffff', 
      borderWidth: 1, 
      borderColor: '#d1d5db', 
      borderRadius: 12, 
      paddingHorizontal: 16 * scale, 
      paddingVertical: 14 * scale, 
      fontSize: 15 * scale, 
      color: '#111827' 
    },
    textInputFocused: { 
      borderColor: COLORS.royalBlue, 
      backgroundColor: '#ffffff', 
      borderWidth: 2 
    },
    textInputError: { 
      borderColor: COLORS.brandRed 
    },
    errorText: { 
      color: COLORS.brandRed, 
      fontSize: 12 * scale, 
      fontWeight: '600', 
      marginTop: 6 * scale 
    },
    hintRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 4, 
      marginTop: 6 * scale 
    },
    hintText: { 
      color: COLORS.silver, 
      fontSize: 11 * scale, 
      fontStyle: 'italic' 
    },

    postulacionCard: { 
      backgroundColor: COLORS.brandRedSoft, 
      padding: 16 * scale, 
      borderRadius: 12, 
      marginBottom: 20 * scale, 
      marginTop: 10 * scale, 
      borderWidth: 1, 
      borderColor: 'rgba(219,24,48,0.25)' 
    },
    postulacionTitle: { 
      color: COLORS.brandRed, 
      fontSize: 12 * scale, 
      fontWeight: 'bold', 
      letterSpacing: 1 
    },
    postulacionSubtitle: { 
      color: COLORS.palatinateBlue, 
      fontSize: 14 * scale, 
      marginTop: 4 
    },

    selectorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8 * scale,
    },
    selectorContainerLandscape: {
      gap: 16 * scale,
    },
    optionButton: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderWidth: 1.5,
      borderColor: '#d1d5db',
      borderRadius: 12,
      paddingVertical: 12 * scale,
      paddingHorizontal: 6 * scale,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionButtonSelected: {
      backgroundColor: COLORS.royalBlue,
      borderColor: COLORS.royalBlue,
    },
    optionButtonError: {
      borderColor: COLORS.brandRed,
    },
    optionText: {
      color: '#4b5563',
      fontSize: 11 * scale,
      fontWeight: '600',
      textAlign: 'center',
    },
    optionTextSelected: {
      color: '#ffffff',
    },

    registerButton: { 
      backgroundColor: COLORS.royalBlue, 
      padding: 18 * scale, 
      borderRadius: 16, 
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center',
      marginTop: 8 * scale
    },
    registerButtonDisabled: { 
      backgroundColor: COLORS.silver 
    },
    registerText: { 
      color: COLORS.white, 
      fontSize: 17 * scale, 
      fontWeight: 'bold' 
    },
  });
