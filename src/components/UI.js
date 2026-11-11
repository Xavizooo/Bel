import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, Easing, cancelAnimation } from 'react-native-reanimated';
import { useMotion } from './Motion';
import { FloatingHearts } from './Atmosphere';
import { colors, styles } from '../theme';
import { CATEGORIES, LABELS } from '../domain';
export function Button({ title, onPress, accent = colors.truth, disabled, secondary, large, style, caption, icon, disabledOpacity = .4 }) {
 const reduced = useMotion();
 const scale = useSharedValue(1);
 const light = useSharedValue(0);
 const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
 const highlight = useAnimatedStyle(() => ({ opacity: light.value }));
 function press(value) { if (!reduced) scale.value = withSpring(value, { damping: 21, stiffness: 360, mass: .7 }); }
 return <Animated.View style={[{ opacity: disabled ? disabledOpacity : 1 }, style, animated]}>
  <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
   onPressIn={() => { press(.97); light.value = withTiming(.14, { duration: 100 }); }}
   onPressOut={() => { press(1); light.value = withTiming(0, { duration: 220 }); }}
   onHoverIn={() => { light.value = withTiming(.09, { duration: 160 }); }} onHoverOut={() => { light.value = withTiming(0, { duration: 200 }); }}
   onFocus={() => { light.value = withTiming(.16, { duration: 100 }); }} onBlur={() => { light.value = withTiming(0, { duration: 100 }); }}
   style={{ borderRadius: large ? 30 : 22, borderWidth: 1, borderColor: secondary ? colors.border : accent + 'AA', overflow: 'hidden' }}>
   <LinearGradient colors={secondary ? ['#FFFFFF0D', '#FFFFFF04'] : [accent + '52', accent + '18']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: large ? 126 : 56, paddingHorizontal: 20, paddingVertical: large ? 25 : 16, gap: 10, justifyContent: 'center', alignItems: 'center' }}>
    {icon && <Text style={{ fontSize: large ? 30 : 20, color: accent }}>{icon}</Text>}
    <Text style={{ fontFamily: 'Outfit_600SemiBold', color: 'white', fontSize: large ? 32 : 16, textAlign: 'center' }}>{title}</Text>
    {caption && <Text style={[styles.muted, { fontSize: 12, textAlign: 'center' }]}>{caption}</Text>}
   </LinearGradient>
   <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: 'white' }, highlight]} />
  </Pressable>
 </Animated.View>;
}
function Glow({ color, reverse = false, active }) {
 const reduced = useMotion();
 const drift = useSharedValue(0);
 useEffect(() => {
  if (active && !reduced) drift.value = withRepeat(withTiming(1, { duration: reverse ? 10000 : 8500, easing: Easing.inOut(Easing.sin) }), -1, true);
  else { cancelAnimation(drift); drift.value = 0; }
  return () => cancelAnimation(drift);
 }, [active, reduced, drift, reverse]);
 const animated = useAnimatedStyle(() => ({ transform: [{ translateX: drift.value * (reverse ? -35 : 35) }, { translateY: drift.value * (reverse ? 45 : -30) }, { scale: 1 + drift.value * .12 }] }));
 return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 420, height: 420, left: reverse ? undefined : -160, right: reverse ? -200 : undefined, top: reverse ? undefined : -140, bottom: reverse ? -130 : undefined }, animated]}>
  {[1, .78, .54].map((size, i) => <View key={size} style={{ position: 'absolute', top: (1 - size) * 210, left: (1 - size) * 210, width: 420 * size, height: 420 * size, borderRadius: 230, backgroundColor: color, opacity: .025 + i * .008 }} />)}
 </Animated.View>;
}
export function Background({ children, active = false }) {
 return <View style={{ flex: 1, backgroundColor: colors.bg, overflow: 'hidden' }}><LinearGradient colors={['#221129', '#100B1A', '#1D1529']} locations={[0, .5, 1]} style={StyleSheet.absoluteFillObject} /><Glow color={colors.truth} active={active} /><Glow color="#A484FF" reverse active={active} />{children}</View>;
}
export function Screen({ children, scroll = true, active = false, hearts = false }) {
 const body = <View style={{ width: '100%', maxWidth: 660, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32, gap: 20, flexGrow: 1, flex: scroll ? undefined : 1, minHeight: scroll ? undefined : 0 }}>{children}</View>;
 return <Background active={active}>{hearts && <FloatingHearts active={active} />}<SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>{scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>{body}</ScrollView> : body}</KeyboardAvoidingView></SafeAreaView></Background>;
}
export function GameScreen(props) {
 const focused = useIsFocused();
 return <Screen {...props} active={focused} />;
}
function CategoryChip({ category, selected, onPress, disabled }) {
 const scale = useSharedValue(1);
 const reduced = useMotion();
 const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
 return <Animated.View style={animated}><Pressable accessibilityRole="button" accessibilityState={{ selected, disabled: !!disabled }} disabled={disabled} onPress={onPress}
  onPressIn={() => { if (!reduced) scale.value = withSpring(.94); }} onPressOut={() => { scale.value = withSpring(1, { damping: 18 }); }}
  style={{ paddingHorizontal: 15, paddingVertical: 12, borderRadius: 18, borderWidth: 1, borderColor: selected ? colors.dare + 'AA' : colors.border, backgroundColor: selected ? '#FF9E0020' : '#FFFFFF05' }}><Text style={[styles.muted, { color: selected ? '#FFD8A0' : colors.muted }]}>{LABELS[category]}</Text></Pressable></Animated.View>;
}
export function CategoryPicker({ value, onChange, all = false, disabled = false }) {
 return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(all ? ['todos', ...CATEGORIES] : CATEGORIES).map(c => <CategoryChip key={c} category={c} selected={c === value} disabled={disabled} onPress={() => onChange(c)} />)}</View>;
}
export function TypePicker({ value, onChange, disabled = false }) {
 return <View style={styles.row}>{['verdad', 'reto'].map(t => <Button key={t} title={t === 'verdad' ? 'Verdad' : 'Reto'} disabled={disabled} secondary={t !== value} accent={t === 'verdad' ? colors.truth : colors.dare} onPress={() => onChange(t)} style={{ flex: 1 }} />)}</View>;
}
