import { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { Report } from '@/lib/types'
import { MOCK_REPORTS } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { Colors } from '@/constants/colors'
import { CATEGORIES, CategoryKey } from '@/constants/categories'
import { ReportCard } from '@/components/report/ReportCard'

const LIMA_CENTER = { lat: -12.0464, lng: -77.0428 }

export default function ExploreScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)

  const cacheReport = useAppStore((s) => s.cacheReport)
  const userReports = useAppStore((s) => s.userReports)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'explore', activeCategory],
    queryFn: () =>
      api.reports.list({
        lat: LIMA_CENTER.lat,
        lng: LIMA_CENTER.lng,
        radius: 20,
        category: activeCategory ?? undefined,
      }),
    retry: 1,
  })

  const allReports: Report[] = (() => {
    const apiReports = data?.reports ?? []
    const apiIds = new Set(apiReports.map((r) => r.id))
    const userIds = new Set(userReports.map((r) => r.id))
    const mockFiltered = activeCategory
      ? MOCK_REPORTS.filter((r) => r.category === activeCategory || r.type === activeCategory)
      : MOCK_REPORTS
    const dedupedMock = mockFiltered.filter((r) => !apiIds.has(r.id) && !userIds.has(r.id))
    return [...userReports, ...apiReports, ...dedupedMock].sort((a, b) => b.supportCount - a.supportCount)
  })()

  const filtered = allReports.filter((r) =>
    search
      ? r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.address.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <Text style={styles.headerCount}>
          {filtered.length} reportes en Lima
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.neutral} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o dirección..."
          placeholderTextColor={Colors.textDisabled}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.neutral} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ key: null, label: 'Todos', icon: '🗺️' }, ...CATEGORIES]}
        keyExtractor={(item) => item.key ?? 'all'}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => {
          const isActive = activeCategory === item.key
          return (
            <TouchableOpacity
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveCategory(item.key as CategoryKey | null)}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[styles.filterLabel, isActive && styles.filterLabelActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        }}
      />

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Sin reportes</Text>
              <Text style={styles.emptyText}>
                No hay reportes en esta categoría todavía.
              </Text>
            </View>
          )}
          renderItem={({ item }: { item: Report }) => (
            <ReportCard
              report={item}
              onPress={() => { cacheReport(item); router.push(`/report/${item.id}`) }}
            />
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.surface,
  },
  headerCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
})
