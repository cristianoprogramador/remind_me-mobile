import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Annotation } from "@/types";
import { Pagination } from "@/components/Pagination";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SearchRemind } from "@/components/SearchRemind";

export default function SearchPage() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const fetchAnnotations = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(
        `http://192.168.15.72:3333/annotations/search?query=${searchQuery}&categoryId=${categoryId}&page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch annotations");
      }

      const { annotations, totalCount } = await res.json();
      setAnnotations(annotations);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching annotations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnotations();
  }, [page, limit, searchQuery, categoryId]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (query: string, categoryId: string | null) => {
    setSearchQuery(query);
    setCategoryId(categoryId);
    setPage(1);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const renderAnnotations = ({ item }: { item: Annotation }) => {
    const handleShowCategory = () => {
      if (item.category) {
        Alert.alert("Categoria", item.category.name);
      } else {
        Alert.alert("Sem categoria", "Esta anotação não tem uma categoria.");
      }
    };

    const handleShowAuthor = () => {
      Alert.alert("Criador", `Autor: ${item.author.name}`);
    };

    const handleShowRelatedUsers = () => {
      if (item.relatedUsers && item.relatedUsers.length > 0) {
        const userNames = item.relatedUsers
          .map((user) => user.user.name)
          .join(", ");
        Alert.alert("Participantes", `Usuários relacionados: ${userNames}`);
      } else {
        Alert.alert(
          "Sem participantes",
          "Esta anotação não tem participantes."
        );
      }
    };

    return (
      <View style={styles.requestContainer}>
        <View style={{display: "flex", flexDirection: "row"}}>
          <View style={styles.schedules}>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Criado em:</Text>
              <Text style={styles.dateText}>
                {formatDateTime(item.createdAt)}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Lembrar em:</Text>
              <Text style={styles.remindText}>
                {formatDateTime(item.remindAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleShowCategory}>
            <FontAwesome name="edit" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.contentText}>{item.content}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleShowCategory}>
            <FontAwesome name="tags" size={15} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShowAuthor}>
            <FontAwesome name="user" size={15} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShowRelatedUsers}>
            <FontAwesome name="users" size={15} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Buscar Lembrete</Text>
        <SearchRemind onSearch={handleSearch} />

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            <FlatList
              data={annotations}
              renderItem={renderAnnotations}
              keyExtractor={(item) => item.uuid}
            />
            <Pagination
              totalCount={totalCount}
              currentPage={page}
              pageSize={limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  container: {
    width: "90%",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
  },
  schedules: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flex: 1,
  },
  requestContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateContainer: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#666666",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  remindText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  contentText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 20,
  },
});
