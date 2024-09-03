// app/(auth)/index.tsx

import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://192.168.15.72:3333/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("access_token", data.access_token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        router.replace("/(tabs)");
      } else {
        Alert.alert("Erro", "Credenciais inválidas");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Algo deu errado. Tente novamente.");
    }
  };

  const handleSignupNavigation = () => {
    router.push("/(auth)/signup" as any);
  };

  return (
    <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Acesse a conta!</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#A9A9A9"
        />
        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Ou entre com</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="github" size={24} color="white" />
            <Text style={styles.socialButtonText}>GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButtonGoogle}>
            <FontAwesome name="google" size={24} color="white" />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupPrompt}>Ainda não tem conta?</Text>
          <TouchableOpacity onPress={handleSignupNavigation}>
            <Text style={styles.signupText}>Cadastrar-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#A9A9A9",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#A9A9A9",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    width: "48%",
    height: 50,
    gap: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialButtonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff0000ca",
    width: "48%",
    height: 50,
    gap: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signup: {
    marginTop: 20,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  signupPrompt: {
    color: "#333",
    fontSize: 16,
  },
  signupText: {
    color: "#1E90FF",
    fontSize: 16,
    marginLeft: 5,
  },
});
