import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Image } from 'react-native';
import polyline from '@mapbox/polyline';

const GOOGLE_API_KEY = "AIzaSyA8hqVqtLGSQNHRkTOxQon-YFQA-e_wP4I";
const origin = { latitude: 19.0176147, longitude: 72.8561644 }; // Wadala Church
const destination = { latitude: 18.9637, longitude: 72.8258 }; // Mumbai Central

export default function TrackBus() {
  const [routeCoords, setRouteCoords] = useState([]);
  const [busIndex, setBusIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const points = polyline.decode(data.routes[0].overview_polyline.points);
          const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
          setRouteCoords(coords);
        } else {
          console.log('No route found:', data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDirections();
  }, []);

  useEffect(() => {
    if (routeCoords.length === 0) return;
    setBusIndex(0);
    const interval = setInterval(() => {
      setBusIndex((prev) => (prev < routeCoords.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [routeCoords]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5a4" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Loading route...</Text>
      </View>
    );
  }

  if (routeCoords.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>No route found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Bus Tracking</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Polyline
          coordinates={routeCoords}
          strokeColor="#0ea5a4"
          strokeWidth={4}
        />
        <Marker
          coordinate={routeCoords[busIndex]}
          title="Bus Location"
          description={`Bus is here (step ${busIndex + 1}/${routeCoords.length})`}
        >
          <Image
            source={require('../assets/bus-icon.webp')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </Marker>
        <Marker
          coordinate={origin}
          title="Wadala Church"
          pinColor="#0ea5a4"
        />
        <Marker
          coordinate={destination}
          title="Mumbai Central"
          pinColor="#f97316"
        />
      </MapView>
      <Text style={styles.info}>Bus is moving along a real road-following path using Directions API.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#041025' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', margin: 16 },
  map: { width: Dimensions.get('window').width, height: 400, borderRadius: 12, alignSelf: 'center' },
  info: { color: '#9ca3af', textAlign: 'center', marginTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#041025' },
});
