import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

interface PhotoCaptureProps {
  uri: string | null
  onCapture: (uri: string) => void
  onRemove: () => void
  isUploading?: boolean
}

export function PhotoCapture({ uri, onCapture, onRemove, isUploading }: PhotoCaptureProps) {
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar la foto.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.75,
      allowsEditing: true,
      aspect: [4, 3],
    })
    if (!result.canceled && result.assets[0]) {
      onCapture(result.assets[0].uri)
    }
  }

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.75,
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    })
    if (!result.canceled && result.assets[0]) {
      onCapture(result.assets[0].uri)
    }
  }

  if (uri) {
    return (
      <View style={styles.preview}>
        <Image source={{ uri }} style={styles.previewImage} resizeMode="cover" />
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color={Colors.surface} size="large" />
            <Text style={styles.uploadText}>Subiendo foto...</Text>
          </View>
        )}
        {!isUploading && (
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Ionicons name="close-circle" size={28} color={Colors.surface} />
          </TouchableOpacity>
        )}
        {!isUploading && (
          <View style={styles.previewBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.previewBadgeText}>Foto lista</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.optionBtn} onPress={takePhoto} activeOpacity={0.8}>
        <View style={styles.optionIcon}>
          <Ionicons name="camera" size={30} color={Colors.primary} />
        </View>
        <Text style={styles.optionTitle}>Tomar foto</Text>
        <Text style={styles.optionDesc}>Recomendado — incluye metadatos GPS</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.optionBtnSecondary} onPress={pickFromLibrary} activeOpacity={0.8}>
        <Ionicons name="images-outline" size={20} color={Colors.secondary} />
        <Text style={styles.optionBtnSecondaryText}>Elegir de galería</Text>
      </TouchableOpacity>

      <Text style={styles.tip}>
        Asegúrate que el problema sea claramente visible en la foto.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  optionBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  optionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  optionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  optionBtnSecondaryText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  tip: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  preview: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  previewBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  previewBadgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
})
