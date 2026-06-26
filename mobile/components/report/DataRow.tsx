import { StyleSheet, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

interface DataRowProps {
  found: boolean
  label: string
  value?: string
  isNeutral?: boolean
}

export function DataRow({ found, label, value, isNeutral }: DataRowProps) {
  const color = isNeutral ? Colors.secondary : found ? Colors.success : Colors.neutral
  const iconName = isNeutral
    ? 'information-circle-outline'
    : found
    ? 'checkmark-circle'
    : 'ellipse-outline'

  return (
    <View style={styles.row}>
      <Ionicons name={iconName} size={18} color={color} />
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        {value && <Text style={[styles.value, { color }]}>{value}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: { flex: 1, gap: 2 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text },
  value: { fontSize: 12, lineHeight: 17 },
})
