import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS } from '../theme'

export default function LoadingSpinner({ size = 'large', color = COLORS.accent }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
