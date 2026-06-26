import { StyleSheet, View, Text, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { Colors } from '@/constants/colors'
import type { CategoryKey } from '@/constants/categories'

interface StateDataPanelProps {
  category: CategoryKey
  latitude: number
  longitude: number
}

export function StateDataPanel({ category, latitude, longitude }: StateDataPanelProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stateData', category, latitude.toFixed(3), longitude.toFixed(3)],
    queryFn: () => api.stateData.query({ category, lat: latitude, lng: longitude }),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
        <Text style={styles.headerText}>Cruzando con datos del Estado</Text>
        {isLoading && <ActivityIndicator color={Colors.secondary} size="small" />}
      </View>

      {isLoading && (
        <View style={styles.loadingRow}>
          <Text style={styles.loadingText}>
            Consultando INFOBRAS, MEF, OEFA...
          </Text>
        </View>
      )}

      {isError && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={Colors.warning} />
          <Text style={styles.errorText}>
            No se pudo conectar con las fuentes del Estado. Tu reporte igual se enviará.
          </Text>
        </View>
      )}

      {data && (
        <View style={styles.results}>
          {data.infobras && (
            <DataItem
              icon={data.infobras.found ? '🏗️' : '—'}
              label="INFOBRAS"
              value={
                data.infobras.found
                  ? `Obra registrada · ${data.infobras.daysWithoutMovement}d sin movimiento`
                  : 'Sin obras registradas en la zona'
              }
              found={data.infobras.found}
            />
          )}
          {data.mef && (
            <DataItem
              icon={data.mef.found ? '💰' : '—'}
              label="MEF / Presupuesto"
              value={
                data.mef.found
                  ? `S/. ${data.mef.assigned?.toLocaleString()} asignados · ${data.mef.executionPct}% ejecutado`
                  : 'Sin partida presupuestal identificada'
              }
              found={data.mef.found}
            />
          )}
          {data.oefa && (
            <DataItem
              icon={data.oefa.found ? '🌿' : '—'}
              label="OEFA"
              value={
                data.oefa.found
                  ? `${data.oefa.previousInspections} fiscalización(es) previa(s)`
                  : 'Sin antecedentes ambientales'
              }
              found={data.oefa.found}
            />
          )}
          {data.geo?.entity && (
            <DataItem
              icon="🏛️"
              label="Responsable"
              value={data.geo.entity}
              found
              isNeutral
            />
          )}
        </View>
      )}

      <Text style={styles.footer}>
        Esta información se incluirá automáticamente en tu expediente.
      </Text>
    </View>
  )
}

function DataItem({
  icon,
  label,
  value,
  found,
  isNeutral,
}: {
  icon: string
  label: string
  value: string
  found: boolean
  isNeutral?: boolean
}) {
  const color = isNeutral ? Colors.secondary : found ? Colors.success : Colors.neutral

  return (
    <View style={styles.dataItem}>
      <Text style={styles.dataIcon}>{icon}</Text>
      <View style={styles.dataBody}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={[styles.dataValue, { color }]}>{value}</Text>
      </View>
      <Ionicons
        name={isNeutral ? 'information-circle-outline' : found ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={color}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  loadingRow: { paddingVertical: 4 },
  loadingText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  errorText: { flex: 1, fontSize: 12, color: Colors.warning, lineHeight: 17 },
  results: { gap: 8 },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  dataIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  dataBody: { flex: 1, gap: 2 },
  dataLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dataValue: { fontSize: 12, lineHeight: 17 },
  footer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
