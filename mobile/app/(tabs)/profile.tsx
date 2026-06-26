import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { MOCK_REPORTS } from '@/lib/mockData'
import { useAppStore } from '@/lib/store'
import { Colors } from '@/constants/colors'
import { ReportCard } from '@/components/report/ReportCard'

const LIMA_CENTER = { lat: -12.0464, lng: -77.0428 }

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const cacheReport = useAppStore((s) => s.cacheReport)

  const { data } = useQuery({
    queryKey: ['reports', 'profile'],
    queryFn: () =>
      api.reports.list({ lat: LIMA_CENTER.lat, lng: LIMA_CENTER.lng, radius: 50 }),
    retry: 1,
  })

  const apiReports = data?.reports ?? []
  const apiIds = new Set(apiReports.map((r) => r.id))
  const reports = [...apiReports, ...MOCK_REPORTS.filter((r) => !apiIds.has(r.id))]
  const totalReports = reports.length
  const resolved = reports.filter((r) => r.status === 'resolved').length
  const totalSupport = reports.reduce((sum, r) => sum + r.supportCount, 0)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Ciudadano ReportaPe</Text>
        <Text style={styles.sub}>Lima, Perú</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <StatCard label="Reportes" value={totalReports} icon="document-text-outline" />
        <StatCard label="Resueltos" value={resolved} icon="checkmark-circle-outline" color={Colors.success} />
        <StatCard label="Apoyos" value={totalSupport} icon="hand-right-outline" color={Colors.secondary} />
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="warning-outline"
            label="Nueva denuncia"
            color={Colors.primary}
            onPress={() => router.push('/report/new')}
          />
          <ActionButton
            icon="add-circle-outline"
            label="Nuevo reporte"
            color={Colors.primary}
            onPress={() => router.push('/report/new')}
          />
        </View>
      </View>

      {/* Recent reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportes recientes</Text>
        <View style={styles.reportsList}>
          {reports
            .sort((a, b) => b.supportCount - a.supportCount)
            .slice(0, 3)
            .map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPress={() => { cacheReport(report); router.push(`/report/${report.id}`) }}
              />
            ))}
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de ReportaPe</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            ReportaPe es una plataforma cívica que transforma denuncias ciudadanas en evidencia
            estructurada usando datos reales del Estado peruano (INFOBRAS, MEF, OEFA, GeoPerú).
          </Text>
          <View style={styles.aboutRow}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
            <Text style={styles.aboutRowText}>Datos verificados del Estado</Text>
          </View>
          <View style={styles.aboutRow}>
            <Ionicons name="document-text" size={16} color={Colors.secondary} />
            <Text style={styles.aboutRowText}>Expedientes formales con IA</Text>
          </View>
          <View style={styles.aboutRow}>
            <Ionicons name="people" size={16} color={Colors.secondary} />
            <Text style={styles.aboutRowText}>Denuncias colectivas vecinales</Text>
          </View>
        </View>
      </View>

      {/* Version */}
      <Text style={styles.version}>ReportaPe v1.0 · Torneo Vibecoding PUCP 2026</Text>
    </ScrollView>
  )
}

function StatCard({
  label,
  value,
  icon,
  color = Colors.primary,
}: {
  label: string
  value: number
  icon: keyof typeof Ionicons.glyphMap
  color?: string
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { borderColor: color, backgroundColor: color + '12' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingBottom: 28,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { fontSize: 36 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.surface },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  section: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  reportsList: { gap: 12 },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aboutText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aboutRowText: { fontSize: 13, color: Colors.text },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textDisabled,
    marginTop: 24,
    paddingBottom: 8,
  },
})
