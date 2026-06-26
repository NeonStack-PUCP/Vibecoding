import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Report } from '@/lib/types'
import { Colors, CategoryColors } from '@/constants/colors'
import { CATEGORIES } from '@/constants/categories'
import { Badge } from '@/components/ui/Badge'

interface ReportBottomSheetProps {
  report: Report
  onClose: () => void
  onViewDetail: () => void
}

export function ReportBottomSheet({ report, onClose, onViewDetail }: ReportBottomSheetProps) {
  const insets = useSafeAreaInsets()
  const category = CATEGORIES.find((c) => c.key === report.category)
  const categoryColor = CategoryColors[report.category] ?? Colors.neutral

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Photo thumbnail */}
        <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />

        <View style={styles.info}>
          {/* Category + badge */}
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
          <Text style={styles.title} numberOfLines={2}>{report.title}</Text>

          {/* Address */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{report.address}</Text>
          </View>

          {/* Support count */}
          <View style={styles.supportRow}>
            <Ionicons name="hand-right-outline" size={14} color={Colors.secondary} />
            <Text style={styles.supportText}>
              {report.supportCount}{' '}
              {report.supportCount === 1 ? 'vecino apoya' : 'vecinos apoyan'}
            </Text>
            <View style={styles.supportBarTrack}>
              <View
                style={[
                  styles.supportBarFill,
                  {
                    width: `${Math.min((report.supportCount / 15) * 100, 100)}%`,
                    backgroundColor:
                      report.supportCount >= 15 ? Colors.success : Colors.secondary,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.viewBtn} onPress={onViewDetail} activeOpacity={0.85}>
        <Text style={styles.viewBtnText}>Ver detalle y apoyar</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.surface} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
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
    borderRadius: 8,
    gap: 4,
  },
  categoryIcon: { fontSize: 12 },
  categoryLabel: { fontSize: 11, fontWeight: '600' },
  title: { fontSize: 14, fontWeight: '700', color: Colors.text, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  supportText: { fontSize: 12, color: Colors.secondary, fontWeight: '500' },
  supportBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  supportBarFill: { height: '100%', borderRadius: 2 },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  viewBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 15 },
})
