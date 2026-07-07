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
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH_PHONE = 480;
const MAX_CONTENT_WIDTH_TABLET = 600;

function useScale() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const contentWidth = isTablet
    ? Math.min(width * 0.7, MAX_CONTENT_WIDTH_TABLET)
    : Math.min(width, MAX_CONTENT_WIDTH_PHONE);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.25));

  return { contentWidth, scale };
}

export default function ExitoScreen() {
  const router = useRouter();
  const { pisoSeleccionado, areaSeleccionada, empresa, representante } = useLocalSearchParams();
  const { contentWidth, scale } = useScale();
  const s = createStyles(scale);

  const [folio, setFolio] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'VIS-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFolio(result);

    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    setHoraEntrada(`${hours}:${minutes} ${ampm}`);
  }, []);

  const handleFinish = () => {
    router.replace('/');
  };

  const renderInfoRow = (label, value, isHighlighted = false) => (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, isHighlighted && s.infoValueHighlighted]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#f4f6f9" />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={s.outerContainer}>
          <View style={[s.container, { width: contentWidth }]}>
            
            {/* Header / Icono de Éxito */}
            <View style={s.headerSection}>
              <View style={s.successIconCircle}>
                <Ionicons name="checkmark" size={60 * scale} color="#00a884" />
              </View>
              <Text style={s.title}>Entrada Registrada</Text>
              <Text style={s.subtitle}>Registro completado exitosamente</Text>
            </View>

            {/* Tarjeta de Resumen (Ticket) */}
            <View style={s.ticketCard}>
              <View style={s.ticketHeader}>
                <View>
                  <Text style={s.folioLabel}>FOLIO DE REGISTRO</Text>
                  <Text style={s.folioValue}>{folio}</Text>
                </View>
                <View style={s.statusBadge}>
                  <View style={s.statusDot} />
                  <Text style={s.statusText}>Activo</Text>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.ticketBody}>
                {renderInfoRow('NOMBRE', representante || 'N/A')}
                {renderInfoRow('TIPO', 'Proveedor', true)}
                {renderInfoRow('EMPRESA', empresa || 'N/A')}
                {renderInfoRow('DESTINO', `${pisoSeleccionado} — ${areaSeleccionada}`)}
                {renderInfoRow('HORA DE ENTRADA', horaEntrada)}
              </View>
            </View>

            {/* Aviso de Gafete */}
            <View style={s.warningCard}>
              <Ionicons name="id-card-outline" size={32 * scale} color="#d97706" />
              <Text style={s.warningText}>
                Recoger <Text style={{fontWeight: 'bold'}}>gafete de visitante</Text> en recepción antes de ingresar.
              </Text>
            </View>

            {/* Botón Finalizar */}
            <TouchableOpacity
              style={s.finishButton}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={s.finishButtonText}>Volver al inicio</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1a355b' },
    outerContainer: { flex: 1, alignItems: 'center', paddingVertical: 40 * scale },
    container: { flex: 1, paddingHorizontal: 20 * scale },

    headerSection: { alignItems: 'center', marginBottom: 32 * scale },
    successIconCircle: {
      width: 100 * scale,
      height: 100 * scale,
      borderRadius: 50 * scale,
      backgroundColor: 'rgba(0, 168, 132, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24 * scale,
      borderWidth: 2,
      borderColor: '#00a884'
    },
    title: { color: '#ffffff', fontSize: 28 * scale, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { color: '#8ba4c9', fontSize: 16 * scale, marginTop: 8 * scale, textAlign: 'center' },

    ticketCard: {
      backgroundColor: '#ffffff',
      borderRadius: 24,
      padding: 24 * scale,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 24 * scale,
    },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    folioLabel: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 4 },
    folioValue: { color: '#00a884', fontSize: 22 * scale, fontWeight: '900', letterSpacing: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f7f4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00a884', marginRight: 6 },
    statusText: { color: '#00a884', fontSize: 13 * scale, fontWeight: 'bold' },
    
    divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 20 * scale, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e5e7eb' },
    
    ticketBody: { gap: 16 * scale },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    infoLabel: { color: '#9ca3af', fontSize: 12 * scale, fontWeight: 'bold', letterSpacing: 1, flex: 0.4 },
    infoValue: { color: '#1e3a68', fontSize: 15 * scale, fontWeight: '700', flex: 0.6, textAlign: 'right' },
    infoValueHighlighted: { color: '#1a355b', backgroundColor: '#f0f4f8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },

    warningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(217, 119, 6, 0.1)',
      borderColor: '#d97706',
      borderWidth: 1,
      padding: 18 * scale,
      borderRadius: 16,
      marginBottom: 32 * scale,
    },
    warningText: { color: '#fcd34d', fontSize: 15 * scale, flex: 1, marginLeft: 16 * scale, lineHeight: 22 * scale },

    finishButton: { backgroundColor: '#00a884', padding: 20 * scale, borderRadius: 16, alignItems: 'center' },
    finishButtonText: { color: '#ffffff', fontSize: 18 * scale, fontWeight: 'bold' },
  });