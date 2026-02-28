import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { requestOrganizer } from '../services/api'
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme'

export default function ProfileScreen() {
  const navigation  = useNavigation()
  const { user, isLoggedIn, isOrganizer, isAdmin, logout, role } = useAuth()
  const [requesting, setRequesting] = useState(false)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout()
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
        },
      },
    ])
  }

  const handleRequestOrganizer = async () => {
    Alert.alert(
      'Request Organizer Role',
      'Submit a request to become an event organizer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            setRequesting(true)
            try {
              await requestOrganizer()
              Alert.alert('✅ Submitted', 'Your request has been sent for review.')
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.detail || 'Request failed')
            } finally {
              setRequesting(false)
            }
          },
        },
      ]
    )
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <Text style={styles.bigIcon}>👤</Text>
        <Text style={styles.title}>Sign in to see your profile</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'
  const ROLE_LABEL = { admin: '🛡 Admin', organizer: '🎤 Organizer', user: '👤 User' }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{ROLE_LABEL[role] || '👤 User'}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.menu}>
        {isOrganizer && (
          <MenuItem icon="📊" label="Organizer Dashboard" onPress={() => navigation.navigate('OrganizerDash')} />
        )}
        {isAdmin && (
          <MenuItem icon="🛡" label="Admin Panel" onPress={() => navigation.navigate('AdminDash')} />
        )}
        <MenuItem icon="🎟" label="My Passes" onPress={() => navigation.navigate('Passes')} />
        {!isOrganizer && !isAdmin && (
          <MenuItem
            icon="🎤"
            label={requesting ? 'Requesting…' : 'Become an Organizer'}
            onPress={handleRequestOrganizer}
            disabled={requesting}
          />
        )}
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function MenuItem({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[menuStyles.item, disabled && menuStyles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Text style={menuStyles.icon}>{icon}</Text>
      <Text style={menuStyles.label}>{label}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
  )
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  disabled: { opacity: 0.5 },
  icon:     { fontSize: 20, width: 28 },
  label:    { flex: 1, color: COLORS.text, fontSize: FONTS.base, fontWeight: '500' },
  arrow:    { color: COLORS.textMuted, fontSize: FONTS.xl },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content:   { paddingBottom: SPACING.xxxl },
  center:    {
    flex: 1, backgroundColor: COLORS.bg,
    justifyContent: 'center', alignItems: 'center',
    padding: SPACING.xl,
  },
  bigIcon: { fontSize: 56, marginBottom: SPACING.md },
  title:   { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700', marginBottom: SPACING.xl, textAlign: 'center' },
  avatarWrap: {
    alignItems: 'center',
    padding: SPACING.xxl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  avatarText: { color: COLORS.white, fontSize: FONTS.xxxl, fontWeight: '800' },
  name:       { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700', marginBottom: 4 },
  email:      { color: COLORS.textSub, fontSize: FONTS.sm, marginBottom: SPACING.md },
  roleBadge: {
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  roleText:   { color: COLORS.accentLight, fontSize: FONTS.sm, fontWeight: '700' },
  menu: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  logoutText: { color: COLORS.error, fontSize: FONTS.base, fontWeight: '700' },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.base },
  link:    { color: COLORS.accentLight, fontSize: FONTS.base, fontWeight: '600' },
})
