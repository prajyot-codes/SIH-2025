import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native'

const sampleBuses = [
  { id: '1', name: 'Bus A', time: '08:00 AM', fare: '₹30' },
  { id: '2', name: 'Bus B', time: '09:30 AM', fare: '₹35' },
  { id: '3', name: 'Bus C', time: '11:00 AM', fare: '₹28' },
]

export default function BookTicket() {
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [results, setResults] = React.useState([])

  const search = () => {
    // placeholder: filter sampleBuses for demonstration
    setResults(sampleBuses)
  }

  const book = (bus) => alert(`Booked ${bus.name} from ${from} to ${to}`)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Ticket</Text>

      <TextInput placeholder="From" value={from} onChangeText={setFrom} style={styles.input} />
      <TextInput placeholder="To" value={to} onChangeText={setTo} style={styles.input} />

      <TouchableOpacity style={styles.searchBtn} onPress={search}>
        <Text style={styles.searchText}>Search Buses</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.busRow}>
            <View>
              <Text style={styles.busName}>{item.name}</Text>
              <Text style={styles.busMeta}>{item.time} • {item.fare}</Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={() => book(item)}>
              <Text style={{ color: '#fff' }}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#071029' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginTop: 8 },
  searchBtn: { marginTop: 12, backgroundColor: '#0ea5a4', padding: 12, borderRadius: 8, alignItems: 'center' },
  searchText: { color: '#04263a', fontWeight: '700' },
  busRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#0b1b2a', marginBottom: 10, borderRadius: 10 },
  busName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  busMeta: { color: '#9ca3af', marginTop: 4 },
  bookBtn: { backgroundColor: '#ef4444', padding: 8, borderRadius: 8 },
})
