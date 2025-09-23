import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>dhvasudtvasitdva</Text>
    </View>
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    margin: 20,              // margin around the View
    backgroundColor: 'red',  // red background for visibility
    padding: 10,             // padding inside the View
    borderRadius: 8,         // rounded corners
  },
  text: {
    color: 'white',          // text color to contrast the red background
    fontSize: 16,
    fontWeight: 'bold',
  }
})
