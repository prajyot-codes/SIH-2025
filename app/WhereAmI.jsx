import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const GOOGLE_API_KEY = "AIzaSyDtGCji0_KAKWbT1bMHIf1S8x3QUYh6V4w";

export default function App() {
  const [region, setRegion] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Fetch nearby bus stops
      fetchBusStops(latitude, longitude);
    })();
  }, []);

  const fetchBusStops = async (lat, lng) => {
    try {
      const radius = 500; // meters
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=bus stop&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results) {
        setStops(data.results);
      } else {
        console.log("No results:", data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!region) {
    return (
      <View style={styles.center}>
        <Text>Getting location...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading nearby bus stops...</Text>
      </View>
    );
  }

  return (
    <MapView style={styles.map} region={region}>
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        title="You are here"
        pinColor="blue"
      />
      {stops.map((stop, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: stop.geometry.location.lat,
            longitude: stop.geometry.location.lng,
          }}
          title={stop.name}
          description={stop.vicinity}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
