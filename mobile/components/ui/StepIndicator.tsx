import { StyleSheet, View, Text } from 'react-native'
import { Colors } from '@/constants/colors'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          return (
            <View key={label} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isActive && styles.dotActive,
                ]}
              >
                {isDone ? (
                  <Text style={styles.dotCheck}>✓</Text>
                ) : (
                  <Text style={[styles.dotNumber, isActive && styles.dotNumberActive]}>
                    {stepNumber}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isDone && styles.labelDone,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {index < steps.length - 1 && (
                <View
                  style={[styles.connector, isDone && styles.connectorDone]}
                />
              )}
            </View>
          )
        })}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.neutralLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dotNumberActive: { color: Colors.surface },
  dotCheck: { fontSize: 12, color: Colors.surface, fontWeight: '700' },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 60,
  },
  labelActive: { color: Colors.primary, fontWeight: '600' },
  labelDone: { color: Colors.success },
  connector: {
    position: 'absolute',
    top: 13,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.border,
    zIndex: -1,
  },
  connectorDone: { backgroundColor: Colors.success },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
})
