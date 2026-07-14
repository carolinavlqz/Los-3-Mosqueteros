import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Capa decorativa de fondo: muestra quién está registrado hoy en el piso,
// con el nombre arriba de la foto y piso/consultorio abajo solo si sigue activo.
export default function PresentesWatermark({ presentes, scale }) {
  const s = createStyles(scale);
  return (
    <View style={s.watermark} pointerEvents="none">
      <View style={s.grid}>
        {presentes.map((persona) => {
          const fotoUrl = persona.foto ? `${API_URL}${persona.foto}` : null;
          return (
            <View key={persona.id} style={s.card}>
              <Text style={s.nombre} numberOfLines={1}>{persona.nombre}</Text>
              <View style={s.avatar}>
                {fotoUrl ? (
                  <Image source={{ uri: fotoUrl }} style={s.avatarImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={22 * scale} color={COLORS.palatinateBlue} />
                )}
              </View>
              {persona.activo && (
                <Text style={s.ubicacion}>{persona.piso} · {persona.consultorio}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    watermark: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.16,
      overflow: 'hidden',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 18 * scale,
      padding: 24 * scale,
    },
    card: { alignItems: 'center', width: 76 * scale },
    nombre: { color: COLORS.palatinateBlue, fontSize: 11 * scale, fontWeight: 'bold', marginBottom: 4 },
    avatar: {
      width: 48 * scale,
      height: 48 * scale,
      borderRadius: 24 * scale,
      backgroundColor: COLORS.periwinkleSoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    ubicacion: { color: COLORS.palatinateBlue, fontSize: 10 * scale, fontWeight: '600', marginTop: 4 },
  });
