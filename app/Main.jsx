import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, FlatList, ActivityIndicator, Dimensions, Modal, TextInput, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Card = ({ title, subtitle, image, onPress }) => {
  const scale = React.useRef(new Animated.Value(1)).current
  const pressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity onPressIn={pressIn} onPressOut={pressOut} onPress={onPress} style={styles.touch}>
        <Image source={image} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function Main() {
  const router = useRouter()
  const [articles, setArticles] = React.useState(null)
  const [carouselIndex, setCarouselIndex] = React.useState(0)
  const [loggedIn, setLoggedIn] = React.useState(false)
  // Load login state from AsyncStorage on mount
  React.useEffect(() => {
    AsyncStorage.getItem('loggedIn').then(val => {
      if (val === 'true') setLoggedIn(true);
    });
  }, []);

  // Save login state to AsyncStorage whenever it changes
  React.useEffect(() => {
    AsyncStorage.setItem('loggedIn', loggedIn ? 'true' : 'false');
  }, [loggedIn]);
  const [showLogin, setShowLogin] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const listRef = React.useRef(null)
  const positionRef = React.useRef(0)
  const baseNRef = React.useRef(5)
  const { width } = Dimensions.get('window')
  const CARD_W = Math.min(320, width - 72)

  // Frontend-only sample bus system updates (show until backend admin feed is available)
  const busUpdates = [
    { id: 'b1', title: 'Route A Timings Updated', image: require('../assets/bus1.jpeg') },
    { id: 'b2', title: 'Extra Service This Weekend', image: require('../assets/bus2.jpeg') },
    { id: 'b3', title: 'New Stop Added', image: require('../assets/bus3.jpeg') },
    { id: 'b4', title: 'Maintenance Notice', image: require('../assets/bus4.jpeg') },
    { id: 'b5', title: 'Fare Update', image: require('../assets/bus5.jpeg') },
    { id: 'b6', title: 'Lost & Found', image: require('../assets/bus1.jpeg') },
    { id: 'b7', title: 'Service Improvements', image: require('../assets/bus2.jpeg') },
    { id: 'b8', title: 'Weather Advisory', image: require('../assets/bus3.jpeg') },
  ]

  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5)

  React.useEffect(() => {
    let mounted = true
    async function load(){
      // we will show frontend updates only for the carousel demo
      const picks = shuffle(busUpdates).slice(0,5)
      baseNRef.current = picks.length
      // append a cloned first item so we can scroll to index N (clone) before jumping to 0
      const clone = { ...picks[0], id: `${picks[0].id}_clone` }
      if(mounted) setArticles([...picks, clone])
    }
    load()

    // auto-swipe timer: every 2 seconds advance forward-only in a circular way
    const t = setInterval(()=>{
      // use positionRef to keep a mutable position
  const N = baseNRef.current || 5
  let pos = positionRef.current + 1
      // scroll to next position (may be the cloned item at index N)
      if(listRef.current){
        listRef.current.scrollToOffset({ offset: pos * (CARD_W + 12), animated: true })
      }
      // update visible index for dots/indicator (wrap for display)
      setCarouselIndex(pos % N)
      positionRef.current = pos

      // if we've moved to the cloned first item (pos === N), schedule a jump back to real first
      if(pos === N){
        // after the animated scroll finishes, jump back to 0 without animation
        setTimeout(()=>{
          if(listRef.current){
            listRef.current.scrollToOffset({ offset: 0, animated: false })
          }
          positionRef.current = 0
          setCarouselIndex(0)
        }, 350) // slightly longer than the scroll animation to ensure smoothness
      }
    }, 2000)

    return ()=>{ mounted = false; clearInterval(t) }
  }, [])

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.heading}>𝘽us𝙈itra</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {
            if (loggedIn) {
              setLoggedIn(false);
            } else {
              setShowLogin(true);
            }
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{loggedIn ? 'Logout' : 'Login'}</Text>
        </TouchableOpacity>
      </View>

      <Card
        title="Book Ticket"
        subtitle="Reserve your seat from source to destination"
        image={require('../assets/bookTicket.jpeg')}
        onPress={() => {
          if (!loggedIn) {
            Alert.alert('Login Required', 'Please log in to book a ticket.');
          } else {
            router.push('/BookTicket');
          }
        }}
      />

      <Card
        title="Where To Go"
        subtitle="See routes and buses between places"
        image={require('../assets/whereToGo.png')}
        onPress={() => router.push('/WhereToGo')}
      />

      <Card
        title="Where Am I"
        subtitle="View your location and live buses on map"
        image={require('../assets/map.jpeg')}
        onPress={() => router.push('/WhereAmI')}
      />

      <View style={{marginTop:12}}>
        <Text style={{color:'#fff', fontSize:18, fontWeight:'700', marginBottom:8}}>General Updates</Text>
        {articles ? (
          <View>
            <FlatList
              ref={listRef}
              data={articles}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              snapToInterval={CARD_W + 12}
              decelerationRate="fast"
              keyExtractor={(i,idx)=>i.id || String(idx)}
              contentContainerStyle={{paddingVertical:6}}
              renderItem={({item})=> (
                <View style={[styles.carouselCard, {width: CARD_W, marginRight:12}]}> 
                  <Image source={item.image} style={styles.carouselImage} />
                  <Text style={styles.carouselTitle} numberOfLines={2}>{item.title}</Text>
                </View>
              )}
            />
          </View>
        ) : (
          <Text style={{color:'#9ca3af'}}>Loading updates…</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with <Text style={{color:'#ef4444'}}>♥</Text> by Team</Text>
      </View>

      <Modal
        visible={showLogin}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogin(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loginModal}>
            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 18, color: '#eaf3f3ff' }}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 18 }]}
              onPress={() => {
                setLoggedIn(true);
                setShowLogin(false);
                setUsername('');
                setPassword('');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10, alignItems: 'center' }}
              onPress={() => setShowLogin(false)}
            >
              <Text style={{ color: '#eeeef2ff', fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingBottom: 88,
    backgroundColor: '#0f172a',
  },
  heading: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 18,
  },
  subheading: {
    color: '#9ca3af',
    marginBottom: 12,
  },
  card: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0b1220',
    elevation: 4,
  },
  touch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    margin: 12,
    borderRadius: 8,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  cardSubtitle: { color: '#9ca3af', marginTop: 4 },
  carouselCard: { backgroundColor: '#07162a', borderRadius: 10, padding: 10, alignItems: 'center' },
  carouselImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  carouselTitle: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center', padding: 10 },
  footerText: { color: '#9ca3af' },
  loginBtn: {
    backgroundColor: '#0c146bff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
    submitBtn: {
      backgroundColor: '#070b74ff', // orange
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 8,
      alignItems: 'center',
    },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginModal: {
    width: 320,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    color: '#222',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    width: '100%',
  },
})
