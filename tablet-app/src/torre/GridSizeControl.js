import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { GRID_SIZES } from './useGridColumns';

// Selector de tamaño de las tarjetas, como el control de tamaño de íconos en el escritorio de una PC.
export default function GridSizeControl({ size, onChange, scale }) {
  const s = createStyles(scale);
  return (
    <View style={s.row}>
      <Text style={s.label}>TAMAÑO</Text>
      <View style={s.buttons}>
        {Object.entries(GRID_SIZES).map(([key, { label }]) => (
          <TouchableOpacity
            key={key}
            style={[s.button, size === key && s.buttonSelected]}
            onPress={() => onChange(key)}
            activeOpacity={0.8}
          >
            <Text style={[s.buttonText, size === key && s.buttonTextSelected]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 * scale, marginBottom: 16 * scale },
    label: { color: COLORS.silver, fontSize: 11 * scale, fontWeight: 'bold', letterSpacing: 1 },
    buttons: { flexDirection: 'row', gap: 8 * scale },
    button: {
      paddingHorizontal: 12 * scale,
      paddingVertical: 6 * scale,
      borderRadius: 10,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    buttonSelected: { backgroundColor: COLORS.royalBlue, borderColor: COLORS.royalBlue },
    buttonText: { color: '#4b5563', fontSize: 12 * scale, fontWeight: '600' },
    buttonTextSelected: { color: COLORS.white },
  });
