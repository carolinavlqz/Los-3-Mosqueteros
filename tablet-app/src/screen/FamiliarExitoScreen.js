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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH_PHONE = 480;
const MAX_CONTENT_WIDTH_TABLET = 600;

function useScale() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const contentWidth = isTablet
    ? Math.min(width * 0.7, MAX_CONTENT_WIDTH_TABLET)
    : Math.min(width, MAX_CONTENT_WIDTH_PHONE);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.25));

  return { contentWidth, scale };
}

export default function FamiliarExitoScreen() {
  const router = useRouter();
  const { nombre, habitacion } = useLocalSearchParams();
  const { contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [folio, setFolio] = useState('');
  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    // Generar Folio tipo MIA-XXXX
    setFolio(`MIA-${Math.floor(1000 + Math.random() * 9000)}`);

    const now = new Date();
    // Hora
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'p.m.' : 'a.m.';
    h = h % 12; h = h ? h : 12; m = m < 10 ? '0' + m : m;
    setHora(`${h}:${m} ${ampm}`);

    // Fecha
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    setFecha(now.toLocaleDateString('es-MX', options));
  }, []);

  const handleFinish = () => router.replace('/');

  const renderRow = (label, value, isHighlighted = false) => (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, isHighlighted && s.rowValueBlue]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}>
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
                  <Text style={s.ticketValueBig}>{folio}</Text>
                </View>
                <View style={[s.ticketHeaderCol, { alignItems: 'flex-end' }]}>
                  <Text style={s.ticketLabelLight}>HORA</Text>
                  <Text style={s.ticketValueBig}>{hora}</Text>
                </View>
              </View>

              <View style={s.ticketBody}>
                {renderRow('FECHA', fecha)}
                <View style={s.divider} />
                {renderRow('ESTADO', '● Activo — En instalaciones', true)}
                <View style={s.divider} />
                {renderRow('INSTRUCCIÓN', 'Entregar gafete en recepción')}
              </View>
            </View>

            {/* Botón Volver */}
            <TouchableOpacity style={s.homeButton} onPress={handleFinish} activeOpacity={0.85}>
              <Ionicons name="home-outline" size={20 * scale} color="#ffffff" style={{marginRight: 8}} />
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
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    outerContainer: { flex: 1, alignItems: 'center' },
    container: { flex: 1, paddingHorizontal: 20 * scale },

    logoImage: {
      width: '100%',
      height: 80 * scale,
      resizeMode: 'contain',
      marginBottom: 30 * scale,
    },

    iconContainer: { alignItems: 'center', marginBottom: 20 * scale },
    checkCircle: { width: 80 * scale, height: 80 * scale, borderRadius: 40 * scale, backgroundColor: '#284b82', justifyContent: 'center', alignItems: 'center', shadowColor: '#284b82', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    
    title: { color: '#284b82', fontSize: 26 * scale, fontWeight: '900', textAlign: 'center', marginBottom: 10 * scale },
    subtitle: { color: '#4b5563', fontSize: 15 * scale, textAlign: 'center', lineHeight: 22 * scale, paddingHorizontal: 20 * scale, marginBottom: 40 * scale },

    ticketCard: { backgroundColor: '#ffffff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, marginBottom: 30 * scale, overflow: 'hidden' },
    ticketHeader: { backgroundColor: '#284b82', flexDirection: 'row', justifyContent: 'space-between', padding: 24 * scale },
    ticketHeaderCol: { flex: 1 },
    ticketLabelLight: { color: '#8ba4c9', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 * scale },
    ticketValueBig: { color: '#ffffff', fontSize: 22 * scale, fontWeight: 'bold' },
    
    ticketBody: { padding: 24 * scale },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1 },
    rowValue: { color: '#111827', fontSize: 14 * scale, fontWeight: '600' },
    rowValueBlue: { color: '#0284c7', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 * scale },

    homeButton: { backgroundColor: '#284b82', flexDirection: 'row', padding: 20 * scale, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    homeButtonText: { color: '#ffffff', fontSize: 17 * scale, fontWeight: 'bold' },
  });