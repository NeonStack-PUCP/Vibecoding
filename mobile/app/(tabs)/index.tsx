import { useRef, useState, useMemo } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { Report } from '@/lib/types'
import { Colors, CategoryColors } from '@/constants/colors'
import { ReportBottomSheet } from '@/components/map/ReportBottomSheet'
import { MOCK_REPORTS } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'

const LIMA_INITIAL: Region = {
  latitude: -12.0764,
  longitude: -77.0428,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
}

const LIMA_ZONES = [
  { name: 'Miraflores',        lat: -12.1191, lng: -77.0282, delta: 0.04 },
  { name: 'San Juan de Lurigancho', lat: -11.9802, lng: -77.0021, delta: 0.08 },
  { name: 'Villa El Salvador', lat: -12.2135, lng: -76.9353, delta: 0.06 },
  { name: 'Los Olivos',        lat: -11.9917, lng: -77.0667, delta: 0.05 },
  { name: 'Ate Vitarte',       lat: -12.0271, lng: -76.9181, delta: 0.06 },
  { name: 'Barranco',          lat: -12.1484, lng: -77.0224, delta: 0.03 },
  { name: 'Chorrillos',        lat: -12.1684, lng: -76.9985, delta: 0.05 },
  { name: 'Lince',             lat: -12.0897, lng: -77.0364, delta: 0.03 },
  { name: 'San Martín de Porres', lat: -12.0236, lng: -77.0878, delta: 0.05 },
  { name: 'La Victoria',       lat: -12.0651, lng: -77.0184, delta: 0.04 },
  { name: 'Comas',             lat: -11.9337, lng: -77.0493, delta: 0.05 },
  { name: 'Pueblo Libre',      lat: -12.0780, lng: -77.0631, delta: 0.03 },
  { name: 'Surco',             lat: -12.1474, lng: -76.9921, delta: 0.05 },
  { name: 'Breña',             lat: -12.0559, lng: -77.0507, delta: 0.03 },
  { name: 'Cercado de Lima',   lat: -12.0566, lng: -77.0369, delta: 0.04 },
]

const FILTERS = [
  { key: null,        label: 'Todo',      icon: '🗺️' },
  { key: 'denuncia',  label: 'Denuncias', icon: '⚠️' },
  { key: 'propuesta', label: 'Propuestas',icon: '💡' },
  { key: 'obra',      label: 'Obras',     icon: '🏗️' },
  { key: 'basura',    label: 'Basura',    icon: '🗑️' },
  { key: 'agua',      label: 'Agua',      icon: '💧' },
  { key: 'pista',     label: 'Pistas',    icon: '🛣️' },
  { key: 'seguridad', label: 'Seguridad', icon: '🚨' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

function getPinEmoji(report: Report): string {
  const map: Record<string, string> = {
    obra: '🏗️', basura: '🗑️', agua: '💧', luz: '💡',
    ambiente: '🌿', pista: '🛣️', parque: '🌳', seguridad: '🚨',
    propuesta: '💡', otro: '📋',
  }
  return map[report.category] ?? '📋'
}

function getPinColor(report: Report): string {
  if (report.type === 'propuesta') return '#8B5CF6'
  return CategoryColors[report.category] ?? Colors.neutral
}

export default function MapScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const mapRef = useRef<MapView>(null)
  const [region, setRegion] = useState(LIMA_INITIAL)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showZonePicker, setShowZonePicker] = useState(false)
  const [activeZone, setActiveZone] = useState<string | null>(null)

  const cacheReport = useAppStore((s) => s.cacheReport)
  const userReports = useAppStore((s) => s.userReports)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', region.latitude, region.longitude],
    queryFn: () =>
      api.reports.list({ lat: region.latitude, lng: region.longitude, radius: 20 }),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const allReports = useMemo(() => {
    const apiReports = data?.reports ?? []
    const apiIds = new Set(apiReports.map((r) => r.id))
    const userIds = new Set(userReports.map((r) => r.id))
    const dedupedMock = MOCK_REPORTS.filter((r) => !apiIds.has(r.id) && !userIds.has(r.id))
    return [...userReports, ...apiReports, ...dedupedMock]
  }, [data, userReports])

  const visibleReports = useMemo(() => {
    let filtered = allReports

    // Category / type filter
    if (activeFilter) {
      if (activeFilter === 'denuncia' || activeFilter === 'propuesta') {
        filtered = filtered.filter((r) => r.type === activeFilter)
      } else {
        filtered = filtered.filter((r) => r.category === activeFilter)
      }
    }

    // Zone filter (active zone selected)
    if (activeZone) {
      const q = activeZone.toLowerCase()
      filtered = filtered.filter((r) =>
        (r.address ?? '').toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((r) =>
        (r.address ?? '').toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [allReports, activeFilter, activeZone, searchQuery])

  const stats = useMemo(() => ({
    total: allReports.length,
    propuestas: allReports.filter((r) => r.type === 'propuesta').length,
    vecinos: allReports.reduce((acc, r) => acc + r.supportCount, 0),
  }), [allReports])

  const navigateToZone = (zone: typeof LIMA_ZONES[0]) => {
    setActiveZone(zone.name)
    setShowZonePicker(false)
    setSearchQuery(zone.name)
    mapRef.current?.animateToRegion({
      latitude: zone.lat,
      longitude: zone.lng,
      latitudeDelta: zone.delta,
      longitudeDelta: zone.delta,
    }, 700)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveZone(null)
  }

  const filteredZones = LIMA_ZONES.filter((z) =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={LIMA_INITIAL}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsBuildings
        showsPointsOfInterest={false}
      >
        {visibleReports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            onPress={() => { cacheReport(report); setSelectedReport(report) }}
            tracksViewChanges={false}
          >
            <View style={[styles.pin, { backgroundColor: getPinColor(report) }]}>
              <Text style={styles.pinEmoji}>{getPinEmoji(report)}</Text>
              {report.supportCount >= 50 && (
                <View style={styles.pinBadge}>
                  <Text style={styles.pinBadgeText}>
                    {report.supportCount >= 1000
                      ? `${Math.floor(report.supportCount / 1000)}k`
                      : report.supportCount}
                  </Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>ReportaPe</Text>
          <Text style={styles.headerSub}>Lima, Perú</Text>
        </View>
        <View style={styles.headerStats}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <View style={styles.statChip}>
                <Text style={styles.statText}>📍 {stats.total}</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: 'rgba(139,92,246,0.85)' }]}>
                <Text style={styles.statText}>💡 {stats.propuestas}</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: 'rgba(22,163,74,0.85)' }]}>
                <Text style={styles.statText}>👥 {stats.vecinos}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      <View style={[styles.searchRow, { top: insets.top + 62 }]}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setShowZonePicker(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <Text
            style={[styles.searchText, searchQuery ? styles.searchTextActive : null]}
            numberOfLines={1}
          >
            {searchQuery || 'Buscar zona o dirección...'}
          </Text>
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.searchZoneBadge}>
              <Text style={styles.searchZoneBadgeText}>Zona</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── FILTER PILLS ── */}
      <View style={[styles.filterBar, { top: insets.top + 110 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={String(f.key)}
              style={[styles.pill, activeFilter === f.key && styles.pillActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.pillEmoji}>{f.icon}</Text>
              <Text style={[styles.pillLabel, activeFilter === f.key && styles.pillLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Count chip when filtered */}
      {(activeFilter || activeZone) && (
        <View style={[styles.resultChip, { top: insets.top + 152 }]}>
          <Text style={styles.resultChipText}>{visibleReports.length} resultado{visibleReports.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity onPress={() => { setActiveFilter(null); clearSearch() }}>
            <Ionicons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── LOCATION BTN ── */}
      <TouchableOpacity
        style={[styles.locationBtn, { bottom: selectedReport ? 330 : 110 }]}
        onPress={() => { clearSearch(); mapRef.current?.animateToRegion(LIMA_INITIAL, 700) }}
      >
        <Ionicons name="locate" size={22} color={Colors.secondary} />
      </TouchableOpacity>

      {/* ── FAB ÚNICO ── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 82 }]}
        onPress={() => router.push('/report/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Reportar</Text>
      </TouchableOpacity>

      {/* ── BOTTOM SHEET ── */}
      {selectedReport && (
        <ReportBottomSheet
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onViewDetail={() => {
            setSelectedReport(null)
            router.push(`/report/${selectedReport.id}`)
          }}
        />
      )}

      {/* ── ZONE PICKER MODAL ── */}
      <Modal
        visible={showZonePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowZonePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Buscar por zona</Text>

            {/* Search input in modal */}
            <View style={styles.modalSearchWrap}>
              <Ionicons name="search" size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Escribe un distrito..."
                placeholderTextColor={Colors.textDisabled}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Zone list */}
            <FlatList
              data={filteredZones}
              keyExtractor={(z) => z.name}
              style={styles.zoneList}
              renderItem={({ item: zone }) => (
                <TouchableOpacity
                  style={[styles.zoneItem, activeZone === zone.name && styles.zoneItemActive]}
                  onPress={() => navigateToZone(zone)}
                >
                  <Ionicons name="location" size={18} color={activeZone === zone.name ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.zoneName, activeZone === zone.name && styles.zoneNameActive]}>
                    {zone.name}
                  </Text>
                  <Text style={styles.zoneCount}>
                    {allReports.filter((r) =>
                      (r.address ?? '').toLowerCase().includes(zone.name.toLowerCase()) ||
                      r.title.toLowerCase().includes(zone.name.toLowerCase())
                    ).length} reportes
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyZone}>No hay zonas con ese nombre</Text>
              }
            />

            <TouchableOpacity style={styles.modalClose} onPress={() => setShowZonePicker(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  headerLeft: { gap: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerStats: { flexDirection: 'row', gap: 6 },
  statChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  searchRow: { position: 'absolute', left: 12, right: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 24,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  searchText: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  searchTextActive: { color: Colors.text },
  searchZoneBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  searchZoneBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },

  filterBar: { position: 'absolute', left: 0, right: 0 },
  filterContent: { paddingHorizontal: 12, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  pillActive: { backgroundColor: Colors.primary },
  pillEmoji: { fontSize: 13 },
  pillLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  pillLabelActive: { color: '#fff' },

  resultChip: {
    position: 'absolute', left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.secondary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
  },
  resultChipText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  pin: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
  },
  pinEmoji: { fontSize: 18 },
  pinBadge: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: Colors.primary, borderRadius: 8,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: '#fff',
  },
  pinBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  locationBtn: {
    position: 'absolute', right: 14,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  fab: {
    position: 'absolute', right: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30,
    gap: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 7,
  },
  fabText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: 32, maxHeight: '80%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, paddingHorizontal: 20, marginBottom: 12 },
  modalSearchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, backgroundColor: Colors.background, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalSearchInput: { flex: 1, fontSize: 15, color: Colors.text },
  zoneList: { flex: 1 },
  zoneItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  zoneItemActive: { backgroundColor: Colors.primaryLight },
  zoneName: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  zoneNameActive: { color: Colors.primary, fontWeight: '700' },
  zoneCount: { fontSize: 12, color: Colors.textSecondary },
  emptyZone: { textAlign: 'center', padding: 24, color: Colors.textSecondary },
  modalClose: {
    marginHorizontal: 20, marginTop: 12,
    backgroundColor: Colors.background, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  modalCloseText: { fontSize: 15, fontWeight: '600', color: Colors.text },
})
