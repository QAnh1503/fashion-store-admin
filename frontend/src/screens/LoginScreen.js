import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { API_BASE_URL } from '../config';

export default function LoginScreen({ onLoginSuccess, apiUrl, onUpdateApiUrl }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState(apiUrl);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess({
          username: data.admin?.username || username,
          token: data.token,
        });
      } else {
        setErrorMessage(data.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.warn('API Login error, using offline/demo bypass if server is not reachable:', error);
      // If server is not yet connected or network timeout, provide graceful fallback
      if (username === 'admin' && password === 'admin123') {
        onLoginSuccess({
          username: 'admin',
          token: 'mock-demo-token-2026',
        });
      } else {
        setErrorMessage(
          `Unable to connect to server at ${apiUrl}. Please ensure Backend is running.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isMobile ? 16 : 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { maxWidth: isMobile ? '100%' : 460 }]}>
          {/* Logo / Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🛍️</Text>
            </View>
            <Text style={styles.subtitle}>FASHION STORE</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Admin Portal Login</Text>
          <Text style={styles.description}>
            Sign in to manage inventory, update collections, and control store products.
          </Text>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Demo Credentials hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Default credentials: <Text style={styles.boldText}>admin</Text> /{' '}
              <Text style={styles.boldText}>admin123</Text>
            </Text>
          </View>

          {/* API Server Settings Toggle */}
          <TouchableOpacity
            style={styles.toggleSettings}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Text style={styles.toggleSettingsText}>
              {showSettings ? '▲ Hide API Server Settings' : '⚙️ API Server Settings'}
            </Text>
          </TouchableOpacity>

          {showSettings && (
            <View style={styles.settingsBox}>
              <Text style={styles.settingsLabel}>Backend API URL:</Text>
              <TextInput
                style={styles.settingsInput}
                value={customUrl}
                onChangeText={setCustomUrl}
                placeholder="http://localhost:5000/api"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.settingsSaveBtn}
                onPress={() => onUpdateApiUrl(customUrl)}
              >
                <Text style={styles.settingsSaveBtnText}>Save API URL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#38bdf8',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#f8fafc',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#1d4ed8',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  hintContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  hintText: {
    color: '#64748b',
    fontSize: 12,
  },
  boldText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  toggleSettings: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleSettingsText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  settingsInput: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    fontSize: 13,
    marginBottom: 8,
  },
  settingsSaveBtn: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsSaveBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
});
