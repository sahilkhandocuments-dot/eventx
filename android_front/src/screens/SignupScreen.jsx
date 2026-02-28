import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { signup } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

export default function SignupScreen() {
  const navigation          = useNavigation()
  const { saveAuth }        = useAuth()
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [password, setPwd]  = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)
    try {
      const res = await signup(name.trim(), email.trim().toLowerCase(), password)
      await saveAuth(res.data)
      navigation.replace('Interests')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Signup failed. Please try again.')
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Join thousands of event-goers</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.form}>
          {[
            { label: 'Full Name',        value: name,     setter: setName,    placeholder: 'John Doe',            secure: false, keyboard: 'default' },
            { label: 'Email',            value: email,    setter: setEmail,   placeholder: 'you@example.com',     secure: false, keyboard: 'email-address' },
            { label: 'Password',         value: password, setter: setPwd,     placeholder: '••••••••',            secure: true,  keyboard: 'default' },
            { label: 'Confirm Password', value: confirm,  setter: setConfirm, placeholder: '••••••••',            secure: true,  keyboard: 'default' },
          ].map((field) => (
            <View key={field.label}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={field.value}
                onChangeText={field.setter}
                secureTextEntry={field.secure}
                keyboardType={field.keyboard}
                autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl },
  logo: {
    color: COLORS.accentLight,
    fontSize: FONTS.xxl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  title: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '800', marginBottom: SPACING.xs },
  sub:   { color: COLORS.textSub, fontSize: FONTS.base, marginBottom: SPACING.xl },
  errorBox: {
    backgroundColor: '#2d1212',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontSize: FONTS.sm },
  form: { gap: SPACING.xs },
  label: { color: COLORS.textSub, fontSize: FONTS.sm, fontWeight: '600', marginTop: SPACING.sm, marginBottom: 2 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textSub, fontSize: FONTS.base },
  link: { color: COLORS.accentLight, fontSize: FONTS.base, fontWeight: '700' },
})
