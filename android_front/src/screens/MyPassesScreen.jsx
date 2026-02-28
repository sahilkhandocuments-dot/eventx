import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getMyPasses } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme'

export default function MyPassesScreen() {
  const navigation          = useNavigation()
  const { isLoggedIn }      = useAuth()
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const res = await getMyPasses()
      setPasses(res.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => {
    if (isLoggedIn) load()
    else setLoading(false)
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <Text style={styles.bigIcon}>🎟</Text>
        <Text style={styles.emptyTitle}>Your passes await</Text>
        <Text style={styles.emptySub}>Sign in to view and manage your event passes</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    )
  }

  return (
    <FlatList
      data={passes}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load() }}
          tintColor={COLORS.accent}
        />
      }
      ListHeaderComponent={<Text style={styles.heading}>🎟 My Passes</Text>}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.bigIcon}>🎟</Text>
          <Text style={styles.emptyTitle}>No passes yet</Text>
          <Text style={styles.emptySub}>Register for events to collect your passes</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Discover')}>
            <Text style={styles.btnText}>Explore Events</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => <PassCard pass={item} onPress={() => navigation.navigate('EventDetails', { id: item.event_id })} />}
    />
  )
}

function PassCard({ pass, onPress }) {
  const date = pass.event?.date
    ? new Date(pass.event.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'TBA'

  return (
    <TouchableOpacity style={passStyles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={passStyles.left}>
        <Text style={passStyles.emoji}>🎟</Text>
      </View>
      <View style={passStyles.right}>
        <Text style={passStyles.eventName} numberOfLines={2}>{pass.event?.title || 'Event'}</Text>
        <Text style={passStyles.date}>📅 {date}</Text>
        {pass.event?.location && <Text style={passStyles.location} numberOfLines={1}>📍 {pass.event.location}</Text>}
        <View style={[passStyles.badge, pass.status === 'confirmed' ? passStyles.badgeGreen : passStyles.badgeGray]}>
          <Text style={passStyles.badgeText}>{pass.status || 'registered'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const passStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  left: {
    width: 64,
    backgroundColor: COLORS.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji:    { fontSize: 28 },
  right:    { flex: 1, padding: SPACING.md },
  eventName:{ color: COLORS.text, fontSize: FONTS.md, fontWeight: '700', marginBottom: SPACING.xs },
  date:     { color: COLORS.textSub, fontSize: FONTS.sm, marginBottom: 2 },
  location: { color: COLORS.textMuted, fontSize: FONTS.sm, marginBottom: SPACING.sm },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  badgeGreen: { backgroundColor: '#14532d' },
  badgeGray:  { backgroundColor: COLORS.surface },
  badgeText:  { color: COLORS.success, fontSize: FONTS.xs, fontWeight: '600', textTransform: 'capitalize' },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  list:      { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  heading:   { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '800', marginBottom: SPACING.md },
  emptyWrap: { alignItems: 'center', marginTop: SPACING.xxxl },
  bigIcon:   { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle:{ color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700', marginBottom: SPACING.xs, textAlign: 'center' },
  emptySub:  { color: COLORS.textSub, fontSize: FONTS.base, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 22 },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  btnText:   { color: COLORS.white, fontWeight: '700', fontSize: FONTS.base },
})
