import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

export default function LoginScreen() {
  const navigation          = useNavigation()
  const { saveAuth, interestsSet } = useAuth()
  const [email, setEmail]   = useState('')
  const [password, setPwd]  = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)
    try {
      const res = await login(email.trim().toLowerCase(), password)
      await saveAuth(res.data)
      if (!res.data.interests_set) {
        navigation.replace('Interests')
      } else {
        navigation.replace('Main')
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>⚡ EventX</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to your account</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPwd}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Signup')}>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logo: {
    color: COLORS.accentLight,
    fontSize: FONTS.xxl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.xxl,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  sub: {
    color: COLORS.textSub,
    fontSize: FONTS.base,
    marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: '#2d1212',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontSize: FONTS.sm },
  form: { gap: SPACING.sm },
  label: {
    color: COLORS.textSub,
    fontSize: FONTS.sm,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: SPACING.sm,
  },
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
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: FONTS.md, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: { color: COLORS.textSub, fontSize: FONTS.base },
  link: { color: COLORS.accentLight, fontSize: FONTS.base, fontWeight: '700' },
})
