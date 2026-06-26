export const Colors = {
  primary: '#DC2626',
  primaryLight: '#FEE2E2',
  primaryDark: '#B91C1C',

  secondary: '#1E40AF',
  secondaryLight: '#DBEAFE',

  success: '#16A34A',
  successLight: '#DCFCE7',

  warning: '#D97706',
  warningLight: '#FEF3C7',

  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  neutral: '#64748B',
  neutralLight: '#F1F5F9',

  background: '#F8FAFC',
  surface: '#FFFFFF',

  text: '#1E293B',
  textSecondary: '#64748B',
  textDisabled: '#CBD5E1',

  border: '#E2E8F0',
  borderFocus: '#1E40AF',

  overlay: 'rgba(0,0,0,0.5)',
} as const

export const CategoryColors: Record<string, string> = {
  obra: '#F59E0B',
  basura: '#84CC16',
  agua: '#06B6D4',
  luz: '#F59E0B',
  ambiente: '#10B981',
  pista: '#6366F1',
  parque: '#22C55E',
  seguridad: '#EF4444',
  propuesta: '#8B5CF6',
  otro: '#64748B',
}
