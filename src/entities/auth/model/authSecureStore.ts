import * as SecureStore from 'expo-secure-store';

async function saveRefreshToken(token: string) {
  await SecureStore.setItemAsync('refreshToken', token);
}
async function getRefreshToken() {
  return await SecureStore.getItemAsync('refreshToken');
}

async function saveAccessToken(token: string) {
  await SecureStore.setItemAsync('accessToken', token);
}
async function getAccessToken() {
  return await SecureStore.getItemAsync('accessToken');
}

async function logout() {
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('accessToken');
}

export const authSecureStore = {
  saveRefreshToken,
  getRefreshToken,
  saveAccessToken,
  getAccessToken,
  logout,
};
