import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
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
import { Friend, Friendship, UserProps } from "@/types";

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
      setReceivedRequests(receivedRequests);
      setSentRequests(sentRequests);
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

      const data = await res.json();
      setFriends(data);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendContainer}>
      {item.profileImageUrl ? (
        <Image
          source={{ uri: item.profileImageUrl }}
          style={styles.profileImage}
        />
      ) : (
        <FontAwesome name="user" size={48} color="gray" />
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
    <View style={styles.container}>
      <Text style={styles.title}>Amigos</Text>

      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <>
            {/* <SearchFriend /> */}
            <Text style={styles.subtitle}>
              Solicitações de Amizade Recebidas
            </Text>
            <FlatList
              data={receivedRequests}
              renderItem={({ item }) => (
                <View style={styles.requestContainer}>
                  <Text>{item.name}</Text>
                  <Button
                    title="Aceitar"
                    onPress={() => handleResponse(item.uuid, true)}
                  />
                  <Button
                    title="Rejeitar"
                    onPress={() => handleResponse(item.uuid, false)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.uuid}
              horizontal
            />
            <Text style={styles.subtitle}>
              Solicitações de Amizade Enviadas
            </Text>
            <FlatList
              data={sentRequests}
              renderItem={({ item }: { item: Friend }) => (
                <View style={styles.requestContainer}>
                  <Text>{item.name}</Text>
                  <Text>Aguardando resposta...</Text>
                </View>
              )}
              keyExtractor={(item) => item.uuid}
              horizontal
            />
          </>
        }
      />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
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
    fontSize: 14,
    color: "black",
  },
  requestContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 10,
  },
});
