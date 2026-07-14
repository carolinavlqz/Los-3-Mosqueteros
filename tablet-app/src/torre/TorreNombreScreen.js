import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { sanitizeName } from '../utils/validators';
import PresentesWatermark from './PresentesWatermark';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TorreNombreScreen() {
  const router = useRouter();
  const { tipo, piso, consultorio, foto } = useLocalSearchParams();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 560 });
  const s = createStyles(scale);

  const [presentes, setPresentes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/torre/activos?piso=${encodeURIComponent(piso)}`)
      .then((res) => res.json())
      .then((data) => setPresentes(data.map((p) => ({ ...p, activo: true }))))
      .catch(() => setPresentes([]));
  }, [piso]);

  const handleAceptar = async () => {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('tipo', tipo);
      formData.append('piso', piso);
      formData.append('consultorio', consultorio);
      formData.append('nombre', nombre);

      if (foto) {
        if (Platform.OS === 'web') {
          const blob = await fetch(foto).then((r) => r.blob());
          formData.append('foto_persona', blob, 'visitante.jpg');
        } else {
          formData.append('foto_persona', { uri: foto, name: 'visitante.jpg', type: 'image/jpeg' });
        }
      }

      const response = await fetch(`${API_URL}/api/torre/registro`, { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert('Error', data.mensaje || 'No se pudo registrar la entrada.');
        return;
      }

      router.push({
        pathname: '/torre/exito',
        params: { tipo, piso, consultorio, foto, nombre, folio: data.folio, id: data.id },
      });
    } catch (err) {
      Alert.alert('Error', 'No hay conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
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
          <Text style={s.headerTitle}>Datos del Visitante</Text>
        </View>
      </LinearGradient>
      {/* ===== FIN HEADER ===== */}

      <View style={s.body}>
        <PresentesWatermark presentes={presentes} scale={scale} />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={s.outerContainer}>
              <View style={[s.container, { width: contentWidth }]}>
                <View style={s.card}>
                  <Text style={s.instructionText}>Consultorio {consultorio}</Text>
                  <Text style={s.question}>¿Cuál es su nombre?</Text>

                  <TextInput
                    style={[s.textInput, error && s.textInputError]}
                    placeholder="Nombre completo"
                    placeholderTextColor={COLORS.silver}
                    value={nombre}
                    onChangeText={(text) => {
                      setNombre(sanitizeName(text));
                      if (error) setError('');
                    }}
                    autoCapitalize="words"
                    autoFocus
                  />
                  {error ? <Text style={s.errorText}>{error}</Text> : null}

                  <View style={s.actionsRow}>
                    <TouchableOpacity
                      style={s.cancelButton}
                      onPress={() => router.back()}
                      activeOpacity={0.7}
                      disabled={isSubmitting}
                    >
                      <Text style={s.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.acceptButton, isSubmitting && s.acceptButtonDisabled]}
                      onPress={handleAceptar}
                      activeOpacity={0.85}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <Text style={s.acceptText}>Aceptar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },

    header: {
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 28 * scale,
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
      marginBottom: 24 * scale,
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
    headerTitle: { color: COLORS.white, fontSize: 26 * scale, fontWeight: 'bold' },

    body: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: {
      flex: 1,
      paddingHorizontal: 24 * scale,
      paddingTop: 28 * scale,
      paddingBottom: 28 * scale,
      justifyContent: 'center',
    },

    card: {
      backgroundColor: COLORS.white,
      borderRadius: 20,
      padding: 24 * scale,
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    instructionText: {
      textAlign: 'center',
      color: COLORS.silver,
      fontSize: 13 * scale,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 8 * scale,
    },
    question: {
      textAlign: 'center',
      color: COLORS.palatinateBlue,
      fontSize: 20 * scale,
      fontWeight: 'bold',
      marginBottom: 20 * scale,
    },

    textInput: {
      backgroundColor: '#f9fafb',
      borderWidth: 2,
      borderColor: '#e5e7eb',
      borderRadius: 14,
      paddingHorizontal: 16 * scale,
      paddingVertical: 14 * scale,
      fontSize: 16 * scale,
      color: COLORS.palatinateBlue,
      textAlign: 'center',
    },
    textInputError: { borderColor: COLORS.brandRed },
    errorText: {
      color: COLORS.brandRed,
      fontSize: 12 * scale,
      fontWeight: '600',
      marginTop: 8 * scale,
      textAlign: 'center',
    },

    actionsRow: { flexDirection: 'row', gap: 12 * scale, marginTop: 24 * scale },
    cancelButton: {
      flex: 1,
      paddingVertical: 16 * scale,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: COLORS.royalBlueSoft,
    },
    cancelText: { color: COLORS.royalBlue, fontSize: 16 * scale, fontWeight: 'bold' },
    acceptButton: {
      flex: 1,
      paddingVertical: 16 * scale,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.royalBlue,
    },
    acceptButtonDisabled: { backgroundColor: COLORS.silver },
    acceptText: { color: COLORS.white, fontSize: 16 * scale, fontWeight: 'bold' },
  });
