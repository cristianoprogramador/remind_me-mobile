import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PaginationProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={handlePrevious}
        disabled={currentPage === 1}
        style={[
          styles.button,
          currentPage === 1 && styles.disabledButton,
          styles.leftButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            currentPage === 1 && styles.disabledButtonText,
          ]}
        >
          Anterior
        </Text>
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        Página {currentPage} de {totalPages}
      </Text>
      <TouchableOpacity
        onPress={handleNext}
        disabled={currentPage === totalPages}
        style={[
          styles.button,
          currentPage === totalPages && styles.disabledButton,
          styles.rightButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            currentPage === totalPages && styles.disabledButtonText,
          ]}
        >
          Próxima
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#D3D3D3",
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  buttonText: {
    color: "#000",
  },
  disabledButton: {
    backgroundColor: "#555",
    borderColor: "#555",
  },
  disabledButtonText: {
    color: "#A9A9A9",
  },
  pageInfo: {
    marginHorizontal: 16,
    color: "#fff", // Alterado para texto branco, ajuste conforme necessário
  },
  leftButton: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  rightButton: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});
