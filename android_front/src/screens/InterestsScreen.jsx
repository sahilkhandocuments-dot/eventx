import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getAllInterests, setInterests } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

export default function InterestsScreen() {
  const navigation              = useNavigation()
  const { setInterestsSet }     = useAuth()
  const [all, setAll]           = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    getAllInterests()
      .then((r) => setAll(r.data || []))
      .catch(() => setError('Failed to load interests'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (selected.length === 0) { setError('Please select at least one interest'); return }
    setSaving(true)
    setError('')
    try {
      await setInterests(selected)
      setInterestsSet(true)
      navigation.replace('Main')
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.sub}>Pick your interests to personalise your feed</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.grid}>
          {all.map((interest) => {
            const active = selected.includes(interest.id)
            return (
              <TouchableOpacity
                key={interest.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggle(interest.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {interest.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.count}>{selected.length} selected</Text>
        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnText}>Continue →</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center:    { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  content:   { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  title:     { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '800', marginBottom: SPACING.xs },
  sub:       { color: COLORS.textSub, fontSize: FONTS.base, marginBottom: SPACING.xl },
  error:     { color: COLORS.error, marginBottom: SPACING.md, fontSize: FONTS.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  chipText:       { color: COLORS.textSub, fontSize: FONTS.sm, fontWeight: '600' },
  chipTextActive: { color: COLORS.accentLight },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count:   { color: COLORS.textSub, fontSize: FONTS.sm },
  btn:     { backgroundColor: COLORS.accent, borderRadius: RADIUS.full, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.base },
})
