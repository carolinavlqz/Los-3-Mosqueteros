import React, { useState, useEffect } from 'react';
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
import { clearSession } from '../utils/session';

const PRIVACY_URL = 'https://medicamia.com.mx/aviso-de-privacidad-2/';

export default function TorreHomeScreen() {
  const { isLandscape, contentWidth, scale } = useScale({ maxContentWidthTablet: 560 });
  const [currentTime, setCurrentTime] = useState(new Date());

  const router = useRouter();

  const handleLogout = async () => {
    await clearSession();
    router.replace('/');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('es-MX', options);
    return formatted
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return {
      time: `${hours < 10 ? '0' + hours : hours}:${minutes}`,
      period: ampm,
    };
  };

  const timeData = formatTime(currentTime);
  const s = createStyles(scale);

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.palatinateBlue} />

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>

          {/* ===== HEADER CON GRADIENTE DE MARCA (sin imagen) ===== */}
          <LinearGradient
            colors={[COLORS.palatinateBlue, '#0A2A6B', COLORS.royalBlue]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.topSection, isLandscape && s.topSectionLandscape]}
          >
            {/* Detalles decorativos tipo "glow" para que se vea premium */}
            <View style={s.glowCircleTop} pointerEvents="none" />
            <View style={s.glowCircleBottom} pointerEvents="none" />

            <View style={s.headerContainer}>
              <View style={s.headerLeft}>
                <View style={s.homeIconContainer}>
                  <Ionicons name="business-outline" size={26 * scale} color={COLORS.white} />
                </View>
                <View>
                  <Text style={s.headerSubtitle}>CONTROL DE ACCESO</Text>
                  <Text style={s.headerTitle}>Torre Mia</Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleLogout} style={s.logoutButton} activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={20 * scale} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={s.dateTimeCard}>
              <View style={s.dateContainer}>
                <Text style={s.dateTimeLabel}>FECHA</Text>
                <Text style={s.dateText}>{formatDate(currentTime)}</Text>
              </View>
              <View style={s.timeContainer}>
                <Text style={s.dateTimeLabel}>HORA</Text>
                <View style={s.timeRow}>
                  <Text style={s.timeText}>{timeData.time}</Text>
                  <Text style={s.periodText}>{timeData.period}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
          {/* ===== FIN HEADER ===== */}

          <View style={[s.bottomSection, isLandscape && s.bottomSectionLandscape]}>
            <Text style={s.sectionLabel}>SELECCIONA UNA ACCIÓN</Text>

            <View style={s.buttonsContainer}>

              {/* ENTRADA -> Royal Blue (color de acción principal) */}
              <TouchableOpacity
                style={[s.actionButton, { backgroundColor: COLORS.royalBlue }]}
                activeOpacity={0.85}
                onPress={() => router.push('/torre/entrada')}
              >
                <View style={[s.iconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                  <MaterialCommunityIcons name="login" size={30 * scale} color={COLORS.white} />
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={s.buttonTitle}>Entrada</Text>
                  <Text style={s.buttonSubtitle}>Registrar entrada de visitante</Text>
                </View>
                <Ionicons name="chevron-forward" size={22 * scale} color={COLORS.white} />
              </TouchableOpacity>

              {/* SALIDA -> Rojo de marca (acento, distingue claramente la acción de salida) */}
              <TouchableOpacity
                style={[s.actionButton, { backgroundColor: COLORS.brandRed }]}
                activeOpacity={0.85}
                onPress={() => router.push('/torre/salida')}
              >
                <View style={[s.iconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                  <MaterialCommunityIcons name="logout" size={30 * scale} color={COLORS.white} />
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={s.buttonTitle}>Salida</Text>
                  <Text style={s.buttonSubtitle}>Registrar salida de visitante</Text>
                </View>
                <Ionicons name="chevron-forward" size={22 * scale} color={COLORS.white} />
              </TouchableOpacity>

              {/* HISTORIAL -> tarjeta blanca, texto en Palatinate Blue e icono en gris de marca */}
              <TouchableOpacity
                style={[s.actionButton, s.historyButton]}
                activeOpacity={0.85}
                onPress={() => router.push('/torre/historial')}
              >
                <View style={[s.iconBox, { backgroundColor: '#EEF1F8' }]}>
                  <Ionicons name="document-text-outline" size={30 * scale} color={COLORS.palatinateBlue} />
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={[s.buttonTitle, { color: COLORS.palatinateBlue }]}>Historial</Text>
                  <Text style={[s.buttonSubtitle, { color: COLORS.silver }]}>
                    Ver activos y finalizados
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22 * scale} color={COLORS.silver} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.7}>
              <Text style={s.privacyText}>
                Consulta el aviso de privacidad en:{'\n'}
                <Text style={s.privacyLink}>{PRIVACY_URL}</Text>
              </Text>
            </TouchableOpacity>

            <Text style={s.footerText}>TORRE MIA 57</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1 },

    topSection: {
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 32 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    },
    topSectionLandscape: { paddingHorizontal: 48 * scale },

    glowCircleTop: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(219,24,48,0.16)', // toque del rojo de marca
    },
    glowCircleBottom: {
      position: 'absolute',
      bottom: -60,
      left: -50,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(184,199,238,0.10)', // Light Periwinkle muy sutil
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28 * scale,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
    logoutButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 40 * scale,
      height: 40 * scale,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    homeIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      width: 56 * scale,
      height: 56 * scale,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16 * scale,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    headerSubtitle: {
      color: '#B8C7EE', // Light Periwinkle
      fontSize: 12 * scale,
      fontWeight: '600',
      letterSpacing: 1.5,
      marginBottom: 4,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 22 * scale,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },

    dateTimeCard: {
      backgroundColor: 'rgba(3, 30, 93, 0.75)', // Palatinate Blue con transparencia
      borderRadius: 16,
      padding: 20 * scale,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(184,199,238,0.20)',
    },
    dateContainer: { flex: 1, paddingRight: 12 },
    timeContainer: { alignItems: 'flex-end' },
    dateTimeLabel: {
      color: '#8FA0C7', // variante intermedia entre periwinkle y silver
      fontSize: 11 * scale,
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: 8,
    },
    dateText: { color: '#FFFFFF', fontSize: 16 * scale, fontWeight: '500' },
    timeRow: { flexDirection: 'row', alignItems: 'baseline' },
    timeText: { color: '#FFFFFF', fontSize: 30 * scale, fontWeight: 'bold', marginRight: 6 },
    periodText: { color: '#FFFFFF', fontSize: 18 * scale, fontWeight: '600' },

    bottomSection: {
      flex: 1,
      paddingHorizontal: 28 * scale,
      paddingTop: 28 * scale,
      paddingBottom: 20 * scale,
      justifyContent: 'space-between',
    },
    bottomSectionLandscape: { paddingHorizontal: 48 * scale },

    sectionLabel: {
      color: '#AFA9A9', // Philippine Silver
      fontSize: 12 * scale,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      marginBottom: 20 * scale,
    },

    buttonsContainer: { flex: 1, justifyContent: 'flex-start', gap: 16 * scale },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18 * scale,
      borderRadius: 18,
      shadowColor: '#031E5D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    historyButton: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },

    iconBox: {
      width: 52 * scale,
      height: 52 * scale,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16 * scale,
    },
    buttonTextContainer: { flex: 1 },
    buttonTitle: { color: '#FFFFFF', fontSize: 19 * scale, fontWeight: 'bold', marginBottom: 3 },
    buttonSubtitle: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 13 * scale },

    privacyText: {
      textAlign: 'center',
      color: '#AFA9A9', // Philippine Silver
      fontSize: 12 * scale,
      lineHeight: 18 * scale,
      marginTop: 16 * scale,
    },
    privacyLink: {
      color: COLORS.royalBlue,
      textDecorationLine: 'underline',
    },
    footerText: {
      textAlign: 'center',
      color: '#AFA9A9', // Philippine Silver
      fontSize: 12 * scale,
      fontWeight: '500',
      letterSpacing: 1,
      marginTop: 12 * scale,
    },
  });
