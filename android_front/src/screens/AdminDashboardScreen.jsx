import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import {
  getOrganizerRequests,
  approveOrganizer,
  rejectOrganizer,
  getPendingEvents,
  approveEvent,
  rejectEvent,
} from '../services/api'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

const TABS = ['Organizer Requests', 'Pending Events']

export default function AdminDashboardScreen() {
  const [tab, setTab]               = useState(0)
  const [orgRequests, setOrgReqs]   = useState([])
  const [pendingEvents, setPending] = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const [oRes, eRes] = await Promise.all([getOrganizerRequests(), getPendingEvents()])
      setOrgReqs(oRes.data || [])
      setPending(eRes.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  const handleOrg = async (id, approve) => {
    try {
      if (approve) await approveOrganizer(id)
      else await rejectOrganizer(id)
      setOrgReqs((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.detail || 'Action failed')
    }
  }

  const handleEvent = async (id, approve) => {
    try {
      if (approve) await approveEvent(id)
      else await rejectEvent(id)
      setPending((prev) => prev.filter((e) => e.id !== id))
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.detail || 'Action failed')
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.accent} size="large" /></View>
  }

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === i && styles.tabActive]}
            onPress={() => setTab(i)}
          >
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
            {i === 0 && orgRequests.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{orgRequests.length}</Text></View>
            )}
            {i === 1 && pendingEvents.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{pendingEvents.length}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={COLORS.accent} />}
      >
        {tab === 0 && (
          orgRequests.length === 0
            ? <Text style={styles.empty}>No pending organizer requests 🎉</Text>
            : orgRequests.map((req) => (
              <View key={req.id} style={styles.card}>
                <Text style={styles.cardName}>{req.user?.name || 'Unknown'}</Text>
                <Text style={styles.cardSub}>{req.user?.email}</Text>
                {req.message && <Text style={styles.cardMsg}>"{req.message}"</Text>}
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleOrg(req.id, true)}>
                    <Text style={styles.approveTxt}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleOrg(req.id, false)}>
                    <Text style={styles.rejectTxt}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
        )}

        {tab === 1 && (
          pendingEvents.length === 0
            ? <Text style={styles.empty}>No pending events 🎉</Text>
            : pendingEvents.map((event) => {
              const date = event.date
                ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'TBA'
              return (
                <View key={event.id} style={styles.card}>
                  <Text style={styles.cardName}>{event.title}</Text>
                  <Text style={styles.cardSub}>By {event.organizer?.name || 'Unknown'}</Text>
                  <Text style={styles.cardSub}>📅 {date} · {event.category || 'General'}</Text>
                  {event.location && <Text style={styles.cardSub}>📍 {event.location}</Text>}
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleEvent(event.id, true)}>
                      <Text style={styles.approveTxt}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleEvent(event.id, false)}>
                      <Text style={styles.rejectTxt}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  tabs:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  tab: {
    flex: 1, paddingVertical: SPACING.md,
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: SPACING.xs,
  },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText:       { color: COLORS.textSub, fontSize: FONTS.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.accentLight },
  badge:         { backgroundColor: COLORS.accent, borderRadius: RADIUS.full, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText:     { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  list:  { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardName: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '700', marginBottom: 2 },
  cardSub:  { color: COLORS.textSub, fontSize: FONTS.sm, marginBottom: 2 },
  cardMsg:  { color: COLORS.textMuted, fontSize: FONTS.sm, fontStyle: 'italic', marginVertical: SPACING.xs },
  actions:  { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  approveBtn: {
    flex: 1, backgroundColor: '#14532d',
    borderRadius: RADIUS.full, paddingVertical: SPACING.sm,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.success,
  },
  approveTxt: { color: COLORS.success, fontSize: FONTS.sm, fontWeight: '700' },
  rejectBtn: {
    flex: 1, backgroundColor: '#2d1212',
    borderRadius: RADIUS.full, paddingVertical: SPACING.sm,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.error,
  },
  rejectTxt:  { color: COLORS.error, fontSize: FONTS.sm, fontWeight: '700' },
  empty:      { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xxxl, fontSize: FONTS.base },
})
