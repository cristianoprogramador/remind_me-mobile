import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

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
  const [countryCode, setCountryCode] = useState("+55");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneNumberChange = (text: string) => {
    const formattedText = text.replace(/\D/g, "").slice(0, 11);
    setPhoneNumber(formattedText);
  };

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

        const data = await res.json();

        if (!data.notificationsEmpty) {
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
    const token = await AsyncStorage.getItem("access_token");

    const hasNameChanged = name !== originalName;
    const hasPhoneChanged = phoneNumber !== originalPhone;
    const hasEmailNotificationsChanged =
      emailNotifications !== originalEmailNotifications;
    const hasPhoneNotificationsChanged =
      phoneNotifications !== originalPhoneNotifications;
    const hasNotificationsEnabledChanged =
      notificationsEnabled !== originalNotificationsEnabled;
    const hasWeeklySummaryChanged = weeklySummary !== originalWeeklySummary;

    // Se nenhuma alteração foi feita, não faça a chamada de API
    if (
      !hasNameChanged &&
      !hasPhoneChanged &&
      !hasEmailNotificationsChanged &&
      !hasPhoneNotificationsChanged &&
      !hasNotificationsEnabledChanged &&
      !hasWeeklySummaryChanged
    ) {
      ToastAndroid.show("Nenhuma atualização detectada!", ToastAndroid.SHORT);
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert("Erro", "Por favor, insira um número de telefone válido.");
      return;
    }
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      // Atualiza o nome do usuário se foi alterado
      if (hasNameChanged) {
        const resName = await fetch(`http://192.168.15.72:3333/user/name`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        });

        if (!resName.ok) {
          throw new Error("Failed to update user name");
        }

        // fazer uma atualização do nome no AsyncStorage.getItem("user");

        ToastAndroid.show("Nome atualizado com sucesso!", ToastAndroid.SHORT);
      }

      // Atualiza ou cria as configurações de notificação se alguma delas foi alterada
      if (
        hasPhoneChanged ||
        hasEmailNotificationsChanged ||
        hasPhoneNotificationsChanged ||
        hasNotificationsEnabledChanged ||
        hasWeeklySummaryChanged
      ) {
        const notificationEndpoint = notificationExists
          ? `http://192.168.15.72:3333/notifications`
          : `http://192.168.15.72:3333/notifications`;

        const method = notificationExists ? "PUT" : "POST";

        const resNotification = await fetch(notificationEndpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emailNotify: emailNotifications,
            phoneNotify: phoneNotifications,
            phoneNumber: fullPhoneNumber,
            weeklySummary: emailNotifications ? weeklySummary : false,
          }),
        });

        if (!resNotification.ok) {
          throw new Error("Failed to update notification settings");
        }

        ToastAndroid.show("Atualizado com sucesso!", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      ToastAndroid.show("Erro ao atualizar!", ToastAndroid.SHORT);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{color: "#fffF"}}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Página de Perfil</Text>

        <View style={styles.fieldContainer}>
          <View style={styles.nameFieldContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.emailFieldContainer}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
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
          <View style={styles.emailFieldContainer}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.phoneContainer}>
              <Picker
                selectedValue={countryCode}
                style={styles.picker}
                onValueChange={(itemValue) => setCountryCode(itemValue)}
              >
                <Picker.Item style={{ fontSize: 14 }} label="+1" value="+1" />
                <Picker.Item style={{ fontSize: 14 }} label="+44" value="+44" />
                <Picker.Item style={{ fontSize: 14 }} label="+55" value="+55" />
                <Picker.Item style={{ fontSize: 14 }} label="+91" value="+91" />
              </Picker>
              <TextInput
                style={styles.inputPhone}
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="Número de telefone"
                maxLength={11}
              />
            </View>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Notificações por SMS</Text>
            <Switch
              value={phoneNotifications}
              onValueChange={setPhoneNotifications}
              disabled={!notificationsEnabled}
            />
          </View>
        </View>

        <View>
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
        </View>

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
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  fieldContainer: {
    borderWidth: 1,
    padding: 10,
    width: "100%",
    borderRadius: 10,
  },
  nameFieldContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: 5,
  },
  phoneContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    fontSize: 12,
  },
  emailFieldContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    fontSize: 14,
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
  inputPhone: {
    height: 40,
    width: 170,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
    fontSize: 12,
  },
  emailText: {
    fontSize: 16,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    width: 110,
    height: 50,
    fontSize: 10,
    padding: 0,
    margin: 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
