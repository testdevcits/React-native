import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// A simple in-memory fallback for environment safety
const fallbackStore: Record<string, string> = {};

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<boolean> => {
  try {
    fallbackStore[ACCESS_TOKEN_KEY] = accessToken;
    fallbackStore[REFRESH_TOKEN_KEY] = refreshToken;
    
    // Store access token
    await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, accessToken, {
      service: ACCESS_TOKEN_KEY,
    });
    // Store refresh token
    await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, refreshToken, {
      service: REFRESH_TOKEN_KEY,
    });
    return true;
  } catch (error) {
    console.warn('Keychain error, using fallback:', error);
    return true; // Return true as fallback is active
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: ACCESS_TOKEN_KEY });
    if (credentials) {
      return credentials.password;
    }
    return fallbackStore[ACCESS_TOKEN_KEY] || null;
  } catch (error) {
    console.warn('Keychain getAccessToken error, using fallback:', error);
    return fallbackStore[ACCESS_TOKEN_KEY] || null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_KEY });
    if (credentials) {
      return credentials.password;
    }
    return fallbackStore[REFRESH_TOKEN_KEY] || null;
  } catch (error) {
    console.warn('Keychain getRefreshToken error, using fallback:', error);
    return fallbackStore[REFRESH_TOKEN_KEY] || null;
  }
};

export const clearTokens = async (): Promise<boolean> => {
  try {
    delete fallbackStore[ACCESS_TOKEN_KEY];
    delete fallbackStore[REFRESH_TOKEN_KEY];
    await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_KEY });
    await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_KEY });
    return true;
  } catch (error) {
    console.warn('Keychain clearTokens error:', error);
    return true;
  }
};
