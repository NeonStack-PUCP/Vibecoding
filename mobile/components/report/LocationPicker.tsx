import { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  address: string
  onLocationChange: (lat: number, lng: number, address: string) => void
}

export function LocationPicker({ latitude, longitude, address, onLocationChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false)

  const getLocation = async () => {
    setLoading(true)
    try {
      const perm = await Location.requestForegroundPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const { latitude: lat, longitude: lng } = loc.coords

      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
      const addr = [geo?.street, geo?.district ?? geo?.city, geo?.region]
        .filter(Boolean)
        .join(', ')

      onLocationChange(lat, lng, addr)
    } catch {
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!latitude) getLocation()
  }, [])

  const handleMapPress = async (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate
    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
      const addr = [geo?.street, geo?.district ?? geo?.city].filter(Boolean).join(', ')
      onLocationChange(lat, lng, addr)
    } catch {
      onLocationChange(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    }
  }

  const initialRegion: Region = {
    latitude: latitude ?? -12.0464,
    longitude: longitude ?? -77.0428,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={initialRegion}
          onPress={handleMapPress}
          showsUserLocation
        >
          {latitude && longitude && (
            <Marker coordinate={{ latitude, longitude }}>
              <View style={styles.pin}>
                <Ionicons name="location" size={28} color={Colors.primary} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Re-center button */}
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={getLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.secondary} size="small" />
          ) : (
            <Ionicons name="locate" size={20} color={Colors.secondary} />
          )}
        </TouchableOpacity>

        {/* Instruction overlay */}
        {!latitude && !loading && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Obteniendo tu ubicación...</Text>
          </View>
        )}
      </View>

      {/* Address display */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={16} color={Colors.primary} />
        <Text style={styles.addressText} numberOfLines={2}>
          {address || 'Toca el mapa para ajustar la ubicación'}
        </Text>
      </View>

      <Text style={styles.hint}>
        Toca el mapa para ajustar el pin exactamente donde está el problema.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  mapWrapper: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.neutralLight,
  },
  pin: { alignItems: 'center' },
  locateBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: { fontSize: 14, color: Colors.textSecondary },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  hint: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
})
