import React from 'react';
import { useRouter } from 'expo-router';
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
const MAX_CONTENT_WIDTH_TABLET = 950; // Ajustado óptimamente para contener las 3 tarjetas de lado a lado

function useScale() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= TABLET_BREAKPOINT;

  const contentWidth = isTablet
    ? Math.min(width * 0.95, MAX_CONTENT_WIDTH_TABLET)
    : Math.min(width, MAX_CONTENT_WIDTH_PHONE);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.15));

  // Las tarjetas van en fila (lado a lado) si hay espacio suficiente
  const useRowLayout = isTablet || isLandscape;

  return { isLandscape, isTablet, contentWidth, scale, useRowLayout };
}

export default function TipoVisitaScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale, useRowLayout } = useScale();
  const s = createStyles(scale);

  // Componente para las "píldoras" o tags de requerimientos
  const RequirementTag = ({ text, theme }) => {
    let bgStyle = s.tagPostulanteBg;
    let textStyle = s.tagPostulanteText;

    if (theme === 'familiar') {
      bgStyle = s.tagFamiliarBg;
      textStyle = s.tagFamiliarText;
    } else if (theme === 'ex-empleado') {
      bgStyle = s.tagExEmpleadoBg;
      textStyle = s.tagExEmpleadoText;
    }

    return (
      <View style={[s.tag, bgStyle]}>
        <Text style={[s.tagText, textStyle]}>
          {text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a355b" />

      <ScrollView 
        contentContainerStyle={s.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            
            {/* Header */}
            <View style={[s.header, (isLandscape || isTablet) && s.headerLandscape]}>
              <View style={s.headerTopRow}>
                <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
                  <Ionicons name="chevron-back" size={22 * scale} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton}>
                  <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <Text style={s.headerSubtitle}>CHECK IN · VISITAS</Text>
              <Text style={s.headerTitle}>Tipo de Visita</Text>
            </View>

            {/* Body */}
            <View style={[s.bottomSection, (isLandscape || isTablet) && s.bottomSectionLandscape]}>
              <Text style={s.instructionText}>
                Selecciona la categoría de la persona visitante.
              </Text>

              <View style={[s.cardsContainer, useRowLayout && s.cardsContainerRow]}>
                
                {/* TARJETA 1: FAMILIAR */}
                <TouchableOpacity 
                  style={[s.card, useRowLayout && s.cardRow]} 
                  activeOpacity={0.9}
                  onPress={() => router.push('/familiar-form')} 
                >
                  <View style={[s.cardHeaderBg, { backgroundColor: '#f0f4f8' }]}>
                    <View style={s.cardHeaderContent}>
                      <View style={[s.iconBox, { backgroundColor: '#1e3a68' }]}>
                        <Ionicons name="heart-outline" size={30 * scale} color="#ffffff" />
                      </View>
                      <View style={s.cardTitleContainer}>
                        <Text style={[s.cardTitle, { color: '#1e3a68' }]}>Familiar</Text>
                        <Text style={[s.cardSubtitle, { color: '#4b6b9e' }]}>Visita a paciente</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={s.cardBody}>
                    <Text style={s.cardDescription}>
                      Para familiares o acompañantes de pacientes internados. Se solicitará habitación, paciente y datos personales.
                    </Text>
                    <View style={s.tagsContainer}>
                      <RequirementTag text="Foto" theme="familiar" />
                      <RequirementTag text="Identificación" theme="familiar" />
                      <RequirementTag text="Habitación" theme="familiar" />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* TARJETA 2: POSTULANTE */}
                <TouchableOpacity 
                  style={[s.card, useRowLayout && s.cardRow]} 
                  activeOpacity={0.9}
                  onPress={() => router.push('/postulante-form')}
                >
                  <View style={[s.cardHeaderBg, { backgroundColor: '#fef3c7' }]}>
                    <View style={s.cardHeaderContent}>
                      <View style={[s.iconBox, { backgroundColor: '#d97706' }]}>
                        <Ionicons name="briefcase-outline" size={30 * scale} color="#ffffff" />
                      </View>
                      <View style={s.cardTitleContainer}>
                        <Text style={[s.cardTitle, { color: '#92400e' }]}>Postulante</Text>
                        <Text style={[s.cardSubtitle, { color: '#b45309' }]}>Candidato de RH</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={s.cardBody}>
                    <Text style={s.cardDescription}>
                      Para candidatos en entrevistas o trámites de RH. Se registrará puesto, departamento y personal que atiende.
                    </Text>
                    <View style={s.tagsContainer}>
                      <RequirementTag text="Foto" theme="postulante" />
                      <RequirementTag text="Identificación" theme="postulante" />
                      <RequirementTag text="Puesto" theme="postulante" />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* TARJETA 3: EX EMPLEADO */}
                <TouchableOpacity 
                  style={[s.card, useRowLayout && s.cardRow]} 
                  activeOpacity={0.9}
                  onPress={() => router.push('/ex-empleado-form')}
                >
                  <View style={[s.cardHeaderBg, { backgroundColor: '#fee2e2' }]}>
                    <View style={s.cardHeaderContent}>
                      <View style={[s.iconBox, { backgroundColor: '#ef4444' }]}>
                        <Ionicons name="person-remove-outline" size={30 * scale} color="#ffffff" />
                      </View>
                      <View style={s.cardTitleContainer}>
                        <Text style={[s.cardTitle, { color: '#991b1b' }]}>Ex Empleado</Text>
                        <Text style={[s.cardSubtitle, { color: '#b91c1c' }]}>Trámites Administrativos</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={s.cardBody}>
                    <Text style={s.cardDescription}>
                      Para ex colaboradores que asisten para su firma, entrega o aclaración de finiquito corporativo en el área administrativa.
                    </Text>
                    <View style={s.tagsContainer}>
                      <RequirementTag text="Foto" theme="ex-empleado" />
                      <RequirementTag text="Identificación" theme="ex-empleado" />
                      <RequirementTag text="Finiquito" theme="ex-empleado" />
                    </View>
                  </View>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
      backgroundColor: '#1a355b',
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 20,
      paddingBottom: 28 * scale,
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
      alignItems: 'center',
      marginBottom: 20 * scale,
    },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 44 * scale,
      height: 44 * scale,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSubtitle: { 
      color: '#8ba4c9', 
      fontSize: 12 * scale, 
      fontWeight: '700', 
      letterSpacing: 1.5, 
      marginBottom: 4 
    },
    headerTitle: { 
      color: '#ffffff', 
      fontSize: 26 * scale, 
      fontWeight: 'bold' 
    },

    bottomSection: { 
      flex: 1, 
      paddingHorizontal: 24 * scale, 
      paddingTop: 24 * scale, 
      paddingBottom: 40 * scale 
    },
    bottomSectionLandscape: {
      paddingHorizontal: 48 * scale
    },
    instructionText: { 
      color: '#4b5563', 
      fontSize: 15 * scale, 
      marginBottom: 24 * scale,
      lineHeight: 22 * scale 
    },

    cardsContainer: { 
      gap: 16 * scale 
    },
    cardsContainerRow: { 
      flexDirection: 'row', 
      alignItems: 'stretch' 
    },

    card: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
      overflow: 'hidden',
    },
    cardRow: { 
      flex: 1 
    },

    cardHeaderBg: { 
      padding: 18 * scale, 
      borderBottomWidth: 1, 
      borderColor: 'rgba(0,0,0,0.05)' 
    },
    cardHeaderContent: { 
      flexDirection: 'row', 
      alignItems: 'center' 
    },
    iconBox: {
      width: 54 * scale,
      height: 54 * scale,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16 * scale,
    },
    cardTitleContainer: { 
      flex: 1 
    },
    cardTitle: { 
      fontSize: 20 * scale, 
      fontWeight: 'bold', 
      marginBottom: 2 * scale 
    },
    cardSubtitle: { 
      fontSize: 12 * scale, 
      fontWeight: '600' 
    },

    cardBody: { 
      padding: 18 * scale,
      flex: 1,
      justifyContent: 'space-between'
    },
    cardDescription: { 
      color: '#6b7280', 
      fontSize: 13.5 * scale, 
      lineHeight: 20 * scale, 
      marginBottom: 16 * scale 
    },
    
    tagsContainer: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 8 * scale 
    },
    tag: { 
      paddingHorizontal: 10 * scale, 
      paddingVertical: 5 * scale, 
      borderRadius: 20 
    },
    tagText: {
      fontSize: 11 * scale, 
      fontWeight: 'bold'
    },
    
    // Temas para las píldoras
    tagFamiliarBg: { backgroundColor: '#e0e7ff' },
    tagFamiliarText: { color: '#3730a3' },
    
    tagPostulanteBg: { backgroundColor: '#fef3c7' },
    tagPostulanteText: { color: '#92400e' },

    tagExEmpleadoBg: { backgroundColor: '#fee2e2' },
    tagExEmpleadoText: { color: '#991b1b' },
  });
