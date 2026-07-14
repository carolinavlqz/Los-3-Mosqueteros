import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

export default function TorreFotoScreen() {
  const router = useRouter();
  const { tipo, piso, consultorio } = useLocalSearchParams();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 560 });
  const s = createStyles(scale);

  const [foto, setFoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para tomar la fotografía. Actívalo en los ajustes de la app.'
        );
        return;
      }

      setIsCapturing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara. Intenta de nuevo.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleContinuar = () => {
    if (!foto) return;
    router.push({ pathname: '/torre/nombre', params: { tipo, piso, consultorio, foto } });
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
          <Text style={s.headerTitle}>Foto de Acceso</Text>
        </View>
      </LinearGradient>
      {/* ===== FIN HEADER ===== */}

      <View style={s.body}>
        <ScrollView contentContainerStyle={s.scrollContent}>
          <View style={s.outerContainer}>
            <View style={[s.container, { width: contentWidth }]}>
              <View style={s.card}>
                <Text style={s.instructionText}>Consultorio {consultorio}</Text>

                <TouchableOpacity
                  style={[s.captureBox, foto && s.captureBoxFilled]}
                  activeOpacity={0.85}
                  onPress={capturarFoto}
                  disabled={isCapturing}
                >
                  {foto ? (
                    <>
                      <Image source={{ uri: foto }} style={s.capturedImage} />
                      <View style={s.retakeBadge}>
                        <Ionicons name="camera-reverse-outline" size={16 * scale} color={COLORS.white} />
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={s.cameraIconCircle}>
                        <Ionicons name="camera-outline" size={30 * scale} color={COLORS.palatinateBlue} />
                      </View>
                      <Text style={s.captureLabel}>Foto personal *</Text>
                      <Text style={s.captureHint}>
                        {isCapturing ? 'Abriendo cámara…' : 'Toque para capturar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.continueButton, !foto && s.continueButtonDisabled]}
                  onPress={handleContinuar}
                  disabled={!foto}
                  activeOpacity={0.85}
                >
                  <Text style={s.continueText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
      marginBottom: 20 * scale,
    },

    captureBox: {
      aspectRatio: 1,
      borderWidth: 2,
      borderColor: '#e2e8f0',
      borderStyle: 'dashed',
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      overflow: 'hidden',
      marginBottom: 24 * scale,
    },
    captureBoxFilled: { borderStyle: 'solid', borderColor: COLORS.royalBlue },
    cameraIconCircle: {
      width: 60 * scale,
      height: 60 * scale,
      borderRadius: 30 * scale,
      backgroundColor: COLORS.royalBlueSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12 * scale,
    },
    captureLabel: { color: COLORS.palatinateBlue, fontWeight: 'bold', fontSize: 15 * scale },
    captureHint: { color: COLORS.silver, fontSize: 12 * scale, marginTop: 4 },
    capturedImage: { width: '100%', height: '100%' },
    retakeBadge: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: 'rgba(3,30,93,0.85)',
      padding: 8,
      borderRadius: 20,
    },

    continueButton: { backgroundColor: COLORS.royalBlue, padding: 18 * scale, borderRadius: 16, alignItems: 'center' },
    continueButtonDisabled: { backgroundColor: COLORS.silver },
    continueText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });
