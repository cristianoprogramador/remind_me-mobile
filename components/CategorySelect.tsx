import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

interface CategoryOption {
  label: string;
  value: string;
}

interface CategorySelectProps {
  selectedCategory: CategoryOption | null;
  onChange: (category: CategoryOption | null) => void;
}

export default function CategorySelect({
  selectedCategory,
  onChange,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>(
    selectedCategory?.value || ""
  );

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`http://192.168.15.72:3333/category`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();

        const mappedCategories = data.map((category: any) => ({
          label: category.name,
          value: category.uuid,
        }));
        setCategories(mappedCategories);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryChange = (itemValue: string) => {
    if (itemValue === "") {
      setSelectedValue("");
      onChange(null);
    } else {
      const category =
        categories.find((cat) => cat.value === itemValue) || null;
      setSelectedValue(itemValue);
      onChange(category);
    }
  };

  const handleCreateCategory = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;

    if (!newCategory.trim()) {
      Alert.alert("Erro", "Nome da categoria não pode estar vazio.");
      return;
    }

    try {
      const res = await fetch(`http://192.168.15.72:3333/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!res.ok) {
        throw new Error("Failed to create category");
      }

      const createdCategory = {
        label: newCategory,
        value: (await res.json()).uuid,
      };

      setCategories((prevCategories) => [...prevCategories, createdCategory]);
      handleCategoryChange(createdCategory.value);
      setModalVisible(false);
      setNewCategory("");
      Alert.alert("Sucesso", "Categoria criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      Alert.alert("Erro", "Não foi possível criar a categoria.");
    }
  };

  const clearSelection = () => {
    setSelectedValue("");
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={handleCategoryChange}
            style={styles.picker}
          >
            <Picker.Item
              style={{ fontSize: 12, flex: 1, width: "100%" }}
              label="Selecione categoria"
              value=""
            />
            {categories.map((category) => (
              <Picker.Item
                style={{ fontSize: 12 }}
                key={category.value}
                label={category.label}
                value={category.value}
              />
            ))}
          </Picker>
        </View>
        <TouchableOpacity onPress={clearSelection}>
          <FontAwesome
            name="times"
            size={20}
            color="#ff0000"
            style={{ marginHorizontal: 10 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Criar Categoria</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para criar nova categoria */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Nova Categoria</Text>
            <TextInput
              placeholder="Nome da nova categoria"
              value={newCategory}
              onChangeText={setNewCategory}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button title="Criar" onPress={handleCreateCategory} />
              <Button
                title="Cancelar"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderColor: "#4b4b4b",
    borderWidth: 1,
  },
  picker: {
    height: 40,
    fontSize: 10,
    padding: 0,
    margin: 0,
  },
  createButton: {
    backgroundColor: "#1E90FF",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
