import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Button,
  Alert,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

export default function TabTwoScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://10.26.128.124:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          role: 'etudiant',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur backend:', error);
        Alert.alert('Erreur', 'Échec de la création');
        return;
      }

      Alert.alert('Succès', 'Élève ajouté avec succès !');
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Erreur réseau ou serveur inaccessible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.centeredContainer}>
        <Text style={styles.header}>Inscription d'un élève</Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.buttonContainer}>
          {loading ? (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>Envoi en cours...</Text>
            </View>
          ) : (
            <Button title="Inscrire" onPress={handleSubmit} color="#4285F4" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
});
