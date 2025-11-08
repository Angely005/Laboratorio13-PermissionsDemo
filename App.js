import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const camStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(camStatus.status);
      await AsyncStorage.setItem('cameraPermission', camStatus.status);

      const micStatus = await Camera.requestMicrophonePermissionsAsync();
      setMicPermission(micStatus.status);
      await AsyncStorage.setItem('micPermission', micStatus.status);

      const locStatus = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locStatus.status);
      await AsyncStorage.setItem('locationPermission', locStatus.status);

      if (locStatus.status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        Alert.alert(
          'Ubicación actualizada',
          `Lat: ${currentLocation.coords.latitude.toFixed(4)}\nLon: ${currentLocation.coords.longitude.toFixed(4)}`
        );
      } else {
        setLocation(null);
        Alert.alert('Permiso de ubicación denegado', 'No se podrán mostrar coordenadas.');
      }

      if (camStatus.status !== 'granted') {
        Alert.alert('Permiso de cámara denegado', 'No se podrá usar la cámara.');
      }

      if (micStatus.status !== 'granted') {
        Alert.alert('Permiso de micrófono denegado', 'No se podrá grabar audio.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al solicitar los permisos.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Pantalla de Permisos</Text>
      <Text style={styles.subtitle}>Esta app necesita permisos para funcionar correctamente</Text>

      <PermissionCard title="Cámara" status={cameraPermission} />
      <PermissionCard title="Micrófono" status={micPermission} />
      <PermissionCard title="Ubicación" status={locationPermission} />

      {location && (
        <Text style={styles.coords}>
          📍 Lat: {location.latitude.toFixed(4)} | Lon: {location.longitude.toFixed(4)}
        </Text>
      )}

      {cameraPermission === 'granted' && (
        <Text style={styles.ready}>📷 La cámara está lista para usarse</Text>
      )}

      <Button title="🔄 Reintentar permisos" onPress={requestPermissions} />
    </View>
  );
}

function PermissionCard({ title, status }) {
  let message = '⏳ Pendiente';
  if (status === 'granted') message = '✅ Permitido';
  else if (status === 'denied') message = '❌ Denegado';

  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>{title}: {message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  coords: { marginTop: 10, fontSize: 16, fontStyle: 'italic' },
  ready: { marginTop: 10, fontSize: 16, color: 'green' },
  card: { marginVertical: 8, padding: 12, borderWidth: 1, borderRadius: 8, width: '80%' },
  cardText: { fontSize: 18 }
});
