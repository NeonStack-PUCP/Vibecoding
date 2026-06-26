import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native'
import { CATEGORIES, CategoryKey } from '@/constants/categories'
import { Colors, CategoryColors } from '@/constants/colors'
import type { ReportType } from '@/lib/types'

interface CategoryGridProps {
  selected: CategoryKey | null
  type: ReportType
  onSelect: (key: CategoryKey) => void
}

export function CategoryGrid({ selected, type, onSelect }: CategoryGridProps) {
  const filtered = type === 'propuesta'
    ? CATEGORIES.filter((c) => ['parque', 'propuesta', 'pista', 'luz'].includes(c.key))
    : CATEGORIES.filter((c) => c.key !== 'propuesta')

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.key}
      numColumns={3}
      scrollEnabled={false}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => {
        const isSelected = selected === item.key
        const color = CategoryColors[item.key] ?? Colors.neutral
        return (
          <TouchableOpacity
            style={[
              styles.cell,
              isSelected && { borderColor: color, backgroundColor: color + '18' },
            ]}
            onPress={() => onSelect(item.key as CategoryKey)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text
              style={[styles.label, isSelected && { color, fontWeight: '700' }]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
            {isSelected && (
              <View style={[styles.checkDot, { backgroundColor: color }]}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  grid: { gap: 10 },
  row: { gap: 10 },
  cell: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  label: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  checkDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 10, color: Colors.surface, fontWeight: '700' },
})
