import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../utils/colors';

interface AppLoaderProps {
  visible?: boolean;
  message?: string;
  isOverlay?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  visible = true,
  message = 'Loading...',
  isOverlay = false,
}) => {
  if (!visible) return null;

  if (isOverlay) {
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlayContainer}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message ? (
              <AppText variant="medium" color={colors.textDark} style={styles.overlayText}>
                {message}
              </AppText>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <AppText variant="body" color={colors.textLight} style={styles.text}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 140,
  },
  overlayText: {
    marginTop: 12,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
  },
});
