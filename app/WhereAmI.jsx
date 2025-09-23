import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native'
import * as Location from 'expo-location'

// A simple HTML page with Leaflet map that expects to receive bus locations via window.postMessage
const leafletHtml = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" crossorigin="" />
    <style>
      html,body{height:100%;margin:0;padding:0;-webkit-overflow-scrolling:touch}
      #map{width:100%;height:100vh;margin:0;padding:0}
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <script>
      (function(){
        var map = L.map('map').setView([20.5937,78.9629],5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution: '' }).addTo(map);

        var userMarker = L.marker([20.5937,78.9629]).addTo(map).bindPopup('You');
        var busMarkers = {};

        function updateBuses(buses){
          buses.forEach(function(b){
            var id=b.id;
            if(busMarkers[id]){
              busMarkers[id].setLatLng([b.lat,b.lng]);
            } else {
              busMarkers[id]=L.marker([b.lat,b.lng],{icon:L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/61/61231.png',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map).bindPopup(b.name);
            }
          })
        }

        // ensure map resizes to fill the WebView
        function refreshMap(){ try{ map.invalidateSize(); }catch(e){/*ignore*/} }
        window.addEventListener('resize', refreshMap);
        window.addEventListener('load', function(){ setTimeout(refreshMap,200); });

        // listen for messages from React Native
        function handleMessage(e){
          try{
            var data = JSON.parse(e.data);
            if(data.type==='buses') updateBuses(data.buses);
            if(data.type==='user'){
              // parse coordinates robustly
              var lat = parseFloat(data.lat)
              var lng = parseFloat(data.lng)
              if(isNaN(lat) || isNaN(lng)) return console.warn('invalid coords', data)

              // remove previous user marker and create a fresh one so icon/anchor doesn't cause drift
              try{
                if(window.__userMarker){ map.removeLayer(window.__userMarker); window.__userMarker = null }
                window.__userMarker = L.marker([lat,lng], { title: 'You' }).addTo(map)
                var coordText = lat.toFixed(6) + ',' + lng.toFixed(6)
                window.__userMarker.bindPopup('<b>you</b><br/>' + coordText).openPopup()
                // notify React Native that marker was placed
                try{ if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){ window.ReactNativeWebView.postMessage(JSON.stringify({ type:'placed', lat: lat, lng: lng })) } }catch(e){console.warn('post back', e)}

                // add a precise small circle to mark the exact point
                if(window.__lastDebugCircle) { map.removeLayer(window.__lastDebugCircle) }
                window.__lastDebugCircle = L.circle([lat,lng], { radius: 3, color:'#0ea5a4', fillColor:'#0ea5a4', fillOpacity:0.9 }).addTo(map)
              }catch(e){console.warn('debug marker error', e)}

              // if this is the initial location message, center the map and invalidate size
              if(data.initial){
                map.setView([lat,lng], 15);
                // force a few refreshes to ensure tiles render inside WebView
                setTimeout(refreshMap, 150)
                setTimeout(refreshMap, 500)
              }
            }
          }catch(err){console.warn(err)}
        }

        // Compat for Android WebView and iOS
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){
          document.addEventListener('message', handleMessage, false);
        }
        window.addEventListener('message', handleMessage, false);
      })();
    </script>
  </body>
  </html>
`

export default function WhereAmI() {
  const [loading, setLoading] = React.useState(true)
  const [WebViewComp, setWebViewComp] = React.useState(null)

  // Example of sending mock bus locations to the WebView every 5 seconds
  const ref = React.useRef(null)
  const lastUserRef = React.useRef(null)
  const firstSentRef = React.useRef(false)
  const [currentLocation, setCurrentLocation] = React.useState(null)
  const [placedCoords, setPlacedCoords] = React.useState(null)
  const [flipCoords, setFlipCoords] = React.useState(false)

  React.useEffect(() => {
    // Dynamically require the native WebView only on non-web platforms to avoid
    // bundling/import errors when running on web.
    if (Platform.OS !== 'web') {
      try {
        // require is used so bundlers don't attempt to resolve this on web
        const { WebView } = require('react-native-webview')
        setWebViewComp(() => WebView)
      } catch (e) {
        console.warn('Failed to load react-native-webview', e)
      }
    }

    let locSub = null
    async function startLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          console.warn('Location permission not granted')
          return
        }

        // get immediate position and send once
        try {
          const initialPos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          const ilat = initialPos.coords.latitude
          const ilng = initialPos.coords.longitude
          setCurrentLocation({ lat: ilat, lng: ilng })
          lastUserRef.current = { lat: ilat, lng: ilng }
          const initMsg = JSON.stringify({ type: 'user', lat: ilat, lng: ilng, initial: true })
          if (ref.current && WebViewComp) {
            try { ref.current.postMessage(initMsg); firstSentRef.current = true } catch (e) { console.warn('postMessage init', e) }
          }
        } catch (e) { console.warn('initial position error', e) }

        locSub = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        }, (loc) => {
          const lat = loc.coords.latitude
          const lng = loc.coords.longitude
          // buffer latest location in case WebView isn't ready
          lastUserRef.current = { lat, lng }
          setCurrentLocation({ lat, lng })
          const initial = !firstSentRef.current
          const msgObj = initial ? { type: 'user', lat, lng, initial: true } : { type: 'user', lat, lng }
          const msg = JSON.stringify(msgObj)
          console.log('sending location ->', msg)
          if (ref.current && WebViewComp) {
            try { ref.current.postMessage(msg); firstSentRef.current = true } catch (e) { console.warn(e) }
          }
        })
      } catch (e) { console.warn('Location watch error', e) }
    }
    startLocation()

    const iv = setInterval(() => {
      const buses = [
        { id: 'b1', name: 'Bus 1', lat: 19.07 + Math.random() * 0.1, lng: 72.87 + Math.random() * 0.1 },
        { id: 'b2', name: 'Bus 2', lat: 19.2 + Math.random() * 0.1, lng: 72.9 + Math.random() * 0.1 },
      ]
      const msg = JSON.stringify({ type: 'buses', buses })
      if (ref.current && WebViewComp) ref.current.postMessage(msg)
    }, 5000)

    setTimeout(() => setLoading(false), 1200)
    return () => { clearInterval(iv); if (locSub) locSub.remove(); }
  }, [WebViewComp])

  // when WebView becomes available, send any buffered user location (initial)
  React.useEffect(() => {
    if (!WebViewComp) return
    if (lastUserRef.current && ref.current && !firstSentRef.current) {
      const { lat, lng } = lastUserRef.current
      const msg = JSON.stringify({ type: 'user', lat, lng, initial: true })
      try { ref.current.postMessage(msg); firstSentRef.current = true } catch (e) { console.warn(e) }
    }
  }, [WebViewComp])

  const resendLocation = () => {
    if (!lastUserRef.current) return alert('No location yet')
    const { lat, lng } = lastUserRef.current
    const msg = JSON.stringify({ type: 'user', lat, lng, initial: true })
    console.log('resend location ->', msg)
    try { if (ref.current) ref.current.postMessage(msg) } catch (e) { console.warn(e) }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where Am I</Text>
      {loading && <ActivityIndicator size="large" color="#0ea5a4" />}
      <View style={styles.mapWrap}>
        {WebViewComp ? (
          <WebViewComp
            ref={ref}
            originWhitelist={["*"]}
            // supply baseUrl so Android WebView can load external resources from CDN
            source={{ html: leafletHtml, baseUrl: 'https://unpkg.com' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            // allow access to remote content and mixed content for Android
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode="compatibility"
            style={{ flex: 1, height: '100%' }}
            onMessage={(event) => {
              try{
                const data = JSON.parse(event.nativeEvent.data)
                if(data.type === 'placed'){
                  setPlacedCoords({ lat: data.lat, lng: data.lng })
                }
              }catch(e){console.warn('onMessage parse', e)}
            }}
          />
        ) : (
          <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:16}}>
            <Text style={{color:'#fff',textAlign:'center'}}>Interactive map is available on native devices (Expo Go / simulator).\nOpen the app on a phone or emulator to view the Leaflet map.</Text>
          </View>
        )}
      </View>
      <Text style={styles.hint}>Map shows your location and live buses. Grant location permissions in the native app.</Text>
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: '#cbd5e1' }}>Current device location: {currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'not available'}</Text>
          <Text style={{ color: '#cbd5e1', marginTop:6 }}>Last placed on map: {placedCoords ? `${placedCoords.lat}, ${placedCoords.lng}` : 'not placed yet'}</Text>
          <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
            <TouchableOpacity onPress={resendLocation} style={{ backgroundColor: '#0ea5a4', padding: 8, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: '#04263a', fontWeight: '700' }}>Center map on my location</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                setFlipCoords(f => !f)
                // resend with flipped coords for quick test
                if(lastUserRef.current){
                  const { lat,lng } = lastUserRef.current
                  const msg = JSON.stringify({ type: 'user', lat: flipCoords ? lat : lng, lng: flipCoords ? lng : lat, initial: true })
                  try { if(ref.current) ref.current.postMessage(msg) } catch(e){console.warn(e)}
                }
              }} style={{ backgroundColor:'#f97316', padding:8, borderRadius:8 }}>
              <Text style={{ color:'#fff', fontWeight:'700' }}>Flip coords test</Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#071023' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  mapWrap: { flex: 1, borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  hint: { color: '#9ca3af', marginTop: 8 }
})
