import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getCityEvents, getFests } from '../services/api'
import { useAuth } from '../context/AuthContext'
import EventCard from '../components/EventCard'
import FestCard from '../components/FestCard'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

export default function HomeScreen() {
  const navigation           = useNavigation()
  const { isLoggedIn, user, isOrganizer, isAdmin } = useAuth()
  const [fests, setFests]    = useState([])
  const [events, setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const [f, e] = await Promise.all([getFests(), getCityEvents()])
      setFests(f.data?.slice(0, 5) || [])
      setEvents(e.data?.slice(0, 6) || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={COLORS.accent} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroGreet}>
          {isLoggedIn ? `Hey, ${user?.name?.split(' ')[0] || 'there'} 👋` : 'Discover Events 🎉'}
        </Text>
        <Text style={styles.heroSub}>Find the best college fests &amp; events near you</Text>

        {!isLoggedIn && (
          <View style={styles.authRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.btnPrimaryText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.btnOutlineText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {(isOrganizer || isAdmin) && (
          <View style={styles.authRow}>
            {isOrganizer && (
              <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('OrganizerDash')}>
                <Text style={styles.btnPrimaryText}>My Dashboard</Text>
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('AdminDash')}>
                <Text style={styles.btnOutlineText}>Admin Panel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { label: '🔍 Explore', screen: 'Discover' },
          { label: '🎪 Fests', screen: 'Fests' },
          { label: '🎟 My Passes', screen: 'Passes' },
        ].map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.chip}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.chipText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Fests */}
      {fests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎪 Featured Fests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Fests')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {fests.map((f) => (
            <FestCard
              key={f.id}
              fest={f}
              onPress={() => navigation.navigate('FestDetail', { slug: f.slug })}
            />
          ))}
        </View>
      )}

      {/* Trending Events */}
      {events.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onPress={() => navigation.navigate('EventDetails', { id: e.id })}
            />
          ))}
        </View>
      )}

      {loading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroGreet: {
    color: COLORS.text,
    fontSize: FONTS.xxl,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  heroSub: {
    color: COLORS.textSub,
    fontSize: FONTS.base,
    marginBottom: SPACING.lg,
  },
  authRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.base,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: COLORS.accentLight,
    fontWeight: '700',
    fontSize: FONTS.base,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  chip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  chipText: {
    color: COLORS.textSub,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  section: { marginBottom: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: '800',
  },
  seeAll: {
    color: COLORS.accentLight,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  loadingText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
})
