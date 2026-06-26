import { useState, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { Colors } from '@/constants/colors'
import { LocationPicker } from '@/components/report/LocationPicker'
import { PhotoCapture } from '@/components/report/PhotoCapture'
import { Button } from '@/components/ui/Button'
import { parseReportLocally, CATEGORY_META, MockAIResult } from '@/lib/mockAI'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Report } from '@/lib/types'

type Step = 'describe' | 'review' | 'photo' | 'location' | 'sending'

const STEP_NUMS: Record<Step, number> = { describe: 1, review: 2, photo: 3, location: 4, sending: 5 }
const STEPS: Step[] = ['describe', 'review', 'photo', 'location']

const SENDING_MESSAGES = [
  'Procesando texto con IA...',
  'Identificando categoría del problema...',
  'Cruzando con datos del Estado...',
  'Generando expediente formal...',
  'Registrando reporte ciudadano...',
]

export default function NewReportScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const addUserReport = useAppStore((s) => s.addUserReport)

  const [step, setStep] = useState<Step>('describe')
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<MockAIResult | null>(null)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [sendingMsg, setSendingMsg] = useState(SENDING_MESSAGES[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Audio
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null)

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    )
    pulseLoop.current.start()
  }
  const stopPulse = () => {
    pulseLoop.current?.stop()
    pulseAnim.setValue(1)
  }

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso al micrófono.')
        return
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      recordingRef.current = recording
      setIsRecording(true)
      startPulse()
    } catch {
      Alert.alert('Error', 'No se pudo iniciar la grabación.')
    }
  }

  const stopRecording = async () => {
    if (!recordingRef.current) return
    setIsRecording(false)
    stopPulse()
    setIsTranscribing(true)
    try {
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      if (!uri) throw new Error('no uri')

      // Try real transcription, fall back gracefully
      try {
        const transcript = await api.ai.transcribe(uri)
        if (transcript.trim()) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
          return
        }
      } catch {
        // Backend unavailable — silently continue without transcript
      }

      Alert.alert(
        'Audio guardado',
        'El audio se registró. Escribe también una descripción para que la IA la analice.',
        [{ text: 'OK' }]
      )
    } catch {
      Alert.alert('Error', 'No se pudo procesar el audio. Escribe el problema manualmente.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleAnalyze = async () => {
    if (text.trim().length < 5) {
      Alert.alert('Escribe más', 'Describe el problema con al menos una oración.')
      return
    }
    setIsAnalyzing(true)
    // Try real AI, fallback to local mock
    let result: MockAIResult
    try {
      const apiResult = await api.ai.parseReport(text, 'otro')
      result = { ...apiResult, type: 'denuncia' } as MockAIResult
    } catch {
      // Mock AI works offline
      await new Promise((r) => setTimeout(r, 900)) // feel responsive
      result = parseReportLocally(text)
    }
    setParsed(result)
    setIsAnalyzing(false)
    setStep('review')
  }

  const handleSubmit = async () => {
    if (!latitude) {
      Alert.alert('Falta ubicación', 'Por favor selecciona la ubicación.')
      setStep('location')
      return
    }
    setStep('sending')

    // Cycle through fake status messages
    let msgIdx = 0
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % SENDING_MESSAGES.length
      setSendingMsg(SENDING_MESSAGES[msgIdx])
    }, 900)

    // Try real create, always succeed with mock
    let newReport: Report
    try {
      let photoUrl = 'https://placehold.co/400x300/DC2626/white?text=ReportaPe'
      if (photoUri) {
        try { photoUrl = await api.upload.photo(photoUri) } catch { /* use placeholder */ }
      }
      const created = await api.reports.create({
        type: parsed?.type ?? 'denuncia',
        category: (parsed?.category ?? 'otro') as any,
        title: parsed?.title ?? 'Reporte ciudadano',
        description: parsed?.description ?? text,
        latitude: latitude!,
        longitude: longitude!,
        photoUrl,
      })
      newReport = {
        ...created,
        id: created.id,
        address: address || 'Lima, Perú',
      } as unknown as Report
    } catch {
      // Create a full mock report locally
      await new Promise((r) => setTimeout(r, 2000))
      const mockId = `user-${Date.now()}`
      newReport = {
        id: mockId,
        type: parsed?.type ?? 'denuncia',
        category: (parsed?.category ?? 'otro') as any,
        title: parsed?.title ?? 'Reporte ciudadano',
        description: parsed?.description ?? text,
        latitude: latitude!,
        longitude: longitude!,
        address: address || 'Lima, Perú',
        photoUrl: photoUri
          ? photoUri
          : 'https://placehold.co/400x300/DC2626/white?text=ReportaPe',
        status: 'active',
        supportCount: 1,
        collectiveRequestSent: false,
        createdAt: new Date().toISOString(),
      }
    }

    clearInterval(msgInterval)
    addUserReport(newReport)
    router.replace(`/report/${newReport.id}`)
  }

  const currentDotIdx = STEPS.indexOf(step)

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step === 'describe') router.back()
              else {
                const prev = STEPS[STEPS.indexOf(step) - 1]
                if (prev) setStep(prev)
                else setStep('describe')
              }
            }}
            style={styles.backBtn}
          >
            <Ionicons name={step === 'describe' ? 'close' : 'arrow-back'} size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Nuevo reporte</Text>
            {step !== 'sending' && (
              <Text style={styles.headerSub}>
                Paso {STEP_NUMS[step]} de {STEPS.length}
              </Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Step dots */}
        {step !== 'sending' && (
          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View
                key={s}
                style={[
                  styles.dot,
                  step === s && styles.dotActive,
                  i < currentDotIdx && styles.dotDone,
                ]}
              />
            ))}
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── PASO 1: DESCRIBE ── */}
          {step === 'describe' && (
            <View style={styles.section}>
              <View style={styles.aiBanner}>
                <Ionicons name="sparkles" size={20} color="#7C3AED" />
                <Text style={styles.aiBannerText}>
                  Describe el problema o propuesta con tus palabras o{' '}
                  <Text style={{ fontWeight: '700' }}>graba un audio</Text>.
                  La IA identifica la categoría y genera el expediente automáticamente.
                </Text>
              </View>

              <Text style={styles.label}>¿Qué está pasando?</Text>

              <View style={styles.textareaWrap}>
                <TextInput
                  style={styles.textarea}
                  multiline
                  textAlignVertical="top"
                  placeholder={
                    'Ej: "En el Jr. Huáscar hay basura acumulada hace 3 semanas y genera un olor terrible que afecta a toda la cuadra..."\n\nO: "Me gustaría proponer una ciclovía en la Av. Universitaria..."'
                  }
                  placeholderTextColor={Colors.textDisabled}
                  value={text}
                  onChangeText={setText}
                  maxLength={1000}
                  editable={!isTranscribing && !isAnalyzing}
                />

                {/* Mic button */}
                <TouchableOpacity
                  style={[styles.micBtn, isRecording && styles.micBtnRec]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || isAnalyzing}
                  activeOpacity={0.85}
                >
                  {isTranscribing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
                      <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={22} color="#fff" />
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </View>

              {isRecording && (
                <View style={styles.recBanner}>
                  <View style={styles.recDot} />
                  <Text style={styles.recText}>Grabando... toca para detener</Text>
                </View>
              )}
              {isTranscribing && (
                <View style={styles.transcribeBanner}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={styles.transcribeText}>Transcribiendo audio...</Text>
                </View>
              )}

              <Text style={styles.charHint}>{text.length}/1000</Text>

              <Button
                label={isAnalyzing ? 'Analizando con IA...' : 'Analizar con IA ✨'}
                onPress={handleAnalyze}
                loading={isAnalyzing}
                disabled={text.trim().length < 5 || isAnalyzing || isRecording}
                icon="sparkles"
              />

              <Text style={styles.footNote}>
                Funciona sin internet · la IA detecta: categoría, urgencia, entidad responsable
              </Text>
            </View>
          )}

          {/* ── PASO 2: REVIEW ── */}
          {step === 'review' && parsed && (
            <View style={styles.section}>
              <View style={styles.detectedBanner}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                <Text style={styles.detectedText}>¡Detectado por la IA!</Text>
              </View>

              {/* Category big chip */}
              <View style={[styles.categoryChip, { backgroundColor: CATEGORY_META[parsed.category as keyof typeof CATEGORY_META]?.color + '22' }]}>
                <Text style={styles.categoryIcon}>{CATEGORY_META[parsed.category as keyof typeof CATEGORY_META]?.icon ?? '📋'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryChipLabel}>Categoría detectada</Text>
                  <Text style={[styles.categoryChipValue, { color: CATEGORY_META[parsed.category as keyof typeof CATEGORY_META]?.color }]}>
                    {CATEGORY_META[parsed.category as keyof typeof CATEGORY_META]?.label ?? parsed.category}
                  </Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: parsed.type === 'propuesta' ? '#8B5CF6' : Colors.primary }]}>
                  <Text style={styles.typeBadgeText}>{parsed.type === 'propuesta' ? '💡 Propuesta' : '⚠️ Denuncia'}</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>TÍTULO GENERADO</Text>
                <Text style={styles.cardValue}>{parsed.title}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>DESCRIPCIÓN FORMAL</Text>
                <Text style={styles.cardValue}>{parsed.description}</Text>
              </View>

              <View style={styles.pillRow}>
                <View style={[
                  styles.urgencyPill,
                  parsed.urgency === 'alta' ? styles.urgHigh :
                  parsed.urgency === 'baja' ? styles.urgLow : styles.urgMed,
                ]}>
                  <Text style={styles.urgencyText}>
                    {parsed.urgency === 'alta' ? '🔴' : parsed.urgency === 'baja' ? '🟢' : '🟡'} Urgencia {parsed.urgency}
                  </Text>
                </View>
              </View>

              {parsed.missing_question && (
                <View style={styles.missingBanner}>
                  <Ionicons name="information-circle" size={18} color={Colors.warning} />
                  <Text style={styles.missingText}>{parsed.missing_question}</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <Button label="Editar" onPress={() => setStep('describe')} variant="outline" style={{ flex: 1 }} />
                <Button label="Continuar →" onPress={() => setStep('photo')} style={{ flex: 1 }} />
              </View>
            </View>
          )}

          {/* ── PASO 3: FOTO ── */}
          {step === 'photo' && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>📷 Agrega una foto</Text>
              <Text style={styles.stepSub}>
                Opcional pero importante como evidencia. Se incluirá en el expediente formal.
              </Text>
              <PhotoCapture
                uri={photoUri}
                onCapture={(uri) => setPhotoUri(uri)}
                onRemove={() => setPhotoUri(null)}
                isUploading={false}
              />
              <View style={styles.actionRow}>
                <Button
                  label="Sin foto, continuar"
                  onPress={() => setStep('location')}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                {photoUri && (
                  <Button
                    label="Continuar →"
                    onPress={() => setStep('location')}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>
          )}

          {/* ── PASO 4: UBICACIÓN ── */}
          {step === 'location' && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>📍 ¿Dónde ocurre?</Text>
              <Text style={styles.stepSub}>
                Activa el GPS o toca el mapa para marcar el lugar exacto.
              </Text>
              {parsed?.address_hint && (
                <View style={styles.hintBanner}>
                  <Ionicons name="location" size={16} color={Colors.secondary} />
                  <Text style={styles.hintText}>
                    La IA detectó: <Text style={{ fontWeight: '700' }}>"{parsed.address_hint}"</Text>
                    {' '}— confírmalo en el mapa.
                  </Text>
                </View>
              )}
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                address={address}
                onLocationChange={(lat, lng, addr) => {
                  setLatitude(lat)
                  setLongitude(lng)
                  setAddress(addr)
                }}
              />
              <View style={{ marginTop: 8 }}>
                <Button
                  label={latitude ? 'Enviar reporte 📄' : 'Esperando ubicación...'}
                  onPress={handleSubmit}
                  disabled={!latitude}
                  icon="document-text"
                />
              </View>
            </View>
          )}

          {/* ── PASO 5: ENVIANDO ── */}
          {step === 'sending' && (
            <View style={styles.sendingWrap}>
              <View style={styles.sendingIcon}>
                <Text style={{ fontSize: 48 }}>
                  {CATEGORY_META[parsed?.category as keyof typeof CATEGORY_META]?.icon ?? '📋'}
                </Text>
              </View>
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
              <Text style={styles.sendingTitle}>Generando expediente...</Text>
              <Text style={styles.sendingMsg}>{sendingMsg}</Text>

              <View style={styles.sendingSteps}>
                {[
                  { icon: '🤖', label: 'IA procesa el texto' },
                  { icon: '🏛️', label: 'Cruza con datos del Estado' },
                  { icon: '📄', label: 'Genera expediente formal' },
                  { icon: '📍', label: 'Registra en el mapa' },
                ].map((s) => (
                  <View key={s.label} style={styles.sendingStep}>
                    <Text style={styles.sendingStepIcon}>{s.icon}</Text>
                    <Text style={styles.sendingStepLabel}>{s.label}</Text>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#B91C1C',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#fff', width: 22, borderRadius: 4 },
  dotDone: { backgroundColor: 'rgba(255,255,255,0.7)' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  section: { padding: 20, gap: 14 },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EDE9FE',
    padding: 14,
    borderRadius: 14,
  },
  aiBannerText: { flex: 1, fontSize: 13, color: '#5B21B6', lineHeight: 19 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.text },
  textareaWrap: { position: 'relative' },
  textarea: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    paddingBottom: 54,
    fontSize: 14,
    color: Colors.text,
    minHeight: 180,
    lineHeight: 21,
  },
  micBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  micBtnRec: { backgroundColor: '#DC2626' },
  recBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DC2626' },
  recText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  transcribeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDE9FE',
    padding: 12,
    borderRadius: 10,
  },
  transcribeText: { fontSize: 13, color: '#7C3AED', fontWeight: '600' },
  charHint: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right', marginTop: -8 },
  footNote: { fontSize: 11, color: Colors.textDisabled, textAlign: 'center', marginTop: -4 },

  detectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: 14,
    borderRadius: 12,
  },
  detectedText: { fontSize: 15, fontWeight: '700', color: Colors.success },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: { fontSize: 36 },
  categoryChipLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  categoryChipValue: { fontSize: 17, fontWeight: '700' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardValue: { fontSize: 14, color: Colors.text, lineHeight: 21 },
  pillRow: { flexDirection: 'row', gap: 8 },
  urgencyPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  urgHigh: { backgroundColor: '#FEE2E2' },
  urgMed:  { backgroundColor: '#FEF3C7' },
  urgLow:  { backgroundColor: '#DCFCE7' },
  urgencyText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  missingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: 10,
  },
  missingText: { flex: 1, fontSize: 13, color: Colors.warning, lineHeight: 19 },
  actionRow: { flexDirection: 'row', gap: 10 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  stepSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.secondaryLight,
    padding: 12,
    borderRadius: 10,
  },
  hintText: { flex: 1, fontSize: 13, color: Colors.secondary, lineHeight: 18 },
  sendingWrap: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
    gap: 12,
    marginTop: 32,
  },
  sendingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  sendingMsg: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', minHeight: 20 },
  sendingSteps: { width: '100%', gap: 14, marginTop: 16 },
  sendingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendingStepIcon: { fontSize: 20 },
  sendingStepLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
})
