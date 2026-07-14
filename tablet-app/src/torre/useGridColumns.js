import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@torre_grid_size';

// Igual que el tamaño de ícono en el escritorio de una PC: chico/mediano/grande = más/menos columnas.
export const GRID_SIZES = {
  chico: { label: 'Chico', columns: 4 },
  mediano: { label: 'Mediano', columns: 3 },
  grande: { label: 'Grande', columns: 2 },
};

export function useGridColumns(defaultSize = 'mediano') {
  const [size, setSize] = useState(defaultSize);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && GRID_SIZES[saved]) setSize(saved);
    });
  }, []);

  const changeSize = (nextSize) => {
    setSize(nextSize);
    AsyncStorage.setItem(STORAGE_KEY, nextSize).catch(() => {});
  };

  return { size, columns: GRID_SIZES[size].columns, changeSize };
}

// En pantallas angostas (celular) forzar menos columnas que las elegidas si no
// alcanza el ancho mínimo por tarjeta, para que las fotos no queden apachurradas.
export function clampColumns(desiredColumns, gridWidth, minCardWidth = 130) {
  const maxFit = Math.max(1, Math.floor(gridWidth / minCardWidth));
  return Math.min(desiredColumns, maxFit);
}
