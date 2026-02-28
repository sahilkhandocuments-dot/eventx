import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getMyEvents } from '../services/api'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

const STATUS_COLORS = {
  approved: { bg: '#14532d', text: '#22c55e' },
  pending:  { bg: '#78350f', text: '#f59e0b' },
  rejected: { bg: '#2d1212', text: '#ef4444' },
}

export default function OrganizerDashboardScreen() {
  const navigation          = useNavigation()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const res = await getMyEvents()
      setEvents(res.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.accent} size="large" /></View>
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={COLORS.accent} />}
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Total"    value={events.length} color={COLORS.accentLight} />
        <StatCard label="Approved" value={events.filter((e) => e.status === 'approved').length} color={COLORS.success} />
        <StatCard label="Pending"  value={events.filter((e) => e.status === 'pending').length} color={COLORS.warning} />
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateEvent')}>
        <Text style={styles.createBtnText}>＋ Create New Event</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Events</Text>

      {events.length === 0 ? (
        <Text style={styles.empty}>No events yet. Create your first event!</Text>
      ) : (
        events.map((event) => {
          const statusStyle = STATUS_COLORS[event.status] || STATUS_COLORS.pending
          const date = event.date
            ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBA'
          return (
            <TouchableOpacity
              key={event.id}
              style={styles.card}
              onPress={() => navigation.navigate('EventDetails', { id: event.id })}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.text }]}>{event.status}</Text>
                </View>
              </View>
              <Text style={styles.eventMeta}>📅 {date}</Text>
              {event.location && <Text style={styles.eventMeta}>📍 {event.location}</Text>}
            </TouchableOpacity>
          )
        })
      )}
    </ScrollView>
  )
}

function StatCard({ label, value, color }) {
  return (
    <View style={statStyles.card}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  card:  { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  value: { fontSize: FONTS.xxl, fontWeight: '800' },
  label: { color: COLORS.textSub, fontSize: FONTS.xs, marginTop: 2 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  content:   { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  statsRow:  { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  createBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  createBtnText: { color: COLORS.white, fontSize: FONTS.md, fontWeight: '700' },
  sectionTitle:  { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '800', marginBottom: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs, gap: SPACING.sm },
  eventTitle:  { flex: 1, color: COLORS.text, fontSize: FONTS.md, fontWeight: '700' },
  badge:       { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  badgeText:   { fontSize: FONTS.xs, fontWeight: '700', textTransform: 'capitalize' },
  eventMeta:   { color: COLORS.textSub, fontSize: FONTS.sm, marginTop: 2 },
  empty:       { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl, fontSize: FONTS.base },
})
