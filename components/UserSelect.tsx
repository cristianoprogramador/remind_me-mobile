import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Friend } from "@/types";
import { useEffect, useState } from "react";

interface UserSelectProps {
  selectedUserIds: string[];
  onChange: (ids: string[]) => void;
  fixedUserId: string;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export default function UserSelect({
  selectedUserIds,
  onChange,
  fixedUserId,
  modalVisible,
  setModalVisible,
}: UserSelectProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
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

        const mappedFriends = data.map((friendship: any) => {
          return {
            uuid:
              friendship.user1Id === fixedUserId
                ? friendship.user2.uuid
                : friendship.user1.uuid,
            name:
              friendship.user1Id === fixedUserId
                ? friendship.user2.name
                : friendship.user1.name,
            email:
              friendship.user1Id === fixedUserId
                ? friendship.user2.email
                : friendship.user1.email,
            profileImageUrl:
              friendship.user1Id === fixedUserId
                ? friendship.user2.profileImageUrl
                : friendship.user1.profileImageUrl,
          };
        });

        const loggedInUser = {
          uuid: fixedUserId,
          name: "Você",
          email: "",
        };

        setFriends([loggedInUser, ...mappedFriends]);
        onChange([loggedInUser.uuid, ...selectedUserIds]);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [fixedUserId]);

  const toggleSelection = (uuid: string) => {
    let updatedSelection = [...selectedUserIds];
    if (updatedSelection.includes(uuid)) {
      updatedSelection = updatedSelection.filter((id) => id !== uuid);
    } else {
      updatedSelection.push(uuid);
    }

    if (!updatedSelection.includes(fixedUserId)) {
      updatedSelection.push(fixedUserId);
    }

    onChange(updatedSelection);
  };

  const renderItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedUserIds.includes(item.uuid);
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.itemSelected]}
        onPress={() => toggleSelection(item.uuid)}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Selecione os usuários:</Text>

        {loading ? (
          <Text>Carregando amigos...</Text>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderItem}
            keyExtractor={(item) => item.uuid}
            extraData={selectedUserIds}
          />
        )}

        <View style={styles.buttonContainer}>
          <Button title="Fechar" onPress={() => setModalVisible(false)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemContainer: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  itemSelected: {
    backgroundColor: "#1E90FF",
    borderColor: "#1E90FF",
  },
  itemText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: "center",
  },
});
