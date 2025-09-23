import React from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native'

const initial = [
  { id: 'u1', title: 'Route A Timings Updated', body: 'Buses on Route A will start 10 minutes early from Monday.' },
  { id: 'u2', title: 'Festive Schedule', body: 'Special buses on festival days. Check schedules.' },
]

export default function Updates() {
  const [posts, setPosts] = React.useState(initial)
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')

  const add = () => {
    if(!title||!body) return alert('fill both')
    setPosts([{ id: String(Date.now()), title, body }, ...posts])
    setTitle(''); setBody('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>General Updates</Text>

      <View style={styles.form}>
        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput placeholder="Body" value={body} onChangeText={setBody} style={[styles.input, {height:80}]} multiline />
        <TouchableOpacity style={styles.postBtn} onPress={add}><Text style={{color:'#fff'}}>Post (admin)</Text></TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={i=>i.id}
        style={{marginTop:12}}
        renderItem={({item})=> (
          <View style={styles.post}>
            <Text style={styles.pTitle}>{item.title}</Text>
            <Text style={styles.pBody}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#051025' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  form: { marginTop: 12, backgroundColor: '#07162a', padding: 12, borderRadius: 10 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 8 },
  postBtn: { marginTop: 10, backgroundColor: '#0ea5a4', padding: 10, borderRadius: 8, alignItems:'center' },
  post: { backgroundColor: '#071e2b', padding: 12, borderRadius: 8, marginBottom: 10 },
  pTitle: { color: '#fff', fontWeight: '700' },
  pBody: { color: '#cbd5e1', marginTop: 6 }
})
