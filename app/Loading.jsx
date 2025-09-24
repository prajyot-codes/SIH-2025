import React from 'react'
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native'
import { useRouter } from 'expo-router'

export default function Loading() {
  const router = useRouter()
  const scale = React.useRef(new Animated.Value(0.8)).current
  const opacity = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 900, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start()

    const t = setTimeout(() => router.replace('/Main'), 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }] }>
        {/* Replace the source with your logo path when you upload it */}
        <Image source={require('../assets/icon.jpg')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Text style={styles.title}>SmartBus</Text>
      <Text style={styles.subtitle}>Connecting your city — smooth, safe, simple</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#071023', alignItems:'center', justifyContent:'center', padding:24 },
  logoWrap: { width:140, height:140, borderRadius:28, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.04)' },
  logo: { width:120, height:120 },
  title: { color:'#fff', fontSize:26, fontWeight:'700', marginTop:18 },
  subtitle: { color:'#94a3b8', marginTop:8, textAlign:'center' }
})
