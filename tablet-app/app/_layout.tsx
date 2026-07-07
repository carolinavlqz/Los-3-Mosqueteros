import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Pantalla principal de inicio */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Pantalla de Check In */}
      <Stack.Screen name="check-in" options={{ headerShown: false }} />
    </Stack>
  );
}
