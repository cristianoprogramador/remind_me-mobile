// app/(auth)/signup.tsx

import React, { useState } from "react";
import { Button, Text, TextInput, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não correspondem");
      return;
    }

    try {
      const response = await fetch("http://192.168.15.72:3333/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("access_token", data.access_token);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Erro", "Não foi possível criar a conta. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Algo deu errado. Tente novamente.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Signup</Text>
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
      <TextInput
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{
          width: "80%",
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
      />
      <Button title="Cadastrar" onPress={handleSignup} />
    </View>
  );
}
