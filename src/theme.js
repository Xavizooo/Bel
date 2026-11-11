import { StyleSheet } from 'react-native';
export const colors = { bg: '#100B1A', truth: '#FF3366', dare: '#FF9E00', text: '#FFFFFF', muted: '#D1C4E9', glass: 'rgba(255,255,255,0.045)', border: 'rgba(255,255,255,0.12)' };
export const styles = StyleSheet.create({
 title: { fontFamily: 'Outfit_600SemiBold', color: colors.text, fontSize: 36, lineHeight: 42 },
 subtitle: { fontFamily: 'Outfit_600SemiBold', color: colors.text, fontSize: 24 },
 text: { fontFamily: 'Inter_400Regular', color: colors.text, fontSize: 16, lineHeight: 25 },
 muted: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 14, lineHeight: 22 },
 label: { fontFamily: 'Inter_600SemiBold', color: colors.muted, fontSize: 12, letterSpacing: 2 },
 panel: { backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1, borderRadius: 28, padding: 22, gap: 16 },
 row: { flexDirection: 'row', gap: 12 },
 input: { minHeight: 140, textAlignVertical: 'top', borderColor: colors.border, borderWidth: 1, borderRadius: 22, padding: 18, color: 'white', fontFamily: 'Inter_400Regular', fontSize: 17, backgroundColor: 'rgba(255,255,255,0.04)' }
});
