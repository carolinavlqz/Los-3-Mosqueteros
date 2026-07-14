import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Pantalla de inicio de sesión */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Pantalla principal del Hospital */}
      <Stack.Screen name="hospital" options={{ headerShown: false }} />

      {/* Pantalla de Check In */}
      <Stack.Screen name="check-in" options={{ headerShown: false }} />

      {/* Pantalla principal de Torre Mia */}
      <Stack.Screen name="torre/index" options={{ headerShown: false }} />

      {/* Pantalla de Tipo de acceso (Torre Mia) */}
      <Stack.Screen name="torre/entrada" options={{ headerShown: false }} />

      {/* Pantalla de Piso a acceder (Torre Mia) */}
      <Stack.Screen name="torre/piso" options={{ headerShown: false }} />

      {/* Pantalla de Consultorio a acceder (Torre Mia) */}
      <Stack.Screen name="torre/consultorio" options={{ headerShown: false }} />

      {/* Pantalla de Foto de acceso (Torre Mia) */}
      <Stack.Screen name="torre/foto" options={{ headerShown: false }} />

      {/* Pantalla de Nombre del visitante (Torre Mia) */}
      <Stack.Screen name="torre/nombre" options={{ headerShown: false }} />

      {/* Pantalla de Activos del piso (Torre Mia) */}
      <Stack.Screen name="torre/exito" options={{ headerShown: false }} />

      {/* Pantalla de Registrar Salida (Torre Mia) */}
      <Stack.Screen name="torre/salida" options={{ headerShown: false }} />

      {/* Pantalla de Historial (Torre Mia) */}
      <Stack.Screen name="torre/historial" options={{ headerShown: false }} />

      {/* Pantalla principal de Cafetería */}
      <Stack.Screen name="cafeteria/index" options={{ headerShown: false }} />

      {/* Pantalla de Registrar entrega (Cafetería) */}
      <Stack.Screen name="cafeteria/registrar" options={{ headerShown: false }} />

      {/* Pantalla de Historial (Cafetería) */}
      <Stack.Screen name="cafeteria/historial" options={{ headerShown: false }} />
    </Stack>
  );
}
