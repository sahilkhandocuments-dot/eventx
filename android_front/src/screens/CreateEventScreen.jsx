import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { createEvent } from '../services/api'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

const CATEGORIES = ['Tech', 'Cultural', 'Sports', 'Music', 'Art', 'Business', 'Other']

export default function CreateEventScreen() {
  const navigation = useNavigation()
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Tech',
    capacity: '',
    price: '0',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleCreate = async () => {
    if (!form.title || !form.date || !form.location) {
      setError('Title, date and location are required')
      return
    }
    setError('')
    setLoading(true)
    try {
      await createEvent({
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        price: parseFloat(form.price) || 0,
      })
      Alert.alert('✅ Created', 'Your event has been submitted for review.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Field label="Event Title *" placeholder="e.g. Hackathon 2026">
          <TextInput style={styles.input} placeholder="e.g. Hackathon 2026" placeholderTextColor={COLORS.textMuted}
            value={form.title} onChangeText={(v) => update('title', v)} />
        </Field>

        <Field label="Description">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Tell attendees about your event..."
            placeholderTextColor={COLORS.textMuted}
            value={form.description}
            onChangeText={(v) => update('description', v)}
            multiline
            numberOfLines={4}
          />
        </Field>

        <Field label="Date & Time * (YYYY-MM-DDTHH:MM)">
          <TextInput style={styles.input} placeholder="2026-03-15T10:00" placeholderTextColor={COLORS.textMuted}
            value={form.date} onChangeText={(v) => update('date', v)} />
        </Field>

        <Field label="Location *">
          <TextInput style={styles.input} placeholder="Venue / City" placeholderTextColor={COLORS.textMuted}
            value={form.location} onChangeText={(v) => update('location', v)} />
        </Field>

        <Field label="Category">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, form.category === cat && styles.categoryChipActive]}
                  onPress={() => update('category', cat)}
                >
                  <Text style={[styles.categoryText, form.category === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Capacity</Text>
            <TextInput style={styles.input} placeholder="e.g. 200" placeholderTextColor={COLORS.textMuted}
              value={form.capacity} onChangeText={(v) => update('capacity', v)} keyboardType="numeric" />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput style={styles.input} placeholder="0 = Free" placeholderTextColor={COLORS.textMuted}
              value={form.price} onChangeText={(v) => update('price', v)} keyboardType="decimal-pad" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnText}>Submit for Review</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  errorBox: {
    backgroundColor: '#2d1212',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontSize: FONTS.sm },
  field:   { marginBottom: SPACING.md },
  label:   { color: COLORS.textSub, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: FONTS.base,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  categoryScroll: { marginTop: 4 },
  categoryRow: { flexDirection: 'row', gap: SPACING.sm, paddingBottom: SPACING.xs },
  categoryChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  categoryChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentDim },
  categoryText:       { color: COLORS.textSub, fontSize: FONTS.sm, fontWeight: '600' },
  categoryTextActive: { color: COLORS.accentLight },
  row:       { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  halfField: { flex: 1 },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: COLORS.white, fontSize: FONTS.md, fontWeight: '700' },
})
