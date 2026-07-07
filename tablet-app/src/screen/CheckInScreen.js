import React from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  useWindowDimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckInScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a355b" />

      {/* ENCABEZADO AZUL */}
      <View style={styles.header}>
        {/* Botón Regresar CON NAVEGACIÓN */}
        <TouchableOpacity 
          style={styles.iconButton} 
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>

        {/* Títulos del Encabezado */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>CHECK IN</Text>
          <Text style={styles.headerTitle}>Nuevo Registro</Text>
        </View>

        {/* Botón Home CON NAVEGACIÓN AL INICIO */}
        <TouchableOpacity 
          style={styles.iconButton} 
          activeOpacity={0.7}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={[styles.content, isLandscape && styles.contentLandscape]}>
        
        <Text style={styles.instructionText}>
          Selecciona el tipo de visitante para iniciar el registro de entrada.
        </Text>

        {/* CONTENEDOR DE TARJETAS (Cambia a fila en Landscape) */}
        <View style={[styles.cardsContainer, isLandscape && styles.cardsContainerLandscape]}>
          
          {/* TARJETA 1: PROVEEDOR */}
          <TouchableOpacity
              style={[styles.card, isLandscape && styles.cardLandscape]}
              activeOpacity={0.85}
              onPress={() => router.push('/proveedor-fotos')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="briefcase-outline" size={32} color="#0fa38b" />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>EXTERNO</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Proveedor</Text>
            <Text style={styles.cardDescription}>
              Empresas externas, servicios de mantenimiento, entrega de suministros y contratistas.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.selectText}>Seleccionar</Text>
              <Ionicons name="chevron-forward" size={18} color="#0fa38b" />
            </View>
          </TouchableOpacity>

          {/* TARJETA 2: VISITAS */}
          <TouchableOpacity style={[styles.card, isLandscape && styles.cardLandscape]} activeOpacity={0.9} onPress={() => router.push('/visitas-tipo')}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="people-outline" size={32} color="#0fa38b" />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>VISITANTE</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Visitas</Text>
            <Text style={styles.cardDescription}>
              Familiares de pacientes, postulantes y visitantes generales al hospital.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.selectText}>Seleccionar</Text>
              <Ionicons name="chevron-forward" size={18} color="#0fa38b" />
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    backgroundColor: '#1a355b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 24,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#8ba4c9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  contentLandscape: {
    paddingHorizontal: 64,
  },
  instructionText: {
    color: '#4b5563',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 32,
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  cardsContainerLandscape: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLandscape: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconBox: {
    backgroundColor: '#e6f7f4',
    padding: 14,
    borderRadius: 16,
  },
  badge: {
    backgroundColor: '#e6f7f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#0fa38b',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardDescription: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto', // Empuja el footer hacia abajo si hay espacio sobrante
  },
  selectText: {
    color: '#0fa38b',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});