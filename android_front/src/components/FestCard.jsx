import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, FONTS, RADIUS, SPACING, SHADOW } from '../theme'

export default function FestCard({ fest, onPress }) {
  const banner = fest?.banner_url

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.accent, banner ? null : styles.accentPlaceholder]}>
        <Text style={styles.emoji}>🎪</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{fest?.name || 'Unnamed Fest'}</Text>
        {fest?.tagline ? (
          <Text style={styles.tagline} numberOfLines={2}>{fest.tagline}</Text>
        ) : null}
        <View style={styles.footer}>
          {fest?.college_name ? (
            <Text style={styles.college} numberOfLines={1}>🏛 {fest.college_name}</Text>
          ) : null}
          <View style={[styles.badge, fest?.status === 'active' ? styles.badgeActive : styles.badgePast]}>
            <Text style={styles.badgeText}>{fest?.status || 'upcoming'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  accent: {
    width: 72,
    height: 72,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentPlaceholder: {
    backgroundColor: COLORS.accentDim,
  },
  emoji: {
    fontSize: 30,
  },
  body: {
    flex: 1,
    paddingRight: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  tagline: {
    color: COLORS.textSub,
    fontSize: FONTS.sm,
    marginBottom: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  college: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
    flex: 1,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  badgeActive: {
    backgroundColor: '#14532d',
  },
  badgePast: {
    backgroundColor: '#1c1c1c',
  },
  badgeText: {
    color: COLORS.success,
    fontSize: FONTS.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
})
