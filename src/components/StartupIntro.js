import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { FloatingHearts, Heart } from './Atmosphere';
import { useMotion } from './Motion';
import { styles } from '../theme';
export default function StartupIntro() {
 const [visible, setVisible] = useState(true);
 const reduced = useMotion();
 const { width } = useWindowDimensions();
 const progress = useSharedValue(0);
 const fade = useSharedValue(1);
 const alive = useRef(true);
 const dismissing = useRef(false);
 function finish() { if (alive.current) setVisible(false); }
 useEffect(() => {
  alive.current = true;
  if (reduced) { setVisible(false); return () => { alive.current = false; }; }
  progress.value = withTiming(1, { duration: 3000, easing: Easing.linear }, done => { if (done) runOnJS(finish)(); });
  return () => { alive.current = false; cancelAnimation(progress); cancelAnimation(fade); };
 }, [reduced, progress, fade]);
 const shell = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, .86, 1], [1, 1, 0], Extrapolation.CLAMP) * fade.value }));
 const heart = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, .14], [0, 1], Extrapolation.CLAMP), transform: [{ scale: interpolate(progress.value, [0, .16, .24, .34, .7, 1], [.15, 1.18, .96, 1, 1.05, 1.16], Extrapolation.CLAMP) }, { rotateZ: `${interpolate(progress.value, [0, .25, 1], [-20, 0, 8], Extrapolation.CLAMP)}deg` }] }));
 const title = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.1, .3], [0, 1], Extrapolation.CLAMP), transform: [{ translateY: interpolate(progress.value, [.1, .35], [34, 0], Extrapolation.CLAMP) }, { scale: interpolate(progress.value, [.1, .35], [.92, 1], Extrapolation.CLAMP) }] }));
 const aura = useAnimatedStyle(() => ({ opacity: Math.sin(Math.min(1, progress.value * 1.5) * Math.PI) * .35, transform: [{ scale: .2 + progress.value * 2.6 }] }));
 function dismiss() { if (dismissing.current) return; dismissing.current = true; cancelAnimation(progress); fade.value = withTiming(0, { duration: 180 }, done => { if (done) runOnJS(finish)(); }); }
 if (!visible || reduced) return null;
 return <Animated.View accessibilityViewIsModal style={[StyleSheet.absoluteFillObject, { zIndex: 1000, backgroundColor: '#110A1C', alignItems: 'center', justifyContent: 'center', padding: 28 }, shell]}>
  <LinearGradient colors={['#2C102B', '#110A1C', '#231437']} style={StyleSheet.absoluteFillObject} />
  <FloatingHearts vivid />
  <View pointerEvents="none" style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF3366', opacity: .055 }} />
  <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: '#FFA9C5' }, aura]} />
  <Animated.View style={[{ marginBottom: 22 }, heart]}><Heart size={96} color="#FF5D93" /></Animated.View>
  <Animated.View style={[{ alignItems: 'center', gap: 18 }, title]}>
   <Text style={[styles.label, { color: '#E5C5E7', letterSpacing: 4 }]}>NEON SUNSET</Text>
   <Text style={[styles.title, { fontSize: Math.min(66, width * .15), lineHeight: Math.min(74, width * .17), textAlign: 'center', letterSpacing: -2 }]}>Verdad <Text style={{ color: '#FF6898' }}>o</Text>{'\n'}<Text style={{ color: '#FFBD71' }}>Reto.</Text></Text>
   <Text style={[styles.muted, { textAlign: 'center', color: '#D6BFD8' }]}>Una noche. Mil posibilidades.</Text>
  </Animated.View>
  <Pressable accessibilityRole="button" accessibilityLabel="Omitir animación de inicio" onPress={dismiss} style={{ position: 'absolute', bottom: 50, paddingVertical: 15, paddingHorizontal: 26, borderRadius: 30, borderWidth: 1, borderColor: '#FFFFFF30', backgroundColor: '#FFFFFF08' }}><Text style={[styles.text, { fontSize: 14 }]}>Entrar  →</Text></Pressable>
 </Animated.View>;
}
