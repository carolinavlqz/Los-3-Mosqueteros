import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  ImageBackground,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { getSession, saveSession } from "../utils/session";

const FONDO_PANTALLA = require("../../assets/images/sala-tac8.png");

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AREA_ROUTES = {
  hospital: "/hospital",
  consultorios: "/torre",
  cafeteria: "/cafeteria",
};

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;
const MAX_CONTENT_WIDTH_PHONE = 440;
const MAX_CONTENT_WIDTH_TABLET = 760; // Ampliado para soportar el diseño de doble columna en tabletas

function useScale() {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = width >= TABLET_BREAKPOINT;

  // Si está en horizontal, permitimos un contenedor más ancho
  const contentWidth = isLandscape
    ? Math.min(width * 0.9, MAX_CONTENT_WIDTH_TABLET)
    : isTablet
    ? Math.min(width * 0.85, MAX_CONTENT_WIDTH_PHONE * 1.1)
    : Math.min(width * 0.92, MAX_CONTENT_WIDTH_PHONE);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(0.85, Math.min(rawScale, 1.15));

  return {
    width,
    height,
    scale,
    isTablet,
    isLandscape,
    contentWidth,
  };
}

export default function LoginScreen() {
  const router = useRouter();
  const { scale, contentWidth, isLandscape } = useScale();
  const s = createStyles(scale, isLandscape);

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getSession()
      .then((session) => {
        if (!session) return;
        const destino = AREA_ROUTES[session.area];
        if (destino) router.replace(destino);
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate, {
        toValue: 0,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const validarFormulario = () => {
    if (usuario.trim() === "") {
      Alert.alert("Campo requerido", "Ingrese su usuario.");
      return false;
    }
    if (password.trim() === "") {
      Alert.alert("Campo requerido", "Ingrese su contraseña.");
      return false;
    }
    return true;
  };

  const iniciarSesion = async () => {
    if (!validarFormulario()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert("Error", data.mensaje || "Usuario o contraseña incorrectos.");
        return;
      }

      const destino = AREA_ROUTES[data.user.area];
      if (!destino) {
        Alert.alert("Módulo no disponible", "Este módulo aún no está disponible. Vuelve pronto.");
        return;
      }

      await saveSession(data.user);
      router.replace(destino);
    } catch (error) {
      Alert.alert("Error", "No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const recuperarPassword = () => {
    Alert.alert("Próximamente", "Este módulo será implementado.");
  };

  if (checkingSession) {
    return (
      <ImageBackground source={FONDO_PANTALLA} style={s.backgroundImage} resizeMode="cover">
        <SafeAreaView style={[s.safeArea, s.splash]}>
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <ActivityIndicator size="large" color="#FFFFFF" />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={FONDO_PANTALLA}
      style={s.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={s.safeArea}>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[s.container, { width: contentWidth }]}>
              <Animated.View
                style={[
                  s.animatedCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: cardTranslate }],
                  },
                ]}
              >
                <BlurView 
                  intensity={Platform.OS === 'ios' ? 45 : 70} 
                  tint="dark" 
                  style={s.card}
                >
                  
                  {/* Contenedor flexible que cambia a fila en landscape */}
                  <View style={s.contentLayout}>
                    
                    {/* Columna Izquierda: Logo y Títulos */}
                    <View style={s.leftColumn}>
                      <View style={s.header}>
                        <View style={s.logoMockContainer}>
                          <Ionicons name="medical" size={44 * scale} color="#FFFFFF" />
                          <View style={s.logoPill} />
                        </View>
                        <Text style={s.hospital}>MÉDICA MIA</Text>
                        <Text style={s.subtitle}>
                          Sistema Integral de Control de Visitas
                        </Text>
                      </View>
                    </View>

                    {/* Columna Derecha: Formulario */}
                    <View style={s.rightColumn}>
                      {/* USUARIO */}
                      <Text style={s.label}>User</Text>
                      <View
                        style={[
                          s.inputContainer,
                          focusedInput === "usuario" && s.inputContainerFocused,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20 * scale}
                          color={focusedInput === "usuario" ? "#FFFFFF" : "#cbd5e1"}
                        />
                        <TextInput
                          style={s.input}
                          placeholder="Ingrese su usuario"
                          placeholderTextColor="#94a3b8"
                          autoCapitalize="none"
                          value={usuario}
                          onChangeText={setUsuario}
                          onFocus={() => setFocusedInput("usuario")}
                          onBlur={() => setFocusedInput("")}
                        />
                      </View>

                      {/* CONTRASEÑA */}
                      <Text style={s.label}>Password</Text>
                      <View
                        style={[
                          s.inputContainer,
                          focusedInput === "password" && s.inputContainerFocused,
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={20 * scale}
                          color={focusedInput === "password" ? "#FFFFFF" : "#cbd5e1"}
                        />
                        <TextInput
                          style={s.input}
                          placeholder="Ingrese su contraseña"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!mostrarPassword}
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput("")}
                        />
                        <TouchableOpacity
                          onPress={() => setMostrarPassword(!mostrarPassword)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
                            size={20 * scale}
                            color="#cbd5e1"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* RECUPERAR CONTRASEÑA */}
                      <TouchableOpacity onPress={recuperarPassword}>
                        <Text style={s.forgot}>¿Olvidó su contraseña?</Text>
                      </TouchableOpacity>

                      {/* BOTÓN INICIAR SESIÓN */}
                      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPressIn={pressIn}
                          onPressOut={pressOut}
                          onPress={iniciarSesion}
                          style={s.loginButton}
                        >
                          {loading ? (
                            <ActivityIndicator color="#031e5d" />
                          ) : (
                            <>
                              <Ionicons name="log-in-outline" color="#031e5d" size={20 * scale} />
                              <Text style={s.loginText}>Iniciar Sesión</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </Animated.View>
                    </View>

                  </View>

                  {/* ================= FOOTER INTERNO ================= */}
                  <View style={s.footerContainer}>
                    <Text style={s.version}>
                      Versión 1.0 <Text style={s.bullet}>•</Text> © 2026 Médica MIA
                    </Text>
                  </View>

                </BlurView>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const createStyles = (scale, isLandscape) =>
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    safeArea: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    splash: {
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 32 * scale,
    },
    container: {
      alignItems: "center",
      width: "100%",
    },
    animatedCard: {
      width: "100%",
      borderRadius: 28,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 8 },
        },
        android: {
          elevation: 6,
        },
      }),
    },
    card: {
      width: "100%",
      // Si está en horizontal, reducimos un poco el padding vertical para evitar scroll innecesario
      paddingHorizontal: (isLandscape ? 32 : 24) * scale,
      paddingTop: (isLandscape ? 24 : 32) * scale,
      paddingBottom: (isLandscape ? 20 : 28) * scale,
      backgroundColor: "rgba(255, 255, 255, 0.12)", 
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.25)",
    },

    /*************************
     * LAYOUT RESPONSIVO
     *************************/
    contentLayout: {
      flexDirection: isLandscape ? "row" : "column",
      alignItems: isLandscape ? "center" : "stretch",
      justifyContent: "space-between",
    },
    leftColumn: {
      flex: isLandscape ? 1 : undefined,
      paddingRight: isLandscape ? 30 * scale : 0,
      marginBottom: isLandscape ? 0 : 20 * scale,
    },
    rightColumn: {
      flex: isLandscape ? 1.2 : undefined,
    },

    /*************************
     * HEADER
     *************************/
    header: {
      alignItems: "center",
    },
    logoMockContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8 * scale,
    },
    logoPill: {
      width: 10 * scale,
      height: 10 * scale,
      borderRadius: 5 * scale,
      backgroundColor: "#e11d48", 
      marginLeft: 4,
      marginTop: -20 * scale,
    },
    hospital: {
      color: "#FFFFFF",
      fontSize: 28 * scale,
      fontWeight: "800",
      letterSpacing: 1.2,
      textAlign: "center",
    },
    subtitle: {
      color: "#e2e8f0",
      fontSize: 14 * scale,
      textAlign: "center",
      marginTop: 4 * scale,
      fontWeight: "600",
    },

    /*************************
     * LABELS & INPUTS
     *************************/
    label: {
      fontSize: 14 * scale,
      fontWeight: "700",
      color: "#f8fafc",
      marginBottom: 6 * scale,
      marginTop: isLandscape ? 4 * scale : 12 * scale,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 14,
      paddingHorizontal: 14 * scale,
      height: 54 * scale,
    },
    inputContainerFocused: {
      borderColor: "rgba(255, 255, 255, 0.6)",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    input: {
      flex: 1,
      marginLeft: 10 * scale,
      fontSize: 15 * scale,
      color: "#FFFFFF",
      fontWeight: "500",
    },

    /*************************
     * ACCIONES
     *************************/
    forgot: {
      alignSelf: "center",
      marginTop: 14 * scale,
      color: "#f1f5f9",
      fontWeight: "700",
      fontSize: 13 * scale,
      marginBottom: 20 * scale,
      textDecorationLine: "underline",
    },
    loginButton: {
      height: 54 * scale,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
    },
    loginText: {
      color: "#031e5d",
      fontWeight: "700",
      fontSize: 16 * scale,
      marginLeft: 8,
    },

    /*************************
     * FOOTER
     *************************/
    footerContainer: {
      marginTop: isLandscape ? 16 * scale : 28 * scale,
      alignItems: "center",
    },
    version: {
      color: "#cbd5e1",
      fontWeight: "600",
      fontSize: 12 * scale,
    },
    bullet: {
      color: "#64748b",
      marginHorizontal: 4,
    },
  });
