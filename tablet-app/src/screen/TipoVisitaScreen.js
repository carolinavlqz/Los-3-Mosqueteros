import React from 'react';
import { useRouter } from 'expo-router';
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

export default function TipoVisitaScreen() {
  const router = useRouter();
  const { contentWidth, scale, useRowLayout } = useScale();
  const s = createStyles(scale);

  // Componente para las "píldoras" o tags de requerimientos
  const RequirementTag = ({ text, theme }) => {
    const isFamiliar = theme === 'familiar';
    return (
      <View style={[s.tag, isFamiliar ? s.tagFamiliarBg : s.tagPostulanteBg]}>
        <Text style={[s.tagText, isFamiliar ? s.tagFamiliarText : s.tagPostulanteText]}>
          {text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            
            {/* Header */}
            <View style={s.header}>
              <View style={s.headerTopRow}>
                <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
                  <Ionicons name="chevron-back" size={24 * scale} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/')} style={s.iconButton}>
                  <Ionicons name="home-outline" size={20 * scale} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <Text style={s.headerSubtitle}>CHECK IN · VISITAS</Text>
              <Text style={s.headerTitle}>Tipo de Visita</Text>
            </View>

            {/* Body */}
            <View style={s.bottomSection}>
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
                  <View style={[s.cardHeaderBg, { backgroundColor: COLORS.royalBlueSoft }]}>
                    <View style={s.cardHeaderContent}>
                      <View style={[s.iconBox, { backgroundColor: COLORS.palatinateBlue }]}>
                        <Ionicons name="heart-outline" size={32 * scale} color={COLORS.white} />
                      </View>
                      <View style={s.cardTitleContainer}>
                        <Text style={[s.cardTitle, { color: COLORS.palatinateBlue }]}>Familiar</Text>
                        <Text style={[s.cardSubtitle, { color: COLORS.royalBlue }]}>Visita a paciente hospitalizado</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={s.cardBody}>
                    <Text style={s.cardDescription}>
                      Para familiares o acompañantes de pacientes internados. Se solicitará habitación, nombre del paciente y datos del visitante.
                    </Text>
                    <View style={s.tagsContainer}>
                      <RequirementTag text="Foto" theme="familiar" />
                      <RequirementTag text="Identificación" theme="familiar" />
                      <RequirementTag text="Habitación" theme="familiar" />
                      <RequirementTag text="Nombre del paciente" theme="familiar" />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* TARJETA 2: POSTULANTE */}
                <TouchableOpacity 
                  style={[s.card, useRowLayout && s.cardRow]} 
                  activeOpacity={0.9}
                  onPress={() => router.push('/postulante-form')}
                >
                  <View style={[s.cardHeaderBg, { backgroundColor: COLORS.brandRedSoft }]}>
                    <View style={s.cardHeaderContent}>
                      <View style={[s.iconBox, { backgroundColor: COLORS.brandRed }]}>
                        <Ionicons name="briefcase-outline" size={32 * scale} color={COLORS.white} />
                      </View>
                      <View style={s.cardTitleContainer}>
                        <Text style={[s.cardTitle, { color: COLORS.brandRed }]}>Postulante</Text>
                        <Text style={[s.cardSubtitle, { color: COLORS.palatinateBlue }]}>Candidato de Recursos Humanos</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={s.cardBody}>
                    <Text style={s.cardDescription}>
                      Para candidatos que acuden a entrevistas o trámites de RH. Se registrará el puesto al que aplica y la persona de RH que lo atiende.
                    </Text>
                    <View style={s.tagsContainer}>
                      <RequirementTag text="Foto" theme="postulante" />
                      <RequirementTag text="Identificación" theme="postulante" />
                      <RequirementTag text="Puesto" theme="postulante" />
                      <RequirementTag text="Contacto RH" theme="postulante" />
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
    safeArea: { flex: 1, backgroundColor: '#f4f6f9' },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1 },

    header: {
      backgroundColor: COLORS.palatinateBlue,
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 28 * scale,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24 * scale,
    },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 44 * scale,
      height: 44 * scale,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSubtitle: { color: COLORS.periwinkle, fontSize: 12 * scale, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { color: COLORS.white, fontSize: 26 * scale, fontWeight: 'bold' },

    bottomSection: { flex: 1, paddingHorizontal: 24 * scale, paddingTop: 24 * scale, paddingBottom: 32 * scale },
    instructionText: { color: '#4b5563', fontSize: 16 * scale, marginBottom: 24 * scale },

    cardsContainer: { gap: 20 * scale },
    cardsContainerRow: { flexDirection: 'row', alignItems: 'stretch' },

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
    cardRow: { flex: 1 },

    cardHeaderBg: { padding: 20 * scale, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    cardHeaderContent: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
      width: 56 * scale,
      height: 56 * scale,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16 * scale,
    },
    cardTitleContainer: { flex: 1 },
    cardTitle: { fontSize: 22 * scale, fontWeight: 'bold', marginBottom: 4 },
    cardSubtitle: { fontSize: 13 * scale, fontWeight: '600' },

    cardBody: { padding: 20 * scale },
    cardDescription: { color: '#6b7280', fontSize: 14 * scale, lineHeight: 22 * scale, marginBottom: 20 * scale },
    
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 * scale },
    tag: { paddingHorizontal: 12 * scale, paddingVertical: 6 * scale, borderRadius: 20 },
    
    // Temas para las píldoras
    tagFamiliarBg: { backgroundColor: COLORS.periwinkleSoft },
    tagFamiliarText: { color: COLORS.palatinateBlue, fontSize: 12 * scale, fontWeight: 'bold' },

    tagPostulanteBg: { backgroundColor: COLORS.brandRedSoft },
    tagPostulanteText: { color: COLORS.brandRed, fontSize: 12 * scale, fontWeight: 'bold' },
  });