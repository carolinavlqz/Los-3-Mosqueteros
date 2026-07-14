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
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

const PRIVACY_URL = 'https://medicamia.com.mx/aviso-de-privacidad-2/';

const ACCESS_TYPES = [
  { key: 'rep-medico', label: 'Representante Médico', color: COLORS.palatinateBlue, textColor: COLORS.white, icon: 'medical-bag' },
  { key: 'paciente', label: 'Paciente', color: COLORS.royalBlue, textColor: COLORS.white, icon: 'account-outline' },
  { key: 'visitante', label: 'Visitante', color: COLORS.periwinkle, textColor: COLORS.palatinateBlue, icon: 'account-group-outline' },
  { key: 'proveedor', label: 'Proveedor', color: COLORS.brandRed, textColor: COLORS.white, icon: 'truck-outline' },
];

export default function TipoAccesoScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, contentWidth, scale } = useScale({ maxContentWidthTablet: 560 });
  const s = createStyles(scale);

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
          <Text style={s.headerTitle}>Tipo de Acceso</Text>
        </View>
      </LinearGradient>
      {/* ===== FIN HEADER ===== */}

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>
          <View style={s.grid}>
            {ACCESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[s.tile, { backgroundColor: type.color }]}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/torre/piso', params: { tipo: type.key } })}
              >
                <View style={s.tileIcon}>
                  <MaterialCommunityIcons name={type.icon} size={30 * scale} color={type.textColor} />
                </View>
                <Text style={[s.tileLabel, { color: type.textColor }]}>{type.label.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.7}>
            <Text style={s.privacyText}>
              Consulta el aviso de privacidad en:{'\n'}
              <Text style={s.privacyLink}>{PRIVACY_URL}</Text>
            </Text>
          </TouchableOpacity>
        </View>
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

    outerContainer: { flex: 1, alignItems: 'center' },
    container: {
      flex: 1,
      paddingHorizontal: 24 * scale,
      paddingTop: 28 * scale,
      paddingBottom: 20 * scale,
      justifyContent: 'space-between',
    },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 * scale },

    tile: {
      flexGrow: 1,
      flexBasis: '46%',
      aspectRatio: 1.3,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16 * scale,
      shadowColor: COLORS.palatinateBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    tileIcon: { marginBottom: 12 * scale },
    tileLabel: {
      color: COLORS.white,
      fontSize: 15 * scale,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      textAlign: 'center',
    },

    privacyText: {
      textAlign: 'center',
      color: COLORS.silver,
      fontSize: 12 * scale,
      lineHeight: 18 * scale,
      marginTop: 24 * scale,
    },
    privacyLink: {
      color: COLORS.royalBlue,
      textDecorationLine: 'underline',
    },
  });
