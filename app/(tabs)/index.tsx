import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';

const API_BASE_URL = 'http://10.26.128.124:8000/api';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  signature: string;
};

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    signature: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);
    setIsLoading(true);

    if (!/^\d+\|[A-Za-z0-9]+$/.test(data)) {
      Alert.alert('Erreur', 'Format de QR code invalide');
      setIsLoading(false);
      return;
    }

    setSessionToken(data);

    try {
      await axios.post(`${API_BASE_URL}/session/validate`, {
        sessionToken: data,
      });

      const sessionId = data.split('|')[0];

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        signature: formData.signature.trim(),
        sessionToken: data,
      };

      await axios.post(`${API_BASE_URL}/presences`, payload);

      Alert.alert(
        'Succès',
        `Présence enregistrée pour la session ${sessionId} !`,
        [{ text: 'OK', onPress: resetAll }]
      );
    } catch (err: any) {
      let errorMsg = "Une erreur inconnue s'est produite";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMsg =
            err.response.data?.error ||
            `Erreur du serveur (${err.response.status})`;
        } else if (err.request) {
          errorMsg = 'Le serveur ne répond pas';
        } else {
          errorMsg = err.message;
        }

        if (err.code === 'ECONNABORTED') {
          errorMsg = "Délai d'attente dépassé";
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      Alert.alert('Erreur', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setFormData({ firstName: '', lastName: '', email: '', signature: '' });
    setSessionToken(null);
  };

  const startScan = () => {
    const { firstName, lastName, email, signature } = formData;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !signature.trim()
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs avant le scan.');
      return;
    }
    setShowScanner(true);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Demande d'accès à la caméra…</Text>
      </SafeAreaView>
    );
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Pas d'accès à la caméra</Text>
      </SafeAreaView>
    );
  }
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Traitement en cours...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.centeredContainer}>
        <Text style={styles.header}>Système de présence</Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={formData.firstName}
          onChangeText={(t) => setFormData({ ...formData, firstName: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={formData.lastName}
          onChangeText={(t) => setFormData({ ...formData, lastName: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(t) => setFormData({ ...formData, email: t })}
        />
        <TextInput
          style={[styles.input, styles.signatureInput]}
          placeholder="Signature"
          multiline
          value={formData.signature}
          onChangeText={(t) => setFormData({ ...formData, signature: t })}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Scanner la session"
            onPress={startScan}
            color="#4285F4"
          />
        </View>

        <Modal visible={showScanner} animationType="slide">
          <SafeAreaView style={styles.scannerContainer}>
            <CameraView
              style={styles.scanner}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onBarcodeScanned}
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerTarget} />
              </View>
            </CameraView>
            <View style={styles.modalFooter}>
              <Button
                title="Annuler"
                onPress={() => setShowScanner(false)}
                color="#f44336"
              />
            </View>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f5fa',
  },
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d8e0',
    padding: 14,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    elevation: 2,
  },
  signatureInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginVertical: 12,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTarget: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: '#00ffcc',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#fff',
  },
  tokenInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  tokenText: {
    fontSize: 14,
    color: '#1565c0',
  },
});

export default QRScanner;
