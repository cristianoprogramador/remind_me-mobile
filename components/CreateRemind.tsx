import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  Text,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { CategoryOption, Annotation } from "@/types";
import CategorySelect from "@/components/CategorySelect";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CreateRemindProps {
  onCreate: (newAnnotation: Annotation) => void;
}

export default function CreateRemind({ onCreate }: CreateRemindProps) {
  const [content, setContent] = useState<string>("");
  const [remindAt, setRemindAt] = useState<Date | null>(new Date());
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption | null>(null);
  const [fixedUserId, setFixedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;
        if (user && user.uuid) {
          setFixedUserId(user.uuid);
          setSelectedUserIds([user.uuid]);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário do AsyncStorage", error);
      }
    };

    fetchUserId();
  }, []);

  const handleCreateAnnotation = async () => {
    if (!content || !remindAt) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha todos os campos obrigatórios."
      );
      return;
    }

    const remindAtUTC = remindAt.toISOString();

    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`http://192.168.15.72:3333/annotations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          remindAt: remindAtUTC,
          categoryId: selectedCategory?.value,
          relatedUserIds: selectedUserIds.filter((id) => id !== fixedUserId),
        }),
      });

      if (!res.ok) {
        throw new Error("Falha ao criar a anotação");
      }

      const newAnnotation = await res.json();
      onCreate(newAnnotation);

      setContent("");
      setRemindAt(new Date());
      setSelectedCategory(null);
      setSelectedUserIds([fixedUserId]);

      Alert.alert("Sucesso", "Lembrete criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar anotação:", error);
      Alert.alert("Erro", "Erro ao criar anotação");
    }
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: remindAt || new Date(),
      onChange: handleDateChange,
      mode: "date",
      is24Hour: true,
    });
  };

  const showTimePicker = () => {
    DateTimePickerAndroid.open({
      value: remindAt || new Date(),
      onChange: handleTimeChange,
      mode: "time",
      is24Hour: true,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setRemindAt((prev) => {
        const updatedDate = new Date(prev || selectedDate);
        updatedDate.setFullYear(selectedDate.getFullYear());
        updatedDate.setMonth(selectedDate.getMonth());
        updatedDate.setDate(selectedDate.getDate());
        return updatedDate;
      });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setRemindAt((prev) => {
        const updatedTime = new Date(prev || selectedTime);
        updatedTime.setHours(selectedTime.getHours());
        updatedTime.setMinutes(0);
        return updatedTime;
      });
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Escolha uma data";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Escolha uma hora";
    return `${date.getHours()}:00`;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        placeholder="Eu preciso lembrar de..."
        placeholderTextColor="#666"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      <View style={styles.separator} />

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showDatePicker}
        >
          <Text style={styles.datePickerText}>
            {remindAt ? formatDateTime(remindAt) : "Escolha uma data"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showTimePicker}
        >
          <Text style={styles.datePickerText}>
            {remindAt ? formatTime(remindAt) : "Escolha uma hora"}
          </Text>
        </TouchableOpacity>
      </View>

      <CategorySelect
        selectedCategory={selectedCategory}
        onChange={setSelectedCategory}
      />

      <View style={styles.buttonContainer}>
        <Button title="Criar" onPress={handleCreateAnnotation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    marginBottom: 20,
  },
  textArea: {
    borderColor: "#DDD",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF",
    fontSize: 16,
    textAlignVertical: "top",
  },
  separator: {
    height: 1,
    backgroundColor: "#CCC",
    marginVertical: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF",
    flex: 1,
    marginRight: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 20,
  },
});
