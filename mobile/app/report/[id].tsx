import { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { Colors, CategoryColors } from '@/constants/colors'
import { CATEGORIES } from '@/constants/categories'
import { Badge } from '@/components/ui/Badge'
import { SupportButton } from '@/components/ui/SupportButton'
import { DataRow } from '@/components/report/DataRow'

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [citizenName, setCitizenName] = useState('')

  const getCachedReport = useAppStore((s) => s.getCachedReport)
  const cachedReport = getCachedReport(id ?? '')

  const { data: apiReport, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.reports.get(id),
    enabled: !!id && !cachedReport,
    retry: 1,
  })

  const report = cachedReport ?? apiReport

  const supportMutation = useMutation({
    mutationFn: () => api.reports.support(id, { citizenName }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['report', id] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setShowSupportModal(false)
      setCitizenName('')
      if (res.collectiveRequestSent) {
        Alert.alert(
          '🎉 ¡Solicitud colectiva enviada!',
          res.message ?? 'Se alcanzó el umbral de vecinos. La entidad responsable debe responder en 30 días.',
          [{ text: 'Entendido' }],
        )
      }
    },
    onError: () => {
      Alert.alert('Error', 'No se pudo registrar tu apoyo. Intenta nuevamente.')
    },
  })

  if ((isLoading && !cachedReport) || !report) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  const category = CATEGORIES.find((c) => c.key === report.category)
  const categoryColor = CategoryColors[report.category] ?? Colors.neutral

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Header */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: report.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.photoOverlay} />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.surface} />
          </TouchableOpacity>

          {/* Category badge on photo */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryIcon}>{category?.icon}</Text>
            <Text style={styles.categoryLabel}>{category?.label}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Title + Status */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={3}>{report.title}</Text>
            <Badge status={report.status} />
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{report.address}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(report.createdAt).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{report.description}</Text>

          {/* State Data */}
          {report.stateData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Datos del Estado verificados
              </Text>
              {report.stateData.infobras && (
                <DataRow
                  found={report.stateData.infobras.found}
                  label="Obra en INFOBRAS"
                  value={
                    report.stateData.infobras.found
                      ? `Cód. ${report.stateData.infobras.code} · ${report.stateData.infobras.daysWithoutMovement}d sin movimiento`
                      : undefined
                  }
                />
              )}
              {report.stateData.mef && (
                <DataRow
                  found={report.stateData.mef.found}
                  label="Presupuesto MEF"
                  value={
                    report.stateData.mef.found
                      ? `S/. ${report.stateData.mef.assigned?.toLocaleString()} asignados · ${report.stateData.mef.executionPct}% ejecutado`
                      : undefined
                  }
                />
              )}
              {report.stateData.oefa && (
                <DataRow
                  found={report.stateData.oefa.found}
                  label="Antecedentes OEFA"
                  value={
                    report.stateData.oefa.found
                      ? `${report.stateData.oefa.previousInspections} fiscalizaciones previas`
                      : undefined
                  }
                />
              )}
              {report.stateData.geo && (
                <DataRow
                  found={report.stateData.geo.found}
                  label="Responsable"
                  value={report.stateData.geo.entity}
                  isNeutral
                />
              )}
            </View>
          )}

          {/* Expediente */}
          {report.expedienteUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expediente generado</Text>
              <TouchableOpacity
                style={styles.expedienteBtn}
                onPress={() => Linking.openURL(report.expedienteUrl!)}
              >
                <Ionicons name="document-text" size={20} color={Colors.secondary} />
                <Text style={styles.expedienteBtnText}>Descargar expediente PDF</Text>
                <Ionicons name="download-outline" size={18} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Responsible Channel */}
          {report.responsibleChannel && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Canal de denuncia</Text>
              <View style={styles.channelCard}>
                <Ionicons name="information-circle" size={18} color={Colors.secondary} />
                <Text style={styles.channelText}>{report.responsibleEntity}</Text>
              </View>
              <TouchableOpacity
                style={styles.channelLink}
                onPress={() => Linking.openURL(report.responsibleChannel!)}
              >
                <Text style={styles.channelLinkText}>Ir al canal oficial →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apoyo vecinal</Text>
            <View style={styles.supportRow}>
              <View style={styles.supportCount}>
                <Text style={styles.supportNumber}>{report.supportCount}</Text>
                <Text style={styles.supportLabel}>
                  {report.supportCount === 1 ? 'vecino apoya' : 'vecinos apoyan'}
                </Text>
              </View>
              <View style={styles.supportProgress}>
                <View
                  style={[
                    styles.supportBar,
                    {
                      width: `${Math.min((report.supportCount / 15) * 100, 100)}%`,
                      backgroundColor:
                        report.supportCount >= 15 ? Colors.success : Colors.secondary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.supportGoal}>Meta: 15 vecinos</Text>
            </View>

            {report.collectiveRequestSent && (
              <View style={styles.collectiveAlert}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.collectiveText}>
                  Solicitud colectiva enviada. La entidad tiene 30 días para responder.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Support Button */}
      <View style={[styles.supportFixed, { paddingBottom: insets.bottom + 12 }]}>
        <SupportButton
          supported={false}
          count={report.supportCount}
          onPress={() => setShowSupportModal(true)}
          disabled={report.collectiveRequestSent}
        />
      </View>

      {/* Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.modalTitle}>Apoyar este reporte</Text>
            <Text style={styles.modalSubtitle}>
              Tu nombre aparecerá en la solicitud colectiva si se alcanza el umbral.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tu nombre completo"
              placeholderTextColor={Colors.textDisabled}
              value={citizenName}
              onChangeText={setCitizenName}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.modalBtn,
                (!citizenName.trim() || supportMutation.isPending) && styles.modalBtnDisabled,
              ]}
              onPress={() => supportMutation.mutate()}
              disabled={!citizenName.trim() || supportMutation.isPending}
            >
              {supportMutation.isPending ? (
                <ActivityIndicator color={Colors.surface} size="small" />
              ) : (
                <Text style={styles.modalBtnText}>Confirmar apoyo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSupportModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoContainer: { height: 260, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { color: Colors.surface, fontWeight: '600', fontSize: 13 },
  body: { padding: 20, gap: 16 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
  },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  expedienteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  expedienteBtnText: {
    flex: 1,
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondaryLight,
    padding: 12,
    borderRadius: 10,
  },
  channelText: { color: Colors.secondary, fontSize: 14, fontWeight: '500' },
  channelLink: { alignSelf: 'flex-start' },
  channelLinkText: { color: Colors.secondary, fontSize: 13, fontWeight: '600' },
  supportRow: { gap: 8 },
  supportCount: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  supportNumber: { fontSize: 28, fontWeight: '700', color: Colors.text },
  supportLabel: { fontSize: 14, color: Colors.textSecondary },
  supportProgress: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  supportBar: { height: '100%', borderRadius: 3 },
  supportGoal: { fontSize: 12, color: Colors.textSecondary },
  collectiveAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: 12,
    borderRadius: 10,
  },
  collectiveText: { flex: 1, color: Colors.success, fontSize: 13, lineHeight: 18 },
  supportFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  modalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalBtnDisabled: { opacity: 0.5 },
  modalBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 15 },
  modalCancel: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 4,
  },
})
