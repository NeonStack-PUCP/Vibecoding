import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Report } from '@/lib/types'
import { Colors, CategoryColors } from '@/constants/colors'
import { CATEGORIES } from '@/constants/categories'
import { Badge } from '@/components/ui/Badge'

interface ReportCardProps {
  report: Report
  onPress: () => void
}

export function ReportCard({ report, onPress }: ReportCardProps) {
  const category = CATEGORIES.find((c) => c.key === report.category)
  const categoryColor = CategoryColors[report.category] ?? Colors.neutral

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Photo */}
      <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />

      <View style={styles.body}>
        {/* Category chip + badge */}
        <View style={styles.topRow}>
          <View style={[styles.categoryChip, { backgroundColor: categoryColor + '22' }]}>
            <Text style={styles.categoryIcon}>{category?.icon}</Text>
            <Text style={[styles.categoryLabel, { color: categoryColor }]}>
              {category?.label}
            </Text>
          </View>
          <Badge status={report.status} />
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {report.title}
        </Text>

        {/* Address */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {report.address}
          </Text>
        </View>

        {/* Support count + type */}
        <View style={styles.bottomRow}>
          <View style={styles.supportPill}>
            <Ionicons name="hand-right-outline" size={13} color={Colors.secondary} />
            <Text style={styles.supportCount}>{report.supportCount} vecinos</Text>
          </View>
          <View
            style={[
              styles.typePill,
              report.type === 'propuesta' && styles.typePillProposal,
            ]}
          >
            <Text
              style={[
                styles.typeLabel,
                report.type === 'propuesta' && styles.typeLabelProposal,
              ]}
            >
              {report.type === 'propuesta' ? '💡 Propuesta' : '⚠️ Denuncia'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photo: {
    width: 100,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  categoryIcon: { fontSize: 12 },
  categoryLabel: { fontSize: 11, fontWeight: '600' },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  supportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  supportCount: { fontSize: 12, color: Colors.secondary, fontWeight: '500' },
  typePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typePillProposal: { backgroundColor: '#EDE9FE' },
  typeLabel: { fontSize: 11, color: Colors.primary, fontWeight: '500' },
  typeLabelProposal: { color: '#7C3AED' },
})
