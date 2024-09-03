import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [originalWeeklySummary, setOriginalWeeklySummary] = useState(false);
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [originalNotificationsEnabled, setOriginalNotificationsEnabled] =
    useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [originalEmailNotifications, setOriginalEmailNotifications] =
    useState(false);
  const [phoneNotifications, setPhoneNotifications] = useState(false);
  const [originalPhoneNotifications, setOriginalPhoneNotifications] =
    useState(false);
  const [notificationExists, setNotificationExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const userString = await AsyncStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;

        if (!token || !user) {
          Alert.alert("Erro", "Usuário não autenticado.");
          router.replace("/(auth)");
          return;
        }

        setName(user.name);
        setOriginalName(user.name);
        setEmail(user.email);

        const res = await fetch(`http://192.168.15.72:3333/notifications`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();

          setNotificationsEnabled(data.emailNotify || data.phoneNotify);
          setEmailNotifications(data.emailNotify);
          setPhoneNotifications(data.phoneNotify);
          setWeeklySummary(data.weeklySummary || false);
          setPhone(data.phoneNumber || "");

          setOriginalNotificationsEnabled(data.emailNotify || data.phoneNotify);
          setOriginalEmailNotifications(data.emailNotify);
          setOriginalPhoneNotifications(data.phoneNotify);
          setOriginalWeeklySummary(data.weeklySummary || false);
          setOriginalPhone(data.phoneNumber || "");

          setNotificationExists(true);
        } else {
          setNotificationExists(false);
        }
      } catch (error) {
        console.error("Erro ao buscar configurações de notificação:", error);
        setNotificationExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleUpdateProfile = async () => {
    // Implemente a lógica de atualização de perfil
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Página de Perfil</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.emailText}>{email}</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Notificações por e-mail</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              disabled={!notificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            editable={notificationsEnabled}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Notificações por SMS</Text>
            <Switch
              value={phoneNotifications}
              onValueChange={setPhoneNotifications}
              disabled={!notificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Ativar Notificações</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {emailNotifications && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Resumo Semanal</Text>
            <Switch value={weeklySummary} onValueChange={setWeeklySummary} />
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Atualizar</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  emailText: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
