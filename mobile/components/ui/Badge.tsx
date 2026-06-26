import { StyleSheet, View, Text } from 'react-native'
import { Colors } from '@/constants/colors'
import type { ReportStatus } from '@/lib/types'

const STATUS_CONFIG: Record<ReportStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Procesando', bg: Colors.warningLight, text: Colors.warning },
  active: { label: 'Activo', bg: Colors.primaryLight, text: Colors.primary },
  pending_response: { label: 'Enviado', bg: Colors.secondaryLight, text: Colors.secondary },
  resolved: { label: 'Resuelto', bg: Colors.successLight, text: Colors.success },
}

interface BadgeProps {
  status: ReportStatus
}

export function Badge({ status }: BadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
})
