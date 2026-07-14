import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  KeyboardAvoidingView,
  Alert,
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

export default function DatosScreen() {
  const router = useRouter();
  
  const { pisoSeleccionado, areaSeleccionada, proveedorPhoto, idPhoto } = useLocalSearchParams();
  
  const { isLandscape, isTablet, contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [empresa, setEmpresa] = useState('');
  const [representante, setRepresentante] = useState('');
  const [motivo, setMotivo] = useState('');
  const [contacto, setContacto] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  
  // Estados para controlar los mensajes de error por campo
  const [errors, setErrors] = useState({
    empresa: '',
    representante: '',
    motivo: '',
    contacto: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // El formulario es válido si ningún campo está vacío y no hay errores activos
  const isFormValid = 
    empresa.trim() !== '' && 
    representante.trim() !== '' && 
    motivo.trim() !== '' && 
    contacto.trim() !== '' &&
    !errors.empresa &&
    !errors.representante &&
    !errors.motivo &&
    !errors.contacto;

  // Función encargada de filtrar el texto y encender/apagar alertas
  const handleTextChange = (id, text, setValue) => {
    // Permitimos letras (incluyendo acentos, eñes) y espacios.
    // Al revés: si detecta algo que NO sea eso, muestra el aviso.
    const hasInvalidChars = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(text);

    if (hasInvalidChars) {
      setErrors(prev => ({
        ...prev,
        [id]: 'Solo se permiten letras, sin números ni caracteres especiales.'
      }));
    } else {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }

    // Limpiamos el texto al vuelo eliminando lo que no sean letras o espacios
    const cleanedText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setValue(cleanedText);
  };

  const handleRegister = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);

    try {
      const urlDelServidor = 'http://10.1.17.35:3000/api/proveedores';
      
      const response = await fetch(urlDelServidor, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pisoSeleccionado,
          areaSeleccionada,
          empresa,
          representante,
          motivo,
          contacto,
          foto_persona: proveedorPhoto,
          foto_ine: idPhoto            
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: '/proveedor-exito',
          params: { pisoSeleccionado, areaSeleccionada, empresa, representante }
        });
      } else {
        Alert.alert('Error', data.mensaje || 'Hubo un problema al registrar la entrada.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (id, label, placeholder, value, setValue) => (
    <View style={s.inputContainer}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput
        style={[
          s.textInput, 
          focusedInput === id && s.textInputFocused,
          errors[id] !== '' && s.textInputError
        ]}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={(text) => handleTextChange(id, text, setValue)}
        onFocus={() => setFocusedInput(id)}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize="words"
        editable={!isLoading}
      />
      {errors[id] !== '' && (
        <Text style={s.errorText}>{errors[id]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a355b" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={s.outerContainer}>
            <View style={[s.container, { width: contentWidth }]}>
              {/* Header */}
              <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
                <TouchableOpacity onPress={() => router.back()} style={s.backButton} disabled={isLoading}>
                  <Ionicons name="chevron-back" size={22 * scale} color="#8ba4c9" />
                  <Text style={s.backText}>Regresar</Text>
                </TouchableOpacity>
                <Text style={s.stepTitle}>REGISTRO — PROVEEDOR</Text>
                <Text style={s.mainTitle}>Datos</Text>

                {/* Stepper */}
                <View style={s.stepper}>
                  <View style={s.stepCompleted}>
                    <Ionicons name="checkmark" size={20 * scale} color="#ffffff" />
                  </View>
                  <View style={s.stepLineActive} />
                  <View style={s.stepCompleted}>
                    <Ionicons name="checkmark" size={20 * scale} color="#ffffff" />
                  </View>
                  <View style={s.stepLineActive} />
                  <View style={s.stepCompleted}>
                    <Ionicons name="checkmark" size={20 * scale} color="#ffffff" />
                  </View>
                  <View style={s.stepLineActive} />
                  <View style={s.stepActive}>
                    <Text style={s.stepTextActive}>4</Text>
                  </View>
                </View>
                <View style={s.stepLabels}>
                  <Text style={s.labelInactive}>Fotos</Text>
                  <Text style={s.labelInactive}>Piso</Text>
                  <Text style={s.labelInactive}>Área</Text>
                  <Text style={s.labelActive}>Datos</Text>
                </View>
              </View>

              {/* Body */}
              <View style={[s.bottomSection, (isLandscape || isTablet) && s.bottomSectionLandscape]}>
                <View style={s.locationCard}>
                  <Ionicons name="location" size={24 * scale} color="#00a884" />
                  <View style={{ marginLeft: 12 * scale }}>
                    <Text style={s.locationTitle}>Ubicación seleccionada</Text>
                    <Text style={s.locationSubtitle}>{pisoSeleccionado} — {areaSeleccionada}</Text>
                  </View>
                </View>

                <View style={s.formContainer}>
                  {renderInput('empresa', 'EMPRESA / PROVEEDOR', 'Nombre de la empresa', empresa, setEmpresa)}
                  {renderInput('representante', 'REPRESENTANTE', 'Nombre completo del representante', representante, setRepresentante)}
                  {renderInput('motivo', 'MOTIVO DE VISITA', 'Descripción del motivo', motivo, setMotivo)}
                  {renderInput('contacto', 'PERSONA DE CONTACTO', 'Nombre del contacto interno', contacto, setContacto)}
                </View>

                <TouchableOpacity
                  style={[s.registerButton, (!isFormValid || isLoading) && s.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={!isFormValid || isLoading}
                  activeOpacity={0.85}
                >
                  <Text style={s.registerText}>
                    {isLoading ? 'Guardando...' : 'Registrar Entrada'}
                  </Text>
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
    header: { backgroundColor: '#1a355b', paddingHorizontal: 28 * scale, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 28 * scale, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    headerLandscape: { paddingHorizontal: 48 * scale },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 * scale },
    backText: { color: '#8ba4c9', fontSize: 15 * scale, marginLeft: 2 },
    stepTitle: { color: '#00a884', fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5 },
    mainTitle: { color: '#ffffff', fontSize: 28 * scale, fontWeight: 'bold', marginTop: 6 },
    stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 * scale },
    stepCompleted: { backgroundColor: '#00a884', width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepActive: { backgroundColor: '#00a884', width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepInactive: { borderColor: 'rgba(255,255,255,0.25)', borderWidth: 2, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepTextActive: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 * scale },
    stepTextInactive: { color: '#8ba4c9', fontWeight: 'bold', fontSize: 14 * scale },
    stepLine: { width: 32 * scale, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
    stepLineActive: { width: 32 * scale, height: 2, backgroundColor: '#00a884' },
    stepLabels: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 26 * scale },
    labelActive: { color: '#00a884', fontSize: 12 * scale, fontWeight: '600' },
    labelInactive: { color: '#5b7398', fontSize: 12 * scale },
    bottomSection: { flex: 1, paddingHorizontal: 28 * scale, paddingTop: 24 * scale, paddingBottom: 24 * scale, justifyContent: 'space-between' },
    bottomSectionLandscape: { paddingHorizontal: 48 * scale },
    locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f7f4', padding: 16 * scale, borderRadius: 16, marginBottom: 24 * scale },
    locationTitle: { color: '#0fa38b', fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1 },
    locationSubtitle: { color: '#1e3a68', fontSize: 16 * scale, fontWeight: 'bold', marginTop: 2 },
    formContainer: { gap: 20 * scale, marginBottom: 32 * scale },
    inputContainer: { gap: 8 * scale },
    inputLabel: { color: '#6b7280', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1 },
    textInput: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, fontSize: 16 * scale, color: '#111827' },
    textInputFocused: { borderColor: '#00a884', backgroundColor: '#ffffff' },
    textInputError: { borderColor: '#dc2626' },
    errorText: { color: '#dc2626', fontSize: 11 * scale, marginTop: -2, paddingHorizontal: 4 },
    registerButton: { backgroundColor: '#00a884', padding: 18 * scale, borderRadius: 16, alignItems: 'center' },
    registerButtonDisabled: { backgroundColor: '#a7c4b9' },
    registerText: { color: '#ffffff', fontSize: 17 * scale, fontWeight: 'bold' },
  });
