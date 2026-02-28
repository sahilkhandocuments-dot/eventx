import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { COLORS, FONTS, RADIUS, SPACING, SHADOW } from '../theme'

export default function EventCard({ event, onPress }) {
  const date = event?.date
    ? new Date(event.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'TBA'

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {event?.banner_url ? (
        <Image source={{ uri: event.banner_url }} style={styles.banner} />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <Text style={styles.bannerEmoji}>🎉</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{event?.title || 'Untitled Event'}</Text>
        <View style={styles.row}>
          <Text style={styles.meta}>📅 {date}</Text>
          {event?.location ? <Text style={styles.meta} numberOfLines={1}>📍 {event.location}</Text> : null}
        </View>
        {event?.category ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{event.category}</Text>
          </View>
        ) : null}
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
    ...SHADOW.sm,
  },
  banner: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 48,
  },
  body: {
    padding: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  meta: {
    color: COLORS.textSub,
    fontSize: FONTS.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.xs,
  },
  badgeText: {
    color: COLORS.accentLight,
    fontSize: FONTS.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
