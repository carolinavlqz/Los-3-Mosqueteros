import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

export default function CheckInScreen() {
  const { isLandscape, isTablet, contentWidth, scale, useRowLayout } = useScale();
  const router = useRouter();

  const s = createStyles(scale);

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>

            {/* ENCABEZADO */}
            <View style={[s.header, (isLandscape || isTablet) && s.headerAdaptive]}>
              <TouchableOpacity
                style={s.iconButton}
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={26 * scale} color={COLORS.white} />
              </TouchableOpacity>

              <View style={s.headerTextContainer}>
                <Text style={s.headerSubtitle}>CHECK IN</Text>
                <Text style={s.headerTitle}>Nuevo Registro</Text>
              </View>

              <TouchableOpacity
                style={s.iconButton}
                activeOpacity={0.7}
                onPress={() => router.push('/hospital')}
              >
                <Ionicons name="home-outline" size={22 * scale} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* CONTENIDO PRINCIPAL */}
            <View style={[s.content, (isLandscape || isTablet) && s.contentAdaptive]}>

              <Text style={s.instructionText}>
                Selecciona el tipo de visitante para iniciar el registro de entrada.
              </Text>

              <View style={[s.cardsContainer, useRowLayout && s.cardsContainerRow]}>

                {/* TARJETA 1: PROVEEDOR */}
                <TouchableOpacity
                  style={[s.card, useRowLayout && s.cardRow]}
                  activeOpacity={0.85}
                  onPress={() => router.push('/proveedor-fotos')}
                >
                  <View style={s.cardHeader}>
                    <View style={s.iconBox}>
                      <Ionicons name="briefcase-outline" size={32 * scale} color={COLORS.royalBlue} />
                    </View>
                    <View style={s.badge}>
                      <Text style={s.badgeText}>EXTERNO</Text>
                    </View>
                  </View>

                  <Text style={s.cardTitle}>Proveedor</Text>
                  <Text style={s.cardDescription}>
                    Empresas externas, servicios de mantenimiento, entrega de suministros y contratistas.
                  </Text>

                  <View style={s.cardFooter}>
                    <Text style={s.selectText}>Seleccionar</Text>
                    <Ionicons name="chevron-forward" size={18 * scale} color={COLORS.royalBlue} />
                  </View>
                </TouchableOpacity>

                {/* TARJETA 2: VISITAS */}
                <TouchableOpacity
                  style={[s.card, useRowLayout && s.cardRow]}
                  activeOpacity={0.9}
                  onPress={() => router.push('/visitas-tipo')}
                >
                  <View style={s.cardHeader}>
                    <View style={s.iconBox}>
                      <Ionicons name="people-outline" size={32 * scale} color={COLORS.royalBlue} />
                    </View>
                    <View style={s.badge}>
                      <Text style={s.badgeText}>VISITANTE</Text>
                    </View>
                  </View>

                  <Text style={s.cardTitle}>Visitas</Text>
                  <Text style={s.cardDescription}>
                    Familiares de pacientes, postulantes y visitantes generales al hospital.
                  </Text>

                  <View style={s.cardFooter}>
                    <Text style={s.selectText}>Seleccionar</Text>
                    <Ionicons name="chevron-forward" size={18 * scale} color={COLORS.royalBlue} />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 24 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerAdaptive: {
      paddingHorizontal: 36 * scale, // Más espacio a los lados en pantallas grandes o landscape
    },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 48 * scale,
      height: 48 * scale,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      alignItems: 'center',
    },
    headerSubtitle: {
      color: COLORS.periwinkle,
      fontSize: 12 * scale,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    headerTitle: {
      color: COLORS.white,
      fontSize: 22 * scale,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24 * scale,
      paddingTop: 28 * scale,
      paddingBottom: 32 * scale, // Margen de seguridad abajo
    },
    contentAdaptive: {
      paddingHorizontal: 36 * scale,
    },
    instructionText: {
      color: '#4b5563',
      fontSize: 17 * scale, // Reducido levemente para evitar saltos de línea innecesarios
      lineHeight: 24 * scale,
      marginBottom: 28 * scale,
    },
    cardsContainer: {
      flexDirection: 'column',
      gap: 20 * scale,
    },
    cardsContainerRow: {
      flexDirection: 'row',
      alignItems: 'stretch', // Fuerza a las tarjetas a medir exactamente la misma altura
      gap: 24 * scale,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 24 * scale,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
      justifyContent: 'space-between', // Asegura una distribución limpia del contenido interno
    },
    cardRow: {
      flex: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20 * scale,
    },
    iconBox: {
      backgroundColor: COLORS.royalBlueSoft,
      padding: 14 * scale,
      borderRadius: 16,
    },
    badge: {
      backgroundColor: COLORS.royalBlueSoft,
      paddingHorizontal: 12 * scale,
      paddingVertical: 6 * scale,
      borderRadius: 20,
    },
    badgeText: {
      color: COLORS.royalBlue,
      fontSize: 12 * scale,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    cardTitle: {
      color: COLORS.palatinateBlue,
      fontSize: 22 * scale, // Ajustado ligeramente de 24 a 22 para prevenir wrapping agresivo en teléfonos compactos
      fontWeight: 'bold',
      marginBottom: 10 * scale,
    },
    cardDescription: {
      color: '#6b7280',
      fontSize: 14 * scale, // Ajustado de 15 a 14 para optimizar legibilidad
      lineHeight: 20 * scale,
      marginBottom: 20 * scale,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 'auto', // Empuja el botón seleccionar al fondo de la tarjeta si una es más alta que la otra
    },
    selectText: {
      color: COLORS.royalBlue,
      fontSize: 16 * scale,
      fontWeight: '700',
      marginRight: 8,
    },
  });
