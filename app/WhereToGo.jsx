import React from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'

const routes = [
  { id: 'r1', from: 'Station A', to: 'Station B', buses: 4 },
  { id: 'r2', from: 'Station B', to: 'Station C', buses: 2 },
  { id: 'r3', from: 'Station A', to: 'Station C', buses: 6 },
]

export default function WhereToGo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where To Go</Text>

      <FlatList
        data={routes}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row}>
            <View>
              <Text style={styles.route}>{item.from} → {item.to}</Text>
              <Text style={styles.sub}>{item.buses} buses available</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#041025' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: { padding: 12, backgroundColor: '#061229', borderRadius: 10, marginBottom: 12 },
  route: { color: '#fff', fontWeight: '600' },
  sub: { color: '#9ca3af', marginTop: 6 },
})
