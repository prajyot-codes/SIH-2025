import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';


const dummyBuses = [
  { id: 'b1', number: '123', currentStation: 'Wadala Church', chartTime: '10:00', expectedTime: '10:10' },
  { id: 'b2', number: '456', currentStation: 'Dadar', chartTime: '10:15', expectedTime: '10:25' },
  { id: 'b3', number: '789', currentStation: 'Mumbai Central', chartTime: '10:30', expectedTime: '10:40' },
];

export default function WhereToGo() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [busStopLoc, setBusStopLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const router = useRouter();

  const GOOGLE_API_KEY = "AIzaSyA8hqVqtLGSQNHRkTOxQon-YFQA-e_wP4I";

  const handleSearch = () => {
    setShowResults(true);
  };

  const handleGoToBusStop = async () => {
    setLoadingMap(true);
    try {
      // Get user location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoadingMap(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setUserLoc(loc.coords);

      // Geocode bus stop name (from field)
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(from)}&key=${GOOGLE_API_KEY}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const stopLoc = geoData.results[0].geometry.location;
        setBusStopLoc(stopLoc);

        // Get directions from user to bus stop
        const dirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${loc.coords.latitude},${loc.coords.longitude}&destination=${stopLoc.lat},${stopLoc.lng}&key=${GOOGLE_API_KEY}`;
        const dirRes = await fetch(dirUrl);
        const dirData = await dirRes.json();
        if (dirData.routes && dirData.routes.length > 0) {
          const points = polyline.decode(dirData.routes[0].overview_polyline.points);
          const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
          setRouteCoords(coords);
          setShowMap(true);
        } else {
          alert('No route found to bus stop.');
        }
      } else {
        alert('Bus stop location not found.');
      }
    } catch (err) {
      alert('Error loading map.');
      console.error(err);
    } finally {
      setLoadingMap(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where To Go</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="From (e.g. Wadala Church)"
          placeholderTextColor="#9ca3af"
          value={from}
          onChangeText={setFrom}
        />
        <TextInput
          style={styles.input}
          placeholder="To (e.g. Mumbai Central)"
          placeholderTextColor="#9ca3af"
          value={to}
          onChangeText={setTo}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Search</Text>
        </TouchableOpacity>
      </View>

      {showResults && !showMap && (
        <FlatList
          data={dummyBuses}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.route}>Bus #{item.number}</Text>
              <Text style={styles.sub}>Current Station: {item.currentStation}</Text>
              <Text style={styles.sub}>Chart Time: {item.chartTime}</Text>
              <Text style={styles.sub}>Expected Time: {item.expectedTime}</Text>
              <View style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
                <TouchableOpacity style={styles.busBtn} onPress={() => router.push('/TrackBus')}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Track the live bus location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.busBtn} onPress={handleGoToBusStop}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Go to the bus stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {loadingMap && (
        <View style={styles.center}><Text style={{ color: '#fff' }}>Loading map...</Text></View>
      )}

      {showMap && userLoc && busStopLoc && routeCoords.length > 0 && (
        <View style={{ flex: 1, backgroundColor: '#041025' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 40, left: 20, zIndex: 10, backgroundColor: '#0ea5a4', padding: 10, borderRadius: 8 }} onPress={() => setShowMap(false)}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Back</Text>
          </TouchableOpacity>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLoc.latitude,
              longitude: userLoc.longitude,
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
              coordinate={{ latitude: userLoc.latitude, longitude: userLoc.longitude }}
              title="You are here"
              pinColor="blue"
            />
            <Marker
              coordinate={{ latitude: busStopLoc.lat, longitude: busStopLoc.lng }}
              title={from}
              pinColor="#0ea5a4"
            />
          </MapView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#041025' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  inputRow: { flexDirection: 'column', gap: 8, marginBottom: 16 },
  input: { backgroundColor: '#061229', color: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 },
  searchBtn: { backgroundColor: '#0ea5a4', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  row: { padding: 12, backgroundColor: '#061229', borderRadius: 10, marginBottom: 12 },
  route: { color: '#fff', fontWeight: '600' },
  sub: { color: '#9ca3af', marginTop: 6 },
  busBtn: { backgroundColor: '#0ea5a4', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#041025' },
});
