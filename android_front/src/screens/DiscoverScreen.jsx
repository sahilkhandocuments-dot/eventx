import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TextInput,
  StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getCityEvents } from '../services/api'
import EventCard from '../components/EventCard'
import { COLORS, FONTS, SPACING, RADIUS } from '../theme'

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Music', 'Art', 'Business', 'Other']

export default function DiscoverScreen() {
  const navigation            = useNavigation()
  const [events, setEvents]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const res = await getCityEvents()
      setEvents(res.data || [])
      setFiltered(res.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = events
    if (category !== 'All') result = result.filter((e) => e.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, category, events])

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
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

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, category === item && styles.filterChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.filterText, category === item && styles.filterTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.filterBar}
      />

      {/* Events */}
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
          <EventCard
            event={item}
            onPress={() => navigation.navigate('EventDetails', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              {search || category !== 'All' ? 'No events match your search' : 'No events available'}
            </Text>
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
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  searchIcon:  { fontSize: 16, marginRight: SPACING.xs },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.base, paddingVertical: SPACING.md },
  clearIcon:   { color: COLORS.textMuted, fontSize: 14, paddingLeft: SPACING.xs },
  filterBar:   { flexGrow: 0, marginBottom: SPACING.sm },
  filterList:  { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  filterChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentDim },
  filterText:       { color: COLORS.textSub, fontSize: FONTS.sm, fontWeight: '600' },
  filterTextActive: { color: COLORS.accentLight },
  list:  { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xxxl, fontSize: FONTS.base },
})
