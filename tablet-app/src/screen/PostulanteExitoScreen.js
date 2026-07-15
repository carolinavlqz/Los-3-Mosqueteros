import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH_PHONE = 480;
const MAX_CONTENT_WIDTH_TABLET = 600;

function useScale() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isLandscape = width > height;

  // Calculamos el ancho ideal basándonos en la orientación y tipo de dispositivo
  const contentWidth = isTablet
    ? Math.min(width * (isLandscape ? 0.6 : 0.85), MAX_CONTENT_WIDTH_TABLET)
    : Math.min(width * 0.9, MAX_CONTENT_WIDTH_PHONE);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.2));

  return { contentWidth, scale, isLandscape, isTablet };
}

export default function PostulanteExitoScreen() {
  const router = useRouter();
  const { nombre, puesto, tipoCita, folio: folioParam } = useLocalSearchParams();
  const { contentWidth, scale, isLandscape, isTablet } = useScale();
  const s = createStyles(scale);

  const [folio, setFolio] = useState('');
  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    setFolio(folioParam || `MIA-${Math.floor(1000 + Math.random() * 9000)}`);

    const now = new Date();
    // Obtener Hora formateada
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'p.m.' : 'a.m.';
    h = h % 12; 
    h = h ? h : 12; 
    m = m < 10 ? '0' + m : m;
    setHora(`${h}:${m} ${ampm}`);

    // Obtener Fecha formateada
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    setFecha(now.toLocaleDateString('es-MX', options));
  }, [folioParam]);

  const handleFinish = () => router.replace('/');

  const renderRow = (label, value, isHighlighted = false) => (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text 
        style={[s.rowValue, isHighlighted && s.rowValueBlue]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />

      <ScrollView 
        contentContainerStyle={s.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            
            {/* Imagen del Logo Adaptada al Ancho */}
            <Image 
              source={require('../../assets/images/medica-mia.png')} 
              style={s.logoImage}
            />

            {/* Ícono y Títulos */}
            <View style={s.iconContainer}>
              <View style={s.checkCircle}>
                <Ionicons name="checkmark" size={50 * scale} color="#ffffff" />
              </View>
            </View>
            <Text style={s.title}>¡Registro Exitoso!</Text>
            <Text style={s.subtitle}>
              La entrada ha sido registrada correctamente en el sistema de Médica MIA.
            </Text>

            {/* Ticket Card */}
            <View style={s.ticketCard}>
              <View style={s.ticketHeader}>
                <View style={s.ticketHeaderCol}>
                  <Text style={s.ticketLabelLight}>FOLIO</Text>
                  <Text style={s.ticketValueBig} numberOfLines={1} adjustsFontSizeToFit>{folio}</Text>
                </View>
                <View style={[s.ticketHeaderCol, { alignItems: 'flex-end' }]}>
                  <Text style={s.ticketLabelLight}>HORA</Text>
                  <Text style={s.ticketValueBig} numberOfLines={1} adjustsFontSizeToFit>{hora}</Text>
                </View>
              </View>

              <View style={s.ticketBody}>
                {renderRow('CANDIDATO', nombre || 'N/A')}
                <View style={s.divider} />
                {renderRow('PUESTO', puesto || 'N/A')}
                <View style={s.divider} />
                {renderRow('TIPO DE CITA', tipoCita || 'No especificado')}
                <View style={s.divider} />
                {renderRow('FECHA', fecha)}
                <View style={s.divider} />
                {renderRow('ESTADO', '● Activo — En instalaciones', true)}
                <View style={s.divider} />
                {renderRow('INSTRUCCIÓN', 'Entregar gafete en recepción')}
              </View>
            </View>

            {/* Botón Volver */}
            <TouchableOpacity style={s.homeButton} onPress={handleFinish} activeOpacity={0.85}>
              <Ionicons name="home-outline" size={20 * scale} color="#ffffff" style={{ marginRight: 8 * scale }} />
              <Text style={s.homeButtonText}>Volver al Inicio</Text>
            </TouchableOpacity>

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
      backgroundColor: '#f0f4f8' 
    }, 
    scrollContainer: { 
      flexGrow: 1,
      paddingVertical: 24 * scale
    },
    outerContainer: { 
      flex: 1, 
      alignItems: 'center',
      justifyContent: 'center'
    },
    container: { 
      alignItems: 'stretch',
    },

    logoImage: {
      width: '100%',
      height: 70 * scale,
      resizeMode: 'contain',
      marginBottom: 20 * scale,
    },

    iconContainer: { 
      alignItems: 'center', 
      marginBottom: 16 * scale 
    },
    checkCircle: { 
      width: 76 * scale, 
      height: 76 * scale, 
      borderRadius: 38 * scale, 
      backgroundColor: '#284b82', 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: '#284b82', 
      shadowOffset: { width: 0, height: 8 }, 
      shadowOpacity: 0.25, 
      shadowRadius: 12, 
      elevation: 6 
    },
    
    title: { 
      color: '#284b82', 
      fontSize: 24 * scale, 
      fontWeight: '950', 
      textAlign: 'center', 
      marginBottom: 8 * scale 
    },
    subtitle: { 
      color: '#4b5563', 
      fontSize: 14 * scale, 
      textAlign: 'center', 
      lineHeight: 20 * scale, 
      paddingHorizontal: 16 * scale, 
      marginBottom: 28 * scale 
    },

    ticketCard: { 
      backgroundColor: '#ffffff', 
      borderRadius: 20, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.04, 
      shadowRadius: 12, 
      elevation: 4, 
      marginBottom: 24 * scale, 
      overflow: 'hidden' 
    },
    ticketHeader: { 
      backgroundColor: '#284b82', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      padding: 20 * scale 
    },
    ticketHeaderCol: { 
      flex: 1 
    },
    ticketLabelLight: { 
      color: '#8ba4c9', 
      fontSize: 11 * scale, 
      fontWeight: 'bold', 
      letterSpacing: 1, 
      marginBottom: 4 * scale 
    },
    ticketValueBig: { 
      color: '#ffffff', 
      fontSize: 20 * scale, 
      fontWeight: 'bold' 
    },
    
    ticketBody: { 
      padding: 20 * scale 
    },
    row: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      gap: 12
    },
    rowLabel: { 
      color: '#9ca3af', 
      fontSize: 11 * scale, 
      fontWeight: 'bold', 
      letterSpacing: 0.8, 
      width: '35%'
    },
    rowValue: { 
      color: '#111827', 
      fontSize: 13 * scale, 
      fontWeight: '600', 
      width: '60%', 
      textAlign: 'right' 
    },
    rowValueBlue: { 
      color: '#0284c7', 
      fontWeight: 'bold' 
    },
    divider: { 
      height: 1, 
      backgroundColor: '#f3f4f6', 
      marginVertical: 12 * scale 
    },

    homeButton: { 
      backgroundColor: '#284b82', 
      flexDirection: 'row', 
      padding: 16 * scale, 
      borderRadius: 16, 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: 8 * scale
    },
    homeButtonText: { 
      color: '#ffffff', 
      fontSize: 16 * scale, 
      fontWeight: 'bold' 
    },
  });
