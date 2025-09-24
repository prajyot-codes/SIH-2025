import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, FlatList, ActivityIndicator, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { NEWS_API_KEY } from './newsConfig'

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
  const listRef = React.useRef(null)
  const { width } = Dimensions.get('window')
  const CARD_W = Math.min(320, width - 72)

  // Frontend-only sample bus system updates (show until backend admin feed is available)
  const busUpdates = [
    { id: 'b1', title: 'Route A Timings Updated', image: require('../assets/icon.png') },
    { id: 'b2', title: 'Extra Service This Weekend', image: require('../assets/splash-icon.png') },
    { id: 'b3', title: 'New Stop Added', image: require('../assets/adaptive-icon.png') },
    { id: 'b4', title: 'Maintenance Notice', image: require('../assets/favicon.png') },
    { id: 'b5', title: 'Fare Update', image: require('../assets/icon.png') },
    { id: 'b6', title: 'Lost & Found', image: require('../assets/splash-icon.png') },
    { id: 'b7', title: 'Service Improvements', image: require('../assets/adaptive-icon.png') },
    { id: 'b8', title: 'Weather Advisory', image: require('../assets/favicon.png') },
  ]

  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5)

  React.useEffect(() => {
    let mounted = true
    async function load(){
      // we will show frontend updates only for the carousel demo
      const picks = shuffle(busUpdates).slice(0,5)
      if(mounted) setArticles(picks)
    }
    load()

    // auto-swipe timer: every 2 seconds advance circularly
    const t = setInterval(()=>{
      setCarouselIndex(i => {
        const next = ((i + 1) % 5)
        // scroll FlatList
        if(listRef.current){
          listRef.current.scrollToOffset({ offset: next * (CARD_W + 12), animated: true })
        }
        return next
      })
    }, 2000)

    return ()=>{ mounted = false; clearInterval(t) }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SmartBus</Text>
      <Text style={styles.subheading}>Choose a service</Text>

      <Card
        title="Book Ticket"
        subtitle="Reserve your seat from source to destination"
        image={require('../assets/splash-icon.png')}
        onPress={() => router.push('/BookTicket')}
      />

      <Card
        title="Where To Go"
        subtitle="See routes and buses between places"
        image={require('../assets/icon.png')}
        onPress={() => router.push('/WhereToGo')}
      />

      <Card
        title="Where Am I"
        subtitle="View your location and live buses on map"
        image={require('../assets/adaptive-icon.png')}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
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
})
