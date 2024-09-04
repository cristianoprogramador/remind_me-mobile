import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SearchResult } from "@/types";
import { useFocusEffect } from "@react-navigation/native";

export function SearchFriend() {
  const [email, setEmail] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setSearchResult(null);
      setError("");
      setIsPending(false);
      setLoading(false);
    }, [])
  );

  const handleSearch = async () => {
    setError("");
    setSearchResult(null);
    setIsPending(false);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(
        `http://192.168.15.72:3333/friendship/search?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Usuário não encontrado");
      }

      const data: SearchResult = await res.json();
      setSearchResult(data);
    } catch (err) {
      setError("Usuário não encontrado ou ocorreu um erro");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`http://192.168.15.72:3333/friendship/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendEmail: email }),
      });

      if (!res.ok) {
        throw new Error("Erro ao enviar solicitação de amizade");
      }

      setIsPending(true);
      Alert.alert("Sucesso", "Solicitação de amizade enviada com sucesso");
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Buscar por e-mail..."
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Exibindo erros */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Loader de atividade */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Resultados da busca */}
      {searchResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultados:</Text>
          <View style={styles.resultContent}>
            {searchResult.profileImageUrl ? (
              <Image
                source={{ uri: searchResult.profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <FontAwesome name="user" size={48} color="gray" />
            )}
            <View>
              <Text style={styles.resultName}>{searchResult.name}</Text>
              <Text style={styles.resultEmail}>{searchResult.email}</Text>
            </View>
            {searchResult.status ? (
              <Text style={styles.statusText}>
                {searchResult.status === "PENDING"
                  ? "Aguardando resposta"
                  : searchResult.status === "ACCEPTED"
                  ? "Já são amigos"
                  : "Solicitação rejeitada"}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => handleAddFriend(searchResult.uuid)}
                style={styles.addButton}
                disabled={isPending}
              >
                <Text style={styles.addButtonText}>
                  {isPending ? "Aguardando" : "Adicionar"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  searchButton: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  resultContainer: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F0F0F0",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  resultContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultEmail: {
    color: "gray",
  },
  statusText: {
    marginLeft: "auto",
    fontSize: 14,
    color: "gray",
  },
  addButton: {
    backgroundColor: "#32CD32",
    padding: 10,
    borderRadius: 8,
    marginLeft: "auto",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
