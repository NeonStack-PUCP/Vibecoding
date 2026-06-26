import { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Colors } from '@/constants/colors'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { CategoryGrid } from '@/components/report/CategoryGrid'
import { PhotoCapture } from '@/components/report/PhotoCapture'
import { LocationPicker } from '@/components/report/LocationPicker'
import { Button } from '@/components/ui/Button'

type ProposalCategory = 'parque' | 'propuesta' | 'pista' | 'luz'

interface ProposalFormState {
  step: 1 | 2 | 3 | 4
  category: ProposalCategory | null
  photoUri: string | null
  photoUrl: string | null
  latitude: number | null
  longitude: number | null
  address: string
  title: string
  description: string
  benefit: string
}

const INITIAL: ProposalFormState = {
  step: 1,
  category: null,
  photoUri: null,
  photoUrl: null,
  latitude: null,
  longitude: null,
  address: '',
  title: '',
  description: '',
  benefit: '',
}

const STEP_LABELS = ['Categoría', 'Foto', 'Ubicación', 'Detalle']

export default function NewProposalScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [form, setForm] = useState<ProposalFormState>(INITIAL)

  const update = (patch: Partial<ProposalFormState>) =>
    setForm((f) => ({ ...f, ...patch }))

  const uploadMutation = useMutation({
    mutationFn: (uri: string) => api.upload.photo(uri),
    onSuccess: (url) => update({ photoUrl: url }),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      api.reports.create({
        type: 'propuesta',
        category: form.category!,
        title: form.title || `Propuesta: ${form.category} en ${form.address}`,
        description: `${form.description}\n\nBeneficio esperado: ${form.benefit}`,
        latitude: form.latitude!,
        longitude: form.longitude!,
        photoUrl: form.photoUrl!,
      }),
    onSuccess: (report) => {
      router.replace(`/report/${report.id}`)
    },
    onError: () => {
      Alert.alert('Error', 'No se pudo enviar la propuesta. Intenta nuevamente.')
    },
  })

  const canAdvance = () => {
    if (form.step === 1) return form.category !== null
    if (form.step === 2) return form.photoUri !== null
    if (form.step === 3) return form.latitude !== null
    if (form.step === 4) return form.description.trim().length > 10 && form.title.trim().length > 0
    return false
  }

  const handleNext = async () => {
    if (form.step === 2 && form.photoUri && !form.photoUrl) {
      await uploadMutation.mutateAsync(form.photoUri)
    }
    if (form.step === 4) {
      createMutation.mutate()
      return
    }
    update({ step: ((form.step + 1) as ProposalFormState['step']) })
  }

  const handleBack = () => {
    if (form.step === 1) { router.back(); return }
    update({ step: ((form.step - 1) as ProposalFormState['step']) })
  }

  const isLoading = uploadMutation.isPending || createMutation.isPending

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons
              name={form.step === 1 ? 'close' : 'arrow-back'}
              size={24}
              color={Colors.surface}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva propuesta</Text>
          <View style={{ width: 40 }} />
        </View>

        <StepIndicator steps={STEP_LABELS} currentStep={form.step} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* PASO 1 — Categoría */}
          {form.step === 1 && (
            <View style={styles.step}>
              <Text style={styles.title}>¿Qué quieres mejorar?</Text>
              <Text style={styles.subtitle}>
                Elige el tipo de mejora que propones para tu barrio.
              </Text>

              {/* Benefit callout */}
              <View style={styles.infoBanner}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  Si tu propuesta ya existe en INVIERTE.pe pero no avanza, la convertimos en
                  denuncia automáticamente.
                </Text>
              </View>

              <CategoryGrid
                selected={form.category as any}
                type="propuesta"
                onSelect={(k) => update({ category: k as ProposalCategory })}
              />
            </View>
          )}

          {/* PASO 2 — Foto */}
          {form.step === 2 && (
            <View style={styles.step}>
              <Text style={styles.title}>Foto referencial</Text>
              <Text style={styles.subtitle}>
                Muestra el lugar donde propones la mejora o una imagen que illustre la idea.
              </Text>
              <PhotoCapture
                uri={form.photoUri}
                onCapture={(uri) => update({ photoUri: uri, photoUrl: null })}
                onRemove={() => update({ photoUri: null, photoUrl: null })}
                isUploading={uploadMutation.isPending}
              />
            </View>
          )}

          {/* PASO 3 — Ubicación */}
          {form.step === 3 && (
            <View style={styles.step}>
              <Text style={styles.title}>¿Dónde propones la mejora?</Text>
              <Text style={styles.subtitle}>
                Marca exactamente el lugar donde debería implementarse.
              </Text>
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                address={form.address}
                onLocationChange={(lat, lng, address) =>
                  update({ latitude: lat, longitude: lng, address })
                }
              />
            </View>
          )}

          {/* PASO 4 — Detalle */}
          {form.step === 4 && (
            <View style={styles.step}>
              <Text style={styles.title}>Describe tu propuesta</Text>
              <Text style={styles.subtitle}>
                Explica qué quieres y por qué beneficiaría al barrio.
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Título de la propuesta *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Ciclovía en Av. La Marina entre Jr. Los Olivos y..."
                  placeholderTextColor={Colors.textDisabled}
                  value={form.title}
                  onChangeText={(t) => update({ title: t })}
                  maxLength={100}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Descripción *</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholder="¿Qué necesita hacerse exactamente? ¿Cuánto tiempo lleva este problema sin resolverse?"
                  placeholderTextColor={Colors.textDisabled}
                  value={form.description}
                  onChangeText={(t) => update({ description: t })}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{form.description.length}/500</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Beneficio esperado</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholder="¿A cuántos vecinos beneficiaría? ¿Resolvería qué problema concreto?"
                  placeholderTextColor={Colors.textDisabled}
                  value={form.benefit}
                  onChangeText={(t) => update({ benefit: t })}
                  maxLength={300}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button
            label={
              form.step === 4
                ? createMutation.isPending
                  ? 'Publicando propuesta...'
                  : 'Publicar propuesta'
                : 'Continuar'
            }
            onPress={handleNext}
            disabled={!canAdvance() || isLoading}
            loading={isLoading}
            icon={form.step === 4 ? 'checkmark' : 'arrow-forward'}
            variant={form.step === 4 ? 'secondary' : 'primary'}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.surface },
  content: { flex: 1 },
  contentInner: { paddingBottom: 24 },
  step: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    padding: 14,
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 13, color: '#5B21B6', lineHeight: 18 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
  },
  multiline: { minHeight: 100, lineHeight: 21 },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
})
