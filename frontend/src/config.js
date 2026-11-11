// import { Platform } from 'react-native';

// // Detect default backend URL based on platform
// export const getDefaultApiUrl = () => {
//   if (Platform.OS === 'android') {
//     // 10.0.2.2 is the special alias to host loopback interface in Android emulator
//     return 'http://10.0.2.2:5000/api';
//   }
//   // Web, iOS Simulator, and default desktop
//   return 'http://localhost:5000/api';
// };

// export const API_BASE_URL = getDefaultApiUrl();


import { Platform } from 'react-native';

// Địa chỉ IP IPv4 máy tính khi dùng Wi-Fi / Hotspot
const LOCAL_IP = '172.20.10.2';

export const getDefaultApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  // Dành cho điện thoại thật (Expo Go)
  return `http://${LOCAL_IP}:5000/api`;
};

export const API_BASE_URL = getDefaultApiUrl();
export default API_BASE_URL;