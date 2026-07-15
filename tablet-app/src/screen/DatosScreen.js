import React, { useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { sanitizeName } from '../utils/validators';
import AutocompleteInput from '../components/AutocompleteInput';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [empresaSuggestions, setEmpresaSuggestions] = useState([]);
  const [showEmpresaSuggestions, setShowEmpresaSuggestions] = useState(false);
  const empresaDebounceRef = useRef(null);

  // --- CONFIGURACIÓN RESPONSIVA DEL FORMULARIO ---
  // Dividimos en 2 columnas en tablets u orientación horizontal para optimizar el espacio
  const useTwoColumns = isTablet || isLandscape;
  const gapSize = 16 * scale;
  const itemWidth = useTwoColumns ? (contentWidth - gapSize) / 2 : '100%';

  const buscarEmpresas = (texto) => {
    if (empresaDebounceRef.current) clearTimeout(empresaDebounceRef.current);
    if (!texto.trim()) {
      setEmpresaSuggestions([]);
      return;
    }
    empresaDebounceRef.current = setTimeout(() => {
      fetch(`${API_URL}/api/proveedores/empresas?q=${encodeURIComponent(texto)}`)
        .then((res) => res.json())
        .then(setEmpresaSuggestions)
        .catch(() => setEmpresaSuggestions([]));
    }, 300);
  };

  const handleEmpresaChange = (text) => {
    const limpio = sanitizeName(text);
    setEmpresa(limpio);
    setShowEmpresaSuggestions(true);
    buscarEmpresas(limpio);
    if (errors.empresa) setErrors((prev) => ({ ...prev, empresa: undefined }));
  };

  const seleccionarEmpresa = (nombre) => {
    setEmpresa(nombre);
    setShowEmpresaSuggestions(false);
    setEmpresaSuggestions([]);
  };

  const handleEmpresaBlur = () => {
    setFocusedInput(null);
    setTimeout(() => setShowEmpresaSuggestions(false), 150);
  };

  const validate = () => {
    const next = {};
    if (!empresa.trim()) next.empresa = 'La empresa es obligatoria';
    if (!representante.trim()) next.representante = 'El representante es obligatorio';
    if (!motivo.trim()) next.motivo = 'El motivo de visita es obligatorio';
    if (!contacto.trim()) next.contacto = 'La persona de contacto es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('pisoSeleccionado', pisoSeleccionado);
      formData.append('areaSeleccionada', areaSeleccionada);
      formData.append('empresa', empresa);
      formData.append('representante', representante);
      formData.append('motivo', motivo);
      formData.append('contacto', contacto);

      if (proveedorPhoto) {
        if (Platform.OS === 'web') {
          const blob = await fetch(proveedorPhoto).then(r => r.blob());
          formData.append('foto_persona', blob, 'proveedor.jpg');
        } else {
          formData.append('foto_persona', {
            uri: proveedorPhoto,
            name: 'proveedor.jpg',
            type: 'image/jpeg',
          });
        }
      }

      if (idPhoto) {
        if (Platform.OS === 'web') {
          const blob = await fetch(idPhoto).then(r => r.blob());
          formData.append('foto_ine', blob, 'ine.jpg');
        } else {
          formData.append('foto_ine', {
            uri: idPhoto,
            name: 'ine.jpg',
            type: 'image/jpeg',
          });
        }
      }

      const response = await fetch(`${API_URL}/api/proveedores`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: '/proveedor-exito',
          params: {
            pisoSeleccionado,
            areaSeleccionada,
            empresa,
            representante,
            folio: data.folio,
          },
        });
      } else {
        Alert.alert('Error', data.mensaje || 'Error al registrar.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No hay conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (id, label, placeholder, value, setValue, nameOnly = false) => (
    <View style={[s.inputContainer, { width: itemWidth }]}>
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
          <Text style={s.hintText}>Solo letras, sin números</Text>
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
              
              {/* Header Responsivo */}
              <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
                <TouchableOpacity onPress={() => router.back()} style={s.backButton} disabled={isLoading}>
                  <Ionicons name="chevron-back" size={22 * scale} color={COLORS.periwinkle} />
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

              {/* Body Responsivo */}
              <View style={[s.bottomSection, (isLandscape || isTablet) && s.bottomSectionLandscape]}>
                
                <View style={s.locationCard}>
                  <Ionicons name="location" size={24 * scale} color={COLORS.royalBlue} />
                  <View style={{ marginLeft: 12 * scale, flex: 1 }}>
                    <Text style={s.locationTitle}>Ubicación seleccionada</Text>
                    <Text style={s.locationSubtitle}>{pisoSeleccionado} — {areaSeleccionada}</Text>
                  </View>
                </View>

                {/* Formulario que cambia a Grid si detecta tablet o landscape */}
                <View style={[s.formContainer, useTwoColumns && s.formContainerGrid]}>
                  
                  {/* Bloque Empresa (Ancho dinámico) */}
                  <View style={[s.inputContainer, { width: itemWidth }]}>
                    <Text style={s.inputLabel}>EMPRESA / PROVEEDOR *</Text>
                    <AutocompleteInput
                      scale={scale}
                      wrapperStyle={{ zIndex: 30 }}
                      inputStyle={[s.textInput, focusedInput === 'empresa' && s.textInputFocused, errors.empresa && s.textInputError]}
                      placeholder="Nombre de la empresa"
                      placeholderTextColor="#9ca3af"
                      value={empresa}
                      onChangeText={handleEmpresaChange}
                      onFocus={() => { setFocusedInput('empresa'); setShowEmpresaSuggestions(true); }}
                      onBlur={handleEmpresaBlur}
                      suggestions={empresaSuggestions}
                      showSuggestions={showEmpresaSuggestions}
                      onSelectSuggestion={seleccionarEmpresa}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                    {!errors.empresa ? (
                      <View style={s.hintRow}>
                        <Ionicons name="information-circle-outline" size={13 * scale} color={COLORS.silver} />
                        <Text style={s.hintText}>Solo letras, sin números</Text>
                      </View>
                    ) : null}
                    {errors.empresa ? <Text style={s.errorText}>{errors.empresa}</Text> : null}
                  </View>
                  
                  {renderInput('representante', 'REPRESENTANTE *', 'Nombre completo', representante, setRepresentante, true)}
                  {renderInput('motivo', 'MOTIVO DE VISITA *', 'Descripción del motivo', motivo, setMotivo)}
                  {renderInput('contacto', 'PERSONA DE CONTACTO *', 'Nombre del contacto interno', contacto, setContacto, true)}
                </View>

                {/* Botón de Enviar acoplado de forma óptima */}
                <View style={s.buttonWrapper}>
                  <TouchableOpacity
                    style={[s.registerButton, isLoading && s.registerButtonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={s.registerText}>
                      {isLoading ? 'Guardando...' : 'Registrar Entrada'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
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
      paddingBottom: 28 * scale, 
      borderBottomLeftRadius: 28, 
      borderBottomRightRadius: 28 
    },
    headerLandscape: { paddingHorizontal: 48 * scale },
    
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 * scale },
    backText: { color: COLORS.periwinkle, fontSize: 15 * scale, marginLeft: 2 },
    stepTitle: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5 },
    mainTitle: { color: COLORS.white, fontSize: 28 * scale, fontWeight: 'bold', marginTop: 6 },
    
    stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 * scale },
    stepCompleted: { backgroundColor: COLORS.royalBlue, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepActive: { backgroundColor: COLORS.royalBlue, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepInactive: { borderColor: 'rgba(255,255,255,0.25)', borderWidth: 2, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepTextActive: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 * scale },
    stepTextInactive: { color: COLORS.periwinkle, fontWeight: 'bold', fontSize: 14 * scale },
    stepLine: { width: 32 * scale, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
    stepLineActive: { width: 32 * scale, height: 2, backgroundColor: COLORS.royalBlue },
    stepLabels: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 26 * scale },
    labelActive: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '600' },
    labelInactive: { color: COLORS.periwinkle, fontSize: 12 * scale },
    
    bottomSection: { flex: 1, paddingHorizontal: 28 * scale, paddingTop: 24 * scale, paddingBottom: 24 * scale, justifyContent: 'space-between' },
    bottomSectionLandscape: { paddingHorizontal: 48 * scale },
    
    locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.royalBlueSoft, padding: 16 * scale, borderRadius: 16, marginBottom: 24 * scale },
    locationTitle: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1 },
    locationSubtitle: { color: COLORS.palatinateBlue, fontSize: 16 * scale, fontWeight: 'bold', marginTop: 2 },
    
    // --- ESTILO DE FORMULARIO RESPONSIVO (FLEX-WRAP) ---
    formContainer: { 
      flexDirection: 'column', 
      gap: 20 * scale, 
      marginBottom: 32 * scale 
    },
    formContainerGrid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between' 
    },
    
    inputContainer: { gap: 8 * scale },
    inputLabel: { color: '#6b7280', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1 },
    textInput: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16 * scale, paddingVertical: 14 * scale, fontSize: 16 * scale, color: '#111827' },
    textInputFocused: { borderColor: COLORS.royalBlue, backgroundColor: '#ffffff' },
    textInputError: { borderColor: COLORS.brandRed },
    errorText: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: '600', marginTop: 6 * scale },
    hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 * scale },
    hintText: { color: COLORS.silver, fontSize: 11 * scale, fontStyle: 'italic' },
    
    buttonWrapper: { width: '100%', alignItems: 'center', marginTop: 8 * scale },
    registerButton: { backgroundColor: COLORS.royalBlue, padding: 18 * scale, borderRadius: 16, alignItems: 'center', width: '100%' },
    registerButtonDisabled: { backgroundColor: COLORS.silver },
    registerText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });
