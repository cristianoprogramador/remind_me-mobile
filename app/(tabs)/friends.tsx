import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { Friend, Friendship } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { SearchFriend } from "@/components/SearchFriend";

export default function FriendsPage() {
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`http://192.168.15.72:3333/friendship/requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friend requests");
      }

      const { receivedRequests, sentRequests } = await res.json();

      const mappedReceivedRequests = receivedRequests.map((request: any) => ({
        uuid: request.uuid,
        name: request.user1.name,
        email: request.user1.email,
        profileImageUrl: request.user1.profileImageUrl,
      }));

      const mappedSentRequests = sentRequests.map((request: any) => ({
        uuid: request.uuid,
        name: request.user2.name,
        email: request.user2.email,
        profileImageUrl: request.user2.profileImageUrl,
      }));

      setReceivedRequests(mappedReceivedRequests);
      setSentRequests(mappedSentRequests);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`http://192.168.15.72:3333/friendship/friends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data: Friendship[] = await res.json();

      const userString = await AsyncStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      const friendsList = data.map((friendship) => {
        return friendship.user1.uuid === user.uuid
          ? friendship.user2
          : friendship.user1;
      });

      setFriends(friendsList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(
        `http://192.168.15.72:3333/friendship/${friendId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to unfriend");
      }

      Alert.alert("Amizade desfeita com sucesso!");
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.uuid !== friendId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(
        `http://192.168.15.72:3333/friendship/respond/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ accept }),
        }
      );

      if (res.ok) {
        const acceptedRequest = receivedRequests.find(
          (request) => request.uuid === requestId
        );
        if (acceptedRequest) {
          setFriends((prevFriends) => [...prevFriends, acceptedRequest]);
        }

        setReceivedRequests((prevRequests) =>
          prevRequests.filter((request) => request.uuid !== requestId)
        );
      } else {
        console.error("Failed to respond to friend request");
      }
    } catch (error) {
      console.error(error);
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

  const renderRequestItem = ({ item }: { item: Friend }) => (
    <View style={styles.requestContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
      <View style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Button
          title="Aceitar"
          color="#079e14"
          onPress={() => handleResponse(item.uuid, true)}
        />
        <Button
          title="Rejeitar"
          color="#ff5c5c"
          onPress={() => handleResponse(item.uuid, false)}
        />
      </View>
    </View>
  );

  const renderSentRequestItem = ({ item }: { item: Friend }) => (
    <View style={styles.requestContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
      <Text>Aguardando resposta...</Text>
    </View>
  );

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendContainer}>
      {item.profileImageUrl ? (
        <Image
          source={{ uri: item.profileImageUrl }}
          style={styles.profileImage}
        />
      ) : (
        <View style={{ marginRight: 20 }}>
          <FontAwesome name="user" size={48} color="gray" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
      <Button
        title="Excluir"
        color="#ff5c5c"
        onPress={() => handleUnfriend(item.uuid)}
      />
    </View>
  );

  return (
    <LinearGradient colors={["#0F172A", "#334155"]} style={styles.gradient}>
      <View style={styles.container}>
        <SearchFriend />
        {/* Solicitações de Amizade Recebidas */}
        {receivedRequests.length > 0 && (
          <>
            <Text style={styles.subtitle}>
              Solicitações de Amizade Recebidas
            </Text>
            <FlatList
              data={receivedRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.uuid}
            />
          </>
        )}

        {/* Solicitações de Amizade Enviadas */}
        {sentRequests.length > 0 && (
          <>
            <Text style={styles.subtitle}>
              Solicitações de Amizade Enviadas
            </Text>
            <FlatList
              data={sentRequests}
              renderItem={renderSentRequestItem}
              keyExtractor={(item) => item.uuid}
            />
          </>
        )}

        {/* Lista de Amigos */}
        <Text style={styles.title}>Lista de Amigos</Text>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.uuid}
        />
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
    flex: 1,
    paddingTop: 60,
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 10,
  },
  requestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#FFF",
    borderRadius: 8,
    flex: 1,
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  friendEmail: {
    fontSize: 12,
    color: "#666",
  },
});
