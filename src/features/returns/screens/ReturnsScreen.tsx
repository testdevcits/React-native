import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AppText } from '../../../components/AppText';
import { StatusBadge } from '../../../components/StatusBadge';
import { EmptyState } from '../../../components/EmptyState';
import { useReturnsStore } from '../store/returnsStore';

export const ReturnsScreen = ({ navigation }: any) => {
  const { returns, isLoading, fetchReturns } = useReturnsStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReturns();
    });
    return unsubscribe;
  }, [navigation]);

  if (isLoading && returns.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  if (returns.length === 0) {
    return (
      <EmptyState
        title="No Returns Found"
        description="You have not requested any returns yet."
        buttonTitle="Shop Now"
        onButtonPress={() => navigation.navigate('HomeTab')}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={returns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchReturns}
        renderItem={({ item }) => {
          const returnDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent';
          return (
            <View style={styles.card}>
              <View style={styles.header}>
                <View>
                  <AppText variant="caption" color="#718096">RETURN ID</AppText>
                  <AppText variant="medium" color="#2D3748" style={styles.idText}>
                    {item.returnId || item.id}
                  </AppText>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.body}>
                <View style={styles.infoRow}>
                  <AppText variant="caption" color="#718096">Request Date:</AppText>
                  <AppText variant="body" color="#4A5568">{returnDate}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" color="#718096">Reason:</AppText>
                  <AppText variant="body" color="#4A5568" style={styles.capitalize}>{item.reason}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" color="#718096">Resolution:</AppText>
                  <AppText variant="body" color="#4A5568" style={styles.capitalize}>{item.resolution}</AppText>
                </View>
                {item.description ? (
                  <View style={styles.descBox}>
                    <AppText variant="caption" color="#718096">Description:</AppText>
                    <AppText variant="body" color="#4A5568" style={styles.descText}>{item.description}</AppText>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
    paddingBottom: 12,
  },
  idText: {
    fontWeight: '700',
    marginTop: 2,
  },
  body: {
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  descBox: {
    marginTop: 8,
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 8,
  },
  descText: {
    marginTop: 2,
  },
});
