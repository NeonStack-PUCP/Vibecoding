import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'

interface ButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: Variant
  icon?: keyof typeof Ionicons.glyphMap
  iconPosition?: 'left' | 'right'
  style?: ViewStyle
}

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  icon,
  iconPosition = 'right',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ]

  const textStyle = [
    styles.label,
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'outline' && styles.labelOutline,
    variant === 'ghost' && styles.labelGhost,
    isDisabled && styles.labelDisabled,
  ]

  const iconColor =
    variant === 'primary'
      ? Colors.surface
      : variant === 'secondary'
      ? Colors.surface
      : isDisabled
      ? Colors.textDisabled
      : Colors.primary

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.surface : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={18} color={iconColor} />
          )}
          <Text style={textStyle}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={18} color={iconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    minHeight: 52,
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
  label: { fontSize: 16, fontWeight: '600' },
  labelPrimary: { color: Colors.surface },
  labelSecondary: { color: Colors.surface },
  labelOutline: { color: Colors.primary },
  labelGhost: { color: Colors.primary },
  labelDisabled: { color: Colors.textDisabled },
})
