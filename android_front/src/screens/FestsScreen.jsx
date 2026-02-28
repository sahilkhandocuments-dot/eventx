import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TextInput,
  StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getFests } from '../services/api'
import FestCard from '../components/FestCard'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

export default function FestsScreen() {
  const navigation          = useNavigation()
  const [fests, setFests]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const res = await getFests()
      setFests(res.data || [])
      setFiltered(res.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(fests); return }
    const q = search.toLowerCase()
    setFiltered(fests.filter(
      (f) => f.name?.toLowerCase().includes(q) || f.college_name?.toLowerCase().includes(q)
    ))
  }, [search, fests])

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search fests or colleges..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load() }}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <FestCard
            fest={item}
            onPress={() => navigation.navigate('FestDetail', { slug: item.slug })}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.heading}>🎪 College Fests</Text>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No fests found</Text>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  searchIcon:  { fontSize: 16, marginRight: SPACING.xs },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.base, paddingVertical: SPACING.md },
  clearIcon:   { color: COLORS.textMuted, fontSize: 14, paddingLeft: SPACING.xs },
  list:    { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  heading: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '800', marginVertical: SPACING.md },
  empty:   { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xxxl, fontSize: FONTS.base },
})
