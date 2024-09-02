// app/(auth)/index.tsx

import React, { useState } from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // Realize a requisição ao backend para autenticação
      const response = await fetch("http://192.168.15.72:3333/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salve o token no AsyncStorage
        await AsyncStorage.setItem("access_token", data.access_token);
        // Redirecione para a página inicial
        router.replace("/(tabs)");
      } else {
        Alert.alert("Erro", "Credenciais inválidas");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Algo deu errado. Tente novamente.");
    }
  };

  // Função para navegar para a tela de cadastro
  const handleSignupNavigation = () => {
    router.push("/(auth)/signup" as any);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          width: "80%",
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: "80%",
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
      />
      <Button title="Login" onPress={handleLogin} />

      {/* Botão para navegar para a página de cadastro */}
      <TouchableOpacity
        onPress={handleSignupNavigation}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "blue" }}>Cadastrar-se</Text>
      </TouchableOpacity>
    </View>
  );
}
