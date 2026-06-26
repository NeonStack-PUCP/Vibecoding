import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

interface SupportButtonProps {
  supported: boolean
  count: number
  onPress: () => void
  disabled?: boolean
}

export function SupportButton({ supported, count, onPress, disabled }: SupportButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        supported && styles.btnSupported,
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons
        name={supported ? 'hand-right' : 'hand-right-outline'}
        size={20}
        color={supported ? Colors.surface : Colors.primary}
      />
      <Text style={[styles.label, supported && styles.labelSupported]}>
        {disabled ? 'Solicitud enviada' : supported ? 'Apoyando' : 'Apoyar'}
      </Text>
      {!disabled && (
        <View style={[styles.countBadge, supported && styles.countBadgeSupported]}>
          <Text style={[styles.countText, supported && styles.countTextSupported]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnSupported: {
    backgroundColor: Colors.primary,
  },
  btnDisabled: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
    opacity: 0.9,
  },
  label: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  labelSupported: { color: Colors.surface },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countBadgeSupported: { backgroundColor: 'rgba(255,255,255,0.3)' },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.surface },
  countTextSupported: { color: Colors.surface },
})
