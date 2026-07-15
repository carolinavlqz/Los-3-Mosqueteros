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
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';
import { clearSession } from '../utils/session';

export default function HomeScreen() {
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

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        bounces={false} 
        showsVerticalScrollIndicator={false}
      >
        <View style={s.outerContainer}>
          <View style={[
            s.container, 
            { width: contentWidth },
            isLandscape && s.containerLandscape
          ]}>

            {/* ===== HEADER CON GRADIENTE DE MARCA ===== */}
            <LinearGradient
              colors={[COLORS.palatinateBlue, '#0A2A6B', COLORS.royalBlue]}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                s.topSection, 
                isLandscape && s.topSectionLandscape
              ]}
            >
              {/* Detalles decorativos tipo "glow" */}
              <View style={s.glowCircleTop} pointerEvents="none" />
              <View style={s.glowCircleBottom} pointerEvents="none" />

              <View style={s.headerContainer}>
                <View style={s.headerLeft}>
                  <View style={s.homeIconContainer}>
                    <Ionicons name="home-outline" size={26 * scale} color={COLORS.white} />
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={s.headerSubtitle}>CONTROL DE ACCESO</Text>
                    <Text style={s.headerTitle} numberOfLines={2}>Hospital General</Text>
                  </View>
                </View>

                <TouchableOpacity onPress={handleLogout} style={s.logoutButton} activeOpacity={0.7}>
                  <Ionicons name="log-out-outline" size={20 * scale} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={s.dateTimeCard}>
                <View style={s.dateContainer}>
                  <Text style={s.dateTimeLabel}>FECHA</Text>
                  <Text style={s.dateText} numberOfLines={2}>{formatDate(currentTime)}</Text>
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

            {/* ===== SECCIÓN DE ACCIONES ===== */}
            <View style={[
              s.bottomSection, 
              isLandscape && s.bottomSectionLandscape
            ]}>
              <View style={s.actionsWrapper}>
                <Text style={s.sectionLabel}>SELECCIONA UNA ACCIÓN</Text>

                <View style={s.buttonsContainer}>
                  {/* CHECK IN */}
                  <TouchableOpacity
                    style={[s.actionButton, { backgroundColor: COLORS.royalBlue }]}
                    activeOpacity={0.85}
                    onPress={() => router.push('/check-in')}
                  >
                    <View style={[s.iconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                      <MaterialCommunityIcons name="login" size={30 * scale} color={COLORS.white} />
                    </View>
                    <View style={s.buttonTextContainer}>
                      <Text style={s.buttonTitle}>Check In</Text>
                      <Text style={s.buttonSubtitle} numberOfLines={1}>Registrar entrada de visitante</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22 * scale} color={COLORS.white} />
                  </TouchableOpacity>

                  {/* CHECK OUT */}
                  <TouchableOpacity
                    style={[s.actionButton, { backgroundColor: COLORS.brandRed }]}
                    activeOpacity={0.85}
                    onPress={() => router.push('/check-out')}
                  >
                    <View style={[s.iconBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                      <MaterialCommunityIcons name="logout" size={30 * scale} color={COLORS.white} />
                    </View>
                    <View style={s.buttonTextContainer}>
                      <Text style={s.buttonTitle}>Check Out</Text>
                      <Text style={s.buttonSubtitle} numberOfLines={1}>Registrar salida de visitante</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22 * scale} color={COLORS.white} />
                  </TouchableOpacity>

                  {/* HISTORIAL */}
                  <TouchableOpacity
                    style={[s.actionButton, s.historyButton]}
                    activeOpacity={0.85}
                    onPress={() => router.push('/historial')}
                  >
                    <View style={[s.iconBox, { backgroundColor: '#EEF1F8' }]}>
                      <Ionicons name="document-text-outline" size={30 * scale} color={COLORS.palatinateBlue} />
                    </View>
                    <View style={s.buttonTextContainer}>
                      <Text style={[s.buttonTitle, { color: COLORS.palatinateBlue }]}>Historial</Text>
                      <Text style={[s.buttonSubtitle, { color: COLORS.silver }]} numberOfLines={1}>
                        Ver registros anteriores
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22 * scale} color={COLORS.silver} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={s.footerText}>MÉDICA MIA · HOSPITAL</Text>
            </View>
            {/* ===== FIN SECCIÓN DE ACCIONES ===== */}

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
    outerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    container: { flex: 1 },
    
    containerLandscape: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },

    topSection: {
      paddingHorizontal: 28 * scale,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      paddingBottom: 32 * scale,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    },
    topSectionLandscape: { 
      flex: 1, 
      justifyContent: 'center',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopRightRadius: 28,
      borderBottomRightRadius: 28,
      paddingHorizontal: 32 * scale,
      paddingVertical: 40 * scale,
    },

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

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28 * scale,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
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
      color: '#B8C7EE',
      fontSize: 11 * scale,
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
      backgroundColor: 'rgba(3, 30, 93, 0.75)',
      borderRadius: 16,
      padding: 16 * scale,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(184,199,238,0.20)',
    },
    dateContainer: { flex: 1.2, paddingRight: 8 },
    timeContainer: { flex: 0.8, alignItems: 'flex-end' },
    dateTimeLabel: {
      color: '#8FA0C7',
      fontSize: 10 * scale,
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: 6,
    },
    dateText: { color: '#FFFFFF', fontSize: 14 * scale, fontWeight: '500' },
    timeRow: { flexDirection: 'row', alignItems: 'baseline' },
    timeText: { color: '#FFFFFF', fontSize: 26 * scale, fontWeight: 'bold', marginRight: 4 },
    periodText: { color: '#FFFFFF', fontSize: 15 * scale, fontWeight: '600' },

    bottomSection: {
      flex: 1.2,
      paddingHorizontal: 28 * scale,
      paddingTop: 24 * scale,
      paddingBottom: 20 * scale,
      justifyContent: 'space-between',
    },
    bottomSectionLandscape: { 
      flex: 1.2, 
      paddingHorizontal: 32 * scale,
      paddingTop: 32 * scale,
    },

    actionsWrapper: {
      flex: 1,
      justifyContent: 'center',
    },

    sectionLabel: {
      color: '#AFA9A9',
      fontSize: 11 * scale,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      marginBottom: 16 * scale,
    },

    buttonsContainer: { justifyContent: 'center', gap: 12 * scale },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16 * scale,
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
      elevation: 2,
    },

    iconBox: {
      width: 48 * scale,
      height: 48 * scale,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14 * scale,
    },
    buttonTextContainer: { flex: 1, marginRight: 8 },
    buttonTitle: { color: '#FFFFFF', fontSize: 17 * scale, fontWeight: 'bold', marginBottom: 2 },
    buttonSubtitle: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 12 * scale },

    footerText: {
      textAlign: 'center',
      color: '#AFA9A9',
      fontSize: 11 * scale,
      fontWeight: '500',
      letterSpacing: 1,
      marginTop: 16 * scale,
    },
  });
