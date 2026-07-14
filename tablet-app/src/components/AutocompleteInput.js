import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

// Input de texto con lista de sugerencias desplegable (autocompletar), para
// campos que se repiten frecuentemente (empresa, responsable, etc.).
export default function AutocompleteInput({
  value,
  onChangeText,
  onFocus,
  onBlur,
  suggestions = [],
  showSuggestions,
  onSelectSuggestion,
  scale = 1,
  inputStyle,
  wrapperStyle,
  getLabel = (item) => item,
  ...textInputProps
}) {
  const s = createStyles(scale);
  const visible = showSuggestions && suggestions.length > 0;

  return (
    <View style={[s.wrapper, wrapperStyle]}>
      <TextInput
        {...textInputProps}
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {visible ? (
        <View style={s.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={`${getLabel(item)}-${index}`}
              style={[s.item, index < suggestions.length - 1 && s.itemBorder]}
              activeOpacity={0.7}
              onPress={() => onSelectSuggestion(item)}
            >
              <Text style={s.itemText} numberOfLines={1}>{getLabel(item)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (scale) =>
  StyleSheet.create({
    wrapper: { position: 'relative', zIndex: 10 },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 6 * scale,
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      overflow: 'hidden',
      zIndex: 20,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    item: { paddingVertical: 12 * scale, paddingHorizontal: 14 * scale },
    itemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemText: { color: '#111827', fontSize: 14 * scale, fontWeight: '500' },
  });
