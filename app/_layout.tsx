// app/_layout.tsx

import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erro ao verificar token de autenticação", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
