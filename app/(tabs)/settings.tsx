import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function SettingsScreen() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("pt-BR");
  const router = useRouter();

  const handleReportProblem = () => {
    Linking.openURL("https://www.cristianosilvadev.com.br");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      router.replace("/(auth)");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair da conta. Tente novamente.");
    }
  };

  return (
    <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.header}>Configurações</Text>

        {/* Tema */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Tema</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={theme}
              onValueChange={(itemValue) => setTheme(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Modo Claro" value="light" />
              <Picker.Item label="Modo Escuro" value="dark" />
            </Picker>
          </View>
        </View>

        {/* Idioma */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Idioma</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              onValueChange={(itemValue) => setLanguage(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Português (Brasil)" value="pt-BR" />
              <Picker.Item label="Inglês (EUA)" value="en-US" />
            </Picker>
          </View>
        </View>

        {/* Reportar Problema */}
        <TouchableOpacity
          style={styles.buttonReport}
          onPress={handleReportProblem}
        >
          <Text style={styles.buttonText}>Reportar Problema</Text>
        </TouchableOpacity>

        {/* Excluir Conta */}
        <TouchableOpacity style={[styles.button, styles.deleteButton]}>
          <Text style={styles.buttonText}>Excluir Conta</Text>
        </TouchableOpacity>

        {/* Botão de Logout */}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  pickerWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: "#b9b7b7",
    borderRadius: 10,
    borderColor: "#4b4b4b",
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    width: "90%",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonReport: {
    width: "90%",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: "#115bca",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
