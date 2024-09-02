import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router"; // Importando o useRouter
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importando AsyncStorage

export default function SettingsScreen() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("pt-BR");
  const [token, setToken] = useState(null);
  const router = useRouter(); // Inicialize o useRouter

  // useEffect(() => {
  //   const fetchToken = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("access_token");
  //       setToken(token);
  //       console.log("Token fetched:", token);
  //     } catch (error) {
  //       console.error("Erro ao buscar o token:", error);
  //     }
  //   };

  //   fetchToken(); // Chame a função ao montar o componente
  // }, []);

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
    <View style={styles.container}>
      <Text style={styles.header}>Página de Perfil</Text>

      {/* Tema */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tema</Text>
        <Picker
          selectedValue={theme}
          onValueChange={(itemValue) => setTheme(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Modo Claro" value="light" />
          <Picker.Item label="Modo Escuro" value="dark" />
        </Picker>
      </View>

      {/* Idioma */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Idioma</Text>
        <Picker
          selectedValue={language}
          onValueChange={(itemValue) => setLanguage(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Português (Brasil)" value="pt-BR" />
          <Picker.Item label="Inglês (EUA)" value="en-US" />
        </Picker>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  pickerContainer: {
    width: "90%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 8,
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
