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

const AREAS_POR_PISO = {
  'Sótano': [
    'TALLER MANTENIMIENTO', 'ROPERIA'
  ],
  'Planta Baja': [
    'CAFETERÍA', 'ADMINISTRACION CAFETERIA', 'AUXILIAR DE CAFETERIA',
    'VINCULACION MEDICA', 'EJECUTIVO DE VENTAS', 'VALLET PARKING',
    'AUXILIAR DE OPERACIONES', 'FARMACIA', 'ALMACEN GENERAL',
    'URGENCIAS', 'INHALOTERAPIA', 'CORTA ESTANCIA', 'COCINA', 'CAJAS',
    'ADMISIÓN', 'BIOMEDICA', 'HEMODINAMIA', 'IMAGENOLOGIA',
    'DIRECCION ADMINISTRATIVA'
  ],
  'Piso 1': [
    'CUNEROS', 'UCIN', 'CAPTURA', 'QUIROFANOS', 'UTIA', 'CEYE', 'HIGIENE'
  ],
  'Piso 2': [
    'SUPERVISIÓN ENFERMERIA', 'CIBERSEGURIDAD', 'CONTRALORIA', 'DIR GRAL',
    'NUTRICIÓN', 'EPIDEMIOLOGIA', 'HOSPITALIZACION'
  ],
  'Piso 3': [
    'CONTABILIDAD', 'RH', 'HOSPITALIZACION', 'SISTEMAS', 'INVENTARIOS', 'MANTENIMIENTO'
  ],
  'Piso 4': [
    'BANCO SANGRE', 'ARCHIVO CLINICO'
  ]
};

export default function AreaScreen() {
  const router = useRouter();
  const { pisoSeleccionado } = useLocalSearchParams();
  const { isLandscape, isTablet, contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [selectedArea, setSelectedArea] = useState(null);

  const areasDisponibles = AREAS_POR_PISO[pisoSeleccionado] || [];

  const handleContinue = () => {
    if (!selectedArea) return;
    router.push({
      pathname: '/proveedor-datos',
      params: { 
        pisoSeleccionado: pisoSeleccionado,
        areaSeleccionada: selectedArea 
      }
    });
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a355b" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            
            {/* Header */}
            <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
              <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
                <Ionicons name="chevron-back" size={22 * scale} color="#8ba4c9" />
                <Text style={s.backText}>Regresar</Text>
              </TouchableOpacity>
              <Text style={s.stepTitle}>REGISTRO — PROVEEDOR</Text>
              <Text style={s.mainTitle}>Área</Text>

              {/* Stepper Actualizado para el Paso 3 */}
              <View style={s.stepper}>
                <View style={s.stepCompleted}>
                  <Ionicons name="checkmark" size={20 * scale} color="#ffffff" />
                </View>
                <View style={s.stepLineActive} />
                <View style={s.stepCompleted}>
                  <Ionicons name="checkmark" size={20 * scale} color="#ffffff" />
                </View>
                <View style={s.stepLineActive} />
                <View style={s.stepActive}>
                  <Text style={s.stepTextActive}>3</Text>
                </View>
                <View style={s.stepLine} />
                <View style={s.stepInactive}>
                  <Text style={s.stepTextInactive}>4</Text>
                </View>
              </View>
              <View style={s.stepLabels}>
                <Text style={s.labelInactive}>Fotos</Text>
                <Text style={s.labelInactive}>Piso</Text>
                <Text style={s.labelActive}>Área</Text>
                <Text style={s.labelInactive}>Datos</Text>
              </View>
            </View>

            {/* Body */}
            <View style={[s.bottomSection, (isLandscape || isTablet) && s.bottomSectionLandscape]}>
              
              {/* Indicador del Piso Seleccionado */}
              <View style={s.locationIndicator}>
                <Ionicons name="location-outline" size={20 * scale} color="#00a884" />
                <Text style={s.locationText}>{pisoSeleccionado || 'Piso no seleccionado'}</Text>
              </View>

              {/* Grid de Áreas */}
              <View style={s.gridContainer}>
                {areasDisponibles.map((area, index) => {
                  const isSelected = selectedArea === area;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[s.card, isSelected && s.cardSelected]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedArea(area)}
                    >
                      <Text style={[s.cardName, isSelected && s.textSelected]}>{area}</Text>
                      
                      {isSelected && (
                        <View style={s.checkIconContainer}>
                          <Ionicons name="checkmark" size={18 * scale} color="#00a884" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[s.continueButton, !selectedArea && s.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={!selectedArea}
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
      backgroundColor: '#1a355b',
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 28 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
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

    locationIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 * scale },
    locationText: { color: '#00a884', fontSize: 15 * scale, fontWeight: 'bold', marginLeft: 6 },

    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12 * scale,
      marginBottom: 32 * scale,
    },
    card: {
      backgroundColor: '#ffffff',
      width: '48%',
      paddingVertical: 20 * scale,
      paddingHorizontal: 16 * scale,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
      justifyContent: 'center',
    },
    cardSelected: {
      borderColor: '#00a884',
      backgroundColor: '#e6f7f4',
    },
    cardName: { color: '#1e3a68', fontSize: 14 * scale, fontWeight: '700' },
    textSelected: { color: '#0fa38b' },
    checkIconContainer: { position: 'absolute', bottom: 12 * scale, right: 12 * scale },

    continueButton: { backgroundColor: '#00a884', padding: 18 * scale, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    continueButtonDisabled: { backgroundColor: '#a7c4b9' },
    continueText: { color: '#ffffff', fontSize: 17 * scale, fontWeight: 'bold' },
  });