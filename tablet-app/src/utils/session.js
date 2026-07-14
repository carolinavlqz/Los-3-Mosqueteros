import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_KEY = '@medica_mia_session';

export const saveSession = (user) => AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
export const getSession = async () => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearSession = () => AsyncStorage.removeItem(SESSION_KEY);
