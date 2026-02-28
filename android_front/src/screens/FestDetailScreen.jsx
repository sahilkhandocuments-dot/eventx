import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, FlatList,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { getFest, getFestEvents } from '../services/api'
import EventCard from '../components/EventCard'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

export default function FestDetailScreen() {
  const { params }           = useRoute()
  const navigation           = useNavigation()
  const [fest, setFest]      = useState(null)
  const [events, setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const [festRes, eventsRes] = await Promise.all([
        getFest(params.slug),
        getFestEvents(params.slug),
      ])
      setFest(festRes.data)
      setEvents(eventsRes.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [params.slug])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    )
  }

  if (!fest) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Fest not found</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={COLORS.accent} />
      }
    >
      {/* Hero Card */}
      <View style={styles.hero}>
        <Text style={styles.festEmoji}>🎪</Text>
        <Text style={styles.festName}>{fest.name}</Text>
        {fest.tagline ? <Text style={styles.tagline}>{fest.tagline}</Text> : null}

        <View style={styles.metaRow}>
          {fest.college_name && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>🏛 {fest.college_name}</Text>
            </View>
          )}
          <View style={[styles.metaBadge, fest.status === 'active' ? styles.badgeActive : styles.badgeDefault]}>
            <Text style={[styles.metaBadgeText, fest.status === 'active' ? styles.activeText : null]}>
              {fest.status || 'upcoming'}
            </Text>
          </View>
        </View>
      </View>

      {/* Events */}
      <Text style={styles.sectionTitle}>Events in this Fest</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>No events announced yet</Text>
      ) : (
        events.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            onPress={() => navigation.navigate('EventDetails', { id: e.id })}
          />
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg },
  center:     { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  content:    { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  festEmoji:   { fontSize: 56, marginBottom: SPACING.sm },
  festName:    { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.xs },
  tagline:     { color: COLORS.textSub, fontSize: FONTS.base, textAlign: 'center', marginBottom: SPACING.md },
  metaRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  metaBadge: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeActive: { borderColor: COLORS.success, backgroundColor: '#14532d' },
  badgeDefault: {},
  metaBadgeText: { color: COLORS.textSub, fontSize: FONTS.sm },
  activeText:    { color: COLORS.success },
  sectionTitle:  { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '800', marginBottom: SPACING.md },
  empty:         { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl, fontSize: FONTS.base },
  errorText:     { color: COLORS.error, fontSize: FONTS.base },
})
