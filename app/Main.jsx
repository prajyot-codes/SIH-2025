import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native'
import { useRouter } from 'expo-router'

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

      <Card
        title="General Updates"
        subtitle="Latest news and admin posts"
        image={require('../assets/favicon.png')}
        onPress={() => router.push('/Updates')}
      />
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
})
