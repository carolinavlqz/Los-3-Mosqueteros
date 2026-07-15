import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useScale } from '../hooks/useScale';

export default function FamiliarExitoScreen() {
  const router = useRouter();
  // 1. AQUÍ RECIBIMOS EL FOLIO REAL QUE NOS MANDÓ EL FORMULARIO
  const { nombre, habitacion, folio } = useLocalSearchParams();
  const { contentWidth, scale, useRowLayout } = useScale({ maxContentWidthTablet: 600, tabletWidthRatio: 0.7, maxScale: 1.25 });
  const s = createStyles(scale);

  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    // 2. YA NO GENERAMOS FOLIOS FALSOS AQUÍ

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

  const handleFinish = () => router.replace('/hospital');

  const renderRow = (label, value, isHighlighted = false) => (
    <View style={[s.row, useRowLayout && s.rowWide]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, isHighlighted && s.rowValueBlue]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.royalBlueSoft} />

      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>

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
                  {/* 3. IMPRIMIMOS EL FOLIO REAL */}
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
    safeArea: { flex: 1, backgroundColor: COLORS.royalBlueSoft },
    scrollContainer: { flexGrow: 1, paddingVertical: 24 * scale, justifyContent: 'center' },
    outerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    container: { paddingHorizontal: 20 * scale },

    iconContainer: { alignItems: 'center', marginBottom: 20 * scale },
    checkCircle: { width: 80 * scale, height: 80 * scale, borderRadius: 40 * scale, backgroundColor: COLORS.palatinateBlue, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.palatinateBlue, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },

    title: { color: COLORS.palatinateBlue, fontSize: 26 * scale, fontWeight: '900', textAlign: 'center', marginBottom: 10 * scale },
    subtitle: { color: '#4b5563', fontSize: 15 * scale, textAlign: 'center', lineHeight: 22 * scale, paddingHorizontal: 16 * scale, marginBottom: 32 * scale },

    ticketCard: { backgroundColor: '#ffffff', borderRadius: 20 * scale, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, marginBottom: 30 * scale, overflow: 'hidden' },
    ticketHeader: { backgroundColor: COLORS.palatinateBlue, flexDirection: 'row', justifyContent: 'space-between', padding: 24 * scale },
    ticketHeaderCol: { flex: 1 },
    ticketLabelLight: { color: COLORS.periwinkle, fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 * scale },
    ticketValueBig: { color: COLORS.white, fontSize: 22 * scale, fontWeight: 'bold' },

    ticketBody: { padding: 24 * scale },
    row: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      flexWrap: 'wrap',
      gap: 8 * scale 
    },
    rowWide: {
      flexWrap: 'nowrap'
    },
    rowLabel: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, minWidth: 100 * scale },
    rowValue: { color: '#111827', fontSize: 14 * scale, fontWeight: '600', flex: 1, textAlign: 'right' },
    rowValueBlue: { color: COLORS.royalBlue, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 * scale },

    homeButton: { 
      backgroundColor: COLORS.palatinateBlue, 
      flexDirection: 'row', 
      padding: 18 * scale, 
      borderRadius: 16 * scale, 
      alignItems: 'center', 
      justifyContent: 'center',
      alignSelf: 'stretch'
    },
    homeButtonText: { color: COLORS.white, fontSize: 17 * scale, fontWeight: 'bold' },
  });
