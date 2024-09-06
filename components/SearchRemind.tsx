import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import CategorySelect from "./CategorySelect";
import { CategoryOption } from "@/types";

export function SearchRemind({
  onSearch,
}: {
  onSearch: (query: string, categoryId: string | null) => void;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption | null>(null);  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleCategoryChange = (itemValue: CategoryOption | null) => {
    setSelectedCategory(itemValue);
  };

  const handleSearch = () => {
    const categoryId = selectedCategory ? selectedCategory.value : null;
    onSearch(searchQuery, categoryId);
  };

  const toggleCategoryPicker = () => {
    setShowCategoryPicker(!showCategoryPicker);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por..."
          placeholderTextColor="#000000"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        <TouchableOpacity
          onPress={toggleCategoryPicker}
          style={{ marginRight: 10 }}
        >
          <FontAwesome name="filter" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>
      {showCategoryPicker && (
        <CategorySelect
        selectedCategory={selectedCategory}
        onChange={handleCategoryChange}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  categorySelect: {
    height: 40,
    color: "#fff",
  },
  searchButton: {
    height: 40,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
