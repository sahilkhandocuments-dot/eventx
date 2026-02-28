import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { getEvent, registerPass } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme'

export default function EventDetailsScreen() {
  const { params }          = useRoute()
  const { isLoggedIn }      = useAuth()
  const [event, setEvent]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered]   = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    getEvent(params.id)
      .then((r) => setEvent(r.data))
      .catch(() => setError('Failed to load event'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleRegister = async () => {
    if (!isLoggedIn) { Alert.alert('Sign in required', 'Please sign in to register for events'); return }
    setRegistering(true)
    try {
      await registerPass(params.id)
      setRegistered(true)
      Alert.alert('🎉 Registered!', 'Your pass has been added to My Passes.')
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.detail || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    )
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
      </View>
    )
  }

  const date = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'TBA'

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        {event.banner_url ? (
          <Image source={{ uri: event.banner_url }} style={styles.banner} />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.bannerEmoji}>🎉</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          {event.category ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{event.category}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{event.title}</Text>

          {/* Meta */}
          <View style={styles.metaGrid}>
            <MetaItem icon="📅" label="Date" value={date} />
            {event.location && <MetaItem icon="📍" label="Venue" value={event.location} />}
            {event.capacity && <MetaItem icon="👥" label="Capacity" value={`${event.capacity} seats`} />}
            {event.price != null && <MetaItem icon="💰" label="Entry" value={event.price === 0 ? 'Free' : `₹${event.price}`} />}
          </View>

          {/* Description */}
          {event.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Register CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.registerBtn,
            (registering || registered) && styles.registerBtnDisabled,
          ]}
          onPress={handleRegister}
          disabled={registering || registered}
        >
          {registering
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.registerBtnText}>
                {registered ? '✅ Registered' : '🎟 Register for Free'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

function MetaItem({ icon, label, value }) {
  return (
    <View style={metaStyles.item}>
      <Text style={metaStyles.icon}>{icon}</Text>
      <View>
        <Text style={metaStyles.label}>{label}</Text>
        <Text style={metaStyles.value}>{value}</Text>
      </View>
    </View>
  )
}

const metaStyles = StyleSheet.create({
  item:  { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start', flex: 1, minWidth: '45%' },
  icon:  { fontSize: 18, marginTop: 2 },
  label: { color: COLORS.textMuted, fontSize: FONTS.xs, fontWeight: '600', textTransform: 'uppercase' },
  value: { color: COLORS.text, fontSize: FONTS.sm, fontWeight: '600', marginTop: 2 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  content:   { paddingBottom: 100 },
  banner:    { width: '100%', height: 240, resizeMode: 'cover' },
  bannerPlaceholder: {
    width: '100%', height: 200,
    backgroundColor: COLORS.accentDim,
    justifyContent: 'center', alignItems: 'center',
  },
  bannerEmoji: { fontSize: 64 },
  header: { padding: SPACING.lg },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginBottom: SPACING.sm,
  },
  badgeText: { color: COLORS.accentLight, fontSize: FONTS.xs, fontWeight: '700', textTransform: 'uppercase' },
  title:     { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '800', marginBottom: SPACING.lg },
  metaGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  section:   { marginTop: SPACING.md },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '700', marginBottom: SPACING.sm },
  description:  { color: COLORS.textSub, fontSize: FONTS.base, lineHeight: 24 },
  errorText: { color: COLORS.error, fontSize: FONTS.base },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  registerBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.md,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: COLORS.white, fontSize: FONTS.md, fontWeight: '700' },
})
