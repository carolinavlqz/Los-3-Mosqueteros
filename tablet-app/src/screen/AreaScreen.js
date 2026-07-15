import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

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
  const { pisoSeleccionado, proveedorPhoto, idPhoto } = useLocalSearchParams();
  
  // Extraemos las propiedades de adaptabilidad de tu hook useScale
  const { isLandscape, isTablet, contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [selectedArea, setSelectedArea] = useState(null);
  const areasDisponibles = AREAS_POR_PISO[pisoSeleccionado] || [];

  // --- CÁLCULO DE COLUMNAS RESPONSIVAS ---
  // Decidimos cuántas columnas usar según el dispositivo y orientación
  const numColumns = isTablet ? (isLandscape ? 4 : 3) : (isLandscape ? 3 : 2);
  const gapSize = 12 * scale;
  
  // Calculamos el ancho de cada tarjeta restando los espacios (gaps) del ancho total del contenedor
  const totalGapsSpace = gapSize * (numColumns - 1);
  const cardWidth = (contentWidth - totalGapsSpace) / numColumns;

  const handleContinue = () => {
    if (!selectedArea) return;
    router.push({
      pathname: '/proveedor-datos',
      params: { 
        pisoSeleccionado: pisoSeleccionado,
        areaSeleccionada: selectedArea,
        proveedorPhoto, 
        idPhoto 
      }
    });
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            
            {/* Header */}
            <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
              <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
                <Ionicons name="chevron-back" size={22 * scale} color={COLORS.periwinkle} />
                <Text style={s.backText}>Regresar</Text>
              </TouchableOpacity>
              <Text style={s.stepTitle}>REGISTRO — PROVEEDOR</Text>
              <Text style={s.mainTitle}>Área</Text>

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
              
              <View>
                {/* Indicador del Piso Seleccionado */}
                <View style={s.locationIndicator}>
                  <Ionicons name="location-outline" size={20 * scale} color={COLORS.royalBlue} />
                  <Text style={s.locationText}>{pisoSeleccionado || 'Piso no seleccionado'}</Text>
                </View>

                {/* Grid de Áreas Autoadaptable */}
                <View style={[s.gridContainer, { gap: gapSize }]}>
                  {areasDisponibles.map((area, index) => {
                    const isSelected = selectedArea === area;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          s.card, 
                          { width: cardWidth }, // Aplicamos el ancho calculado dinámicamente
                          isSelected && s.cardSelected
                        ]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedArea(area)}
                      >
                        <Text 
                          style={[s.cardName, isSelected && s.textSelected]}
                          numberOfLines={2} 
                          adjustsFontSizeToFit // En iOS reducirá ligeramente el tamaño de la fuente si es muy largo
                        >
                          {area}
                        </Text>
                        
                        {isSelected && (
                          <View style={s.checkIconContainer}>
                            <Ionicons name="checkmark" size={16 * scale} color={COLORS.royalBlue} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
      backgroundColor: COLORS.palatinateBlue,
      paddingHorizontal: 24 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 28 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerLandscape: { paddingHorizontal: 32 * scale },
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

    // Ajustado padding horizontal para ganar espacio en pantallas pequeñas
    bottomSection: { flex: 1, paddingHorizontal: 16 * scale, paddingTop: 24 * scale, paddingBottom: 24 * scale, justifyContent: 'space-between' },
    bottomSectionLandscape: { paddingHorizontal: 32 * scale },

    locationIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 * scale },
    locationText: { color: COLORS.royalBlue, fontSize: 15 * scale, fontWeight: 'bold', marginLeft: 6 },

    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start', // Cambio a flex-start para alineaciones perfectas con anchos calculados
      marginBottom: 32 * scale,
    },
    card: {
      backgroundColor: '#ffffff',
      paddingVertical: 18 * scale,
      paddingHorizontal: 12 * scale,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
      justifyContent: 'center',
      minHeight: 85 * scale, // Evita que tarjetas con textos cortos queden de menor altura que las de textos largos
    },
    cardSelected: {
      borderColor: COLORS.royalBlue,
      backgroundColor: COLORS.royalBlueSoft,
    },
    cardName: { 
      color: COLORS.palatinateBlue, 
      fontSize: 13 * scale, // Bajado ligeramente a 13 para prevenir cortes extremos
      fontWeight: '700', 
      textAlign: 'center' 
    },
    textSelected: { color: COLORS.royalBlue },
    checkIconContainer: { position: 'absolute', top: 6 * scale, right: 6 * scale }, // Movido arriba para dar más espacio al texto abajo

    continueButton: { backgroundColor: COLORS.royalBlue, padding: 18 * scale, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    continueButtonDisabled: { backgroundColor: COLORS.silver },
    continueText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });
