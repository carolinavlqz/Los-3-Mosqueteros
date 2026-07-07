import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_WIDTH = 375;
const MAX_CONTENT_WIDTH = 480; 
function useScale() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.25));
  return { width, height, isLandscape, contentWidth, scale };
}

export default function HomeScreen() {
  const { isLandscape, contentWidth, scale } = useScale();
  const [currentTime, setCurrentTime] = useState(new Date());

  const router = useRouter();

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
      <StatusBar barStyle="light-content" backgroundColor="#1a355b" />

      <View style={s.outerContainer}>
        <View style={[s.container, { width: contentWidth }]}>

          {/* ===== HEADER CON FOTO DE FONDO ===== */}
          <ImageBackground
            source={require('../../assets/images/medica-mia.png')}
            resizeMode="cover"
            imageStyle={[s.bgImage, { objectPosition: 'top' }]}
            style={[s.topSection, isLandscape && s.topSectionLandscape]}
          >
            <LinearGradient
              colors={[
                'rgba(10,22,43,0.35)',
                'rgba(15,30,55,0.55)',
                'rgba(26,53,91,0.90)',
              ]}
              locations={[0, 0.45, 1]}
              style={s.overlay}
            />

            {/* Detalles decorativos tipo "glow" para que se vea premium */}
            <View style={s.glowCircleTop} pointerEvents="none" />
            <View style={s.glowCircleBottom} pointerEvents="none" />

            <View style={s.headerContainer}>
              <View style={s.homeIconContainer}>
                <Ionicons name="home-outline" size={26 * scale} color="#ffffff" />
              </View>
              <View>
                <Text style={s.headerSubtitle}>CONTROL DE ACCESO</Text>
                <Text style={s.headerTitle}>Hospital General</Text>
              </View>
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
          </ImageBackground>
          {/* ===== FIN HEADER ===== */}

          <View style={[s.bottomSection, isLandscape && s.bottomSectionLandscape]}>
            <Text style={s.sectionLabel}>SELECCIONA UNA ACCIÓN</Text>

            <View style={s.buttonsContainer}>

              {/* BOTÓN CON NAVEGACIÓN HACIA CHECK IN */}
              <TouchableOpacity
                style={[s.actionButton, { backgroundColor: '#1e3a68' }]}
                activeOpacity={0.85}
                onPress={() => router.push('/check-in')}
              >
                <View style={[s.iconBox, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <MaterialCommunityIcons name="login" size={30 * scale} color="#ffffff" />
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={s.buttonTitle}>Check In</Text>
                  <Text style={s.buttonSubtitle}>Registrar entrada de visitante</Text>
                </View>
                <Ionicons name="chevron-forward" size={22 * scale} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.actionButton, { backgroundColor: '#00a884' }]}
                activeOpacity={0.85}
                onPress={() => router.push('/check-out')}
              >
                <View style={[s.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <MaterialCommunityIcons name="logout" size={30 * scale} color="#ffffff" />
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={s.buttonTitle}>Check Out</Text>
                  <Text style={s.buttonSubtitle}>Registrar salida de visitante</Text>
                </View>
                <Ionicons name="chevron-forward" size={22 * scale} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity style={[s.actionButton, s.historyButton]} activeOpacity={0.85} onPress={() => router.push('/historial')}>
                <View style={[s.iconBox, { backgroundColor: '#f0f4f8' }]}>
                  <Ionicons name="document-text-outline" size={30 * scale} color="#1e3a68" />
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={[s.buttonTitle, { color: '#1e3a68' }]}>Historial</Text>
                  <Text style={[s.buttonSubtitle, { color: '#6b7280' }]}>
                    Ver registros anteriores
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22 * scale} color="#6b7280" />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f6f9' },
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

    bgImage: {
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },

    glowCircleTop: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(0,168,132,0.18)', 
    },
    glowCircleBottom: {
      position: 'absolute',
      bottom: -60,
      left: -50,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(255,255,255,0.06)',
    },

    headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 * scale },
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
      color: '#cddcf0',
      fontSize: 12 * scale,
      fontWeight: '600',
      letterSpacing: 1.5,
      marginBottom: 4,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: 22 * scale,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },

    dateTimeCard: {
      backgroundColor: 'rgba(43, 71, 112, 0.85)', 
      borderRadius: 16,
      padding: 20 * scale,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    dateContainer: { flex: 1, paddingRight: 12 },
    timeContainer: { alignItems: 'flex-end' },
    dateTimeLabel: {
      color: '#8ba4c9',
      fontSize: 11 * scale,
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: 8,
    },
    dateText: { color: '#ffffff', fontSize: 16 * scale, fontWeight: '500' },
    timeRow: { flexDirection: 'row', alignItems: 'baseline' },
    timeText: { color: '#ffffff', fontSize: 30 * scale, fontWeight: 'bold', marginRight: 6 },
    periodText: { color: '#ffffff', fontSize: 18 * scale, fontWeight: '600' },

    bottomSection: {
      flex: 1,
      paddingHorizontal: 28 * scale,
      paddingTop: 28 * scale,
      paddingBottom: 20 * scale,
      justifyContent: 'space-between',
    },
    bottomSectionLandscape: { paddingHorizontal: 48 * scale },

    sectionLabel: {
      color: '#6b7280',
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
    },
    historyButton: {
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
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
    buttonTitle: { color: '#ffffff', fontSize: 19 * scale, fontWeight: 'bold', marginBottom: 3 },
    buttonSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 * scale },

    footerText: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: 12 * scale,
      fontWeight: '500',
      letterSpacing: 1,
      marginTop: 16 * scale,
    },
  });