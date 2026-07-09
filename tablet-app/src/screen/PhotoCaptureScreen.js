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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

export default function PhotoCaptureScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale, useRowLayout } = useScale();
  const s = createStyles(scale);

  const [proveedorPhoto, setProveedorPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [loadingField, setLoadingField] = useState(null);

  const canContinue = !!proveedorPhoto;

  const capturePhoto = async (field) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la cámara para tomar la fotografía. Actívalo en los ajustes de la app.'
        );
        return;
      }

      setLoadingField(field);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (field === 'proveedor') setProveedorPhoto(uri);
        else setIdPhoto(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara. Intenta de nuevo.');
    } finally {
      setLoadingField(null);
    }
  };

  const handleContinue = () => {
    if (!canContinue) return;
    
    // --- AQUÍ EL CAMBIO CLAVE ---
    // Pasamos las fotos a la siguiente pantalla
    router.push({
      pathname: '/proveedor-piso',
      params: { 
        proveedorPhoto: proveedorPhoto, 
        idPhoto: idPhoto 
      }
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
          <View style={s.retakeBadge}>
            <Ionicons name="camera-reverse-outline" size={16 * scale} color="#ffffff" />
          </View>
          <View style={s.checkBadge}>
            <Ionicons name="checkmark" size={14 * scale} color="#ffffff" />
          </View>
        </>
      ) : (
        <>
          <View style={s.cameraIconCircle}>
            <Ionicons name="camera-outline" size={28 * scale} color={COLORS.palatinateBlue} />
          </View>
          <Text style={s.captureLabel}>{label}</Text>
          <Text style={s.captureHint}>
            {loadingField === field ? 'Abriendo cámara…' : 'Toque para capturar'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>
          {/* Header */}
          <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
            <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
              <Ionicons name="chevron-back" size={22 * scale} color={COLORS.periwinkle} />
              <Text style={s.backText}>Regresar</Text>
            </TouchableOpacity>
            <Text style={s.stepTitle}>REGISTRO — PROVEEDOR</Text>
            <Text style={s.mainTitle}>Fotos</Text>

            {/* Stepper */}
            <View style={s.stepper}>
              <View style={s.stepActive}>
                <Text style={s.stepTextActive}>1</Text>
              </View>
              <View style={s.stepLine} />
              <View style={s.stepInactive}>
                <Text style={s.stepTextInactive}>2</Text>
              </View>
              <View style={s.stepLine} />
              <View style={s.stepInactive}>
                <Text style={s.stepTextInactive}>3</Text>
              </View>
              <View style={s.stepLine} />
              <View style={s.stepInactive}>
                <Text style={s.stepTextInactive}>4</Text>
              </View>
            </View>
            <View style={s.stepLabels}>
              <Text style={s.labelActive}>Fotos</Text>
              <Text style={s.labelInactive}>Piso</Text>
              <Text style={s.labelInactive}>Área</Text>
              <Text style={s.labelInactive}>Datos</Text>
            </View>
          </View>

          {/* Body */}
          <View style={[s.bottomSection, (isLandscape || isTablet) && s.bottomSectionLandscape]}>
            <View style={[s.captureContainer, useRowLayout && s.captureContainerRow]}>
              {renderCaptureBox('proveedor', proveedorPhoto, 'Foto del proveedor *')}
              {renderCaptureBox('id', idPhoto, 'Identificación oficial (opcional)')}
            </View>

            <Text style={s.footerInstruction}>
              {canContinue
                ? 'Foto del proveedor capturada'
                : 'La foto del proveedor es requerida para continuar'}
            </Text>

            <TouchableOpacity
              style={[s.continueButton, !canContinue && s.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.85}
            >
              <Text style={s.continueText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
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
      borderBottomRightRadius: 28,
    },
    headerLandscape: { paddingHorizontal: 48 * scale },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 * scale },
    backText: { color: COLORS.periwinkle, fontSize: 15 * scale, marginLeft: 2 },
    stepTitle: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5 },
    mainTitle: { color: COLORS.white, fontSize: 28 * scale, fontWeight: 'bold', marginTop: 6 },

    stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 * scale },
    stepActive: { backgroundColor: COLORS.royalBlue, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepInactive: { borderColor: 'rgba(255,255,255,0.25)', borderWidth: 2, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, justifyContent: 'center', alignItems: 'center' },
    stepTextActive: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 * scale },
    stepTextInactive: { color: COLORS.periwinkle, fontWeight: 'bold', fontSize: 14 * scale },
    stepLine: { width: 32 * scale, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' },

    stepLabels: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 26 * scale },
    labelActive: { color: COLORS.royalBlue, fontSize: 12 * scale, fontWeight: '600' },
    labelInactive: { color: COLORS.periwinkle, fontSize: 12 * scale },

    bottomSection: { flex: 1, paddingHorizontal: 28 * scale, paddingTop: 28 * scale, paddingBottom: 24 * scale, justifyContent: 'space-between' },
    bottomSectionLandscape: { paddingHorizontal: 48 * scale },
    captureContainer: { gap: 16 * scale },
    captureContainerRow: { flexDirection: 'row' },
    captureBox: { aspectRatio: 1, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
    captureBoxFilled: { borderStyle: 'solid', borderColor: COLORS.royalBlue },
    captureBoxRow: { flex: 1 },
    cameraIconCircle: { width: 56 * scale, height: 56 * scale, borderRadius: 28 * scale, backgroundColor: COLORS.royalBlueSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 * scale },
    captureLabel: { color: COLORS.palatinateBlue, marginTop: 4, fontWeight: 'bold', fontSize: 14 * scale },
    captureHint: { color: '#9ca3af', fontSize: 12 * scale, marginTop: 4 },
    capturedImage: { width: '100%', height: '100%' },
    retakeBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(3,30,93,0.85)', padding: 8, borderRadius: 20 },
    checkBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.royalBlue, padding: 5, borderRadius: 12 },
    footerInstruction: { textAlign: 'center', color: '#6b7280', fontSize: 13 * scale, marginVertical: 20 * scale },
    continueButton: { backgroundColor: COLORS.royalBlue, padding: 18 * scale, borderRadius: 16, alignItems: 'center' },
    continueButtonDisabled: { backgroundColor: COLORS.silver },
    continueText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });