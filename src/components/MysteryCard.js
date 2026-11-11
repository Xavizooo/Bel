import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { styles } from '../theme';
import { useMotion, Shine } from './Motion';
import { Heart } from './Atmosphere';
export default function MysteryCard({ text, tipo, accent, named, remaining, revealed, busy, onRevealStart, onReveal }) {
 const reduced = useMotion();
 const flip = useSharedValue(0);
 const tiltX = useSharedValue(0), tiltY = useSharedValue(0);
 const dimensions = useRef({ width: 300, height: 320 });
 const gate = useRef(false), alive = useRef(true);
 useEffect(() => { alive.current = true; return () => { alive.current = false; cancelAnimation(flip); cancelAnimation(tiltX); cancelAnimation(tiltY); }; }, [flip, tiltX, tiltY]);
 const depth = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateX: `${tiltX.value}deg` }, { rotateY: `${tiltY.value}deg` }] }));
 const cover = useAnimatedStyle(() => ({ opacity: flip.value < 90 ? 1 : 0, transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }] }));
 const question = useAnimatedStyle(() => ({ opacity: flip.value >= 90 ? 1 : 0, transform: [{ perspective: 1200 }, { rotateY: `${flip.value - 180}deg` }] }));
 function resetTilt() { tiltX.value = withSpring(0, { damping: 22 }); tiltY.value = withSpring(0, { damping: 22 }); }
 function point(x, y, width, height) {
  if (reduced || busy || !Number.isFinite(x) || !Number.isFinite(y)) return;
  tiltX.value = withSpring(Math.max(-5, Math.min(5, (.5 - y / Math.max(1, height)) * 10)), { damping: 23, stiffness: 220 });
  tiltY.value = withSpring(Math.max(-6, Math.min(6, (x / Math.max(1, width) - .5) * 12)), { damping: 23, stiffness: 220 });
 }
 function complete() { if (alive.current) { gate.current = false; onReveal(); } }
 function reveal() {
  if (revealed || gate.current || busy) return;
  gate.current = true; resetTilt(); onRevealStart();
  if (reduced) { flip.value = 180; complete(); return; }
  flip.value = withTiming(180, { duration: 650, easing: Easing.inOut(Easing.cubic) }, done => { if (done) runOnJS(complete)(); });
 }
 const webEvents = Platform.OS === 'web' ? { onPointerMove: event => { const rect = event.currentTarget.getBoundingClientRect(); point(event.nativeEvent.clientX - rect.left, event.nativeEvent.clientY - rect.top, rect.width, rect.height); }, onPointerLeave: resetTilt } : {};
 return <Animated.View style={depth}>
  <Pressable {...webEvents} disabled={busy} accessibilityRole={revealed ? undefined : 'button'} accessibilityLabel={revealed ? undefined : `Revelar ${tipo === 'verdad' ? 'verdad' : 'reto'}`} accessibilityHint={revealed ? undefined : 'Toca para girar la tarjeta y descubrir su contenido'}
   onLayout={event => { dimensions.current = event.nativeEvent.layout; }} onPress={revealed ? undefined : reveal}
   onPressIn={event => point(event.nativeEvent.locationX, event.nativeEvent.locationY, dimensions.current.width, dimensions.current.height)} onPressOut={resetTilt} onHoverOut={resetTilt}>
   <Animated.View accessibilityElementsHidden={!revealed} importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'} pointerEvents="none" style={[styles.panel, { minHeight: 320, justifyContent: 'center', borderColor: accent + '66', paddingVertical: 40, overflow: 'hidden', backfaceVisibility: 'hidden' }, question]}>
    {revealed && <Shine />}
    <Text style={[styles.label, { color: accent, textAlign: 'center' }]}>{named ? 'ESTA TARJETA ES PARA USTEDES' : tipo === 'verdad' ? 'LA VERDAD SALE A LA LUZ' : 'EL MOMENTO ES AHORA'}</Text>
    <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 28, lineHeight: 38, color: 'white', textAlign: 'center' }}>{text}</Text>
    <Text style={[styles.muted, { textAlign: 'center', fontSize: 12 }]}>{remaining} pendientes para ti · Sin repetir para ti</Text>
   </Animated.View>
   <Animated.View pointerEvents="none" accessibilityElementsHidden={revealed} importantForAccessibility={revealed ? 'no-hide-descendants' : 'auto'} style={[StyleSheet.absoluteFillObject, { borderRadius: 28, borderWidth: 1, borderColor: accent + '99', backgroundColor: '#1C1129', overflow: 'hidden', backfaceVisibility: 'hidden' }, cover]}>
    <LinearGradient colors={[accent + '28', '#1C1129', '#28162E']} style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }]}>
     <View style={{ width: 100, height: 100, borderRadius: 36, borderWidth: 1, borderColor: accent + '55', backgroundColor: accent + '12', alignItems: 'center', justifyContent: 'center' }}>{tipo === 'verdad' ? <Heart size={52} color="#FF7AA8" outline /> : <Text style={{ color: '#FFC47D', fontSize: 65 }}>ϟ</Text>}</View>
     <Text style={[styles.label, { color: '#E3CBEA', textAlign: 'center' }]}>EL MOMENTO ES TUYO</Text><Text style={[styles.subtitle, { textAlign: 'center' }]}>Toca para descubrir</Text><Text style={[styles.muted, { textAlign: 'center' }]}>Una tarjeta. Una sorpresa.</Text>
    </LinearGradient>
   </Animated.View>
  </Pressable>
 </Animated.View>;
}
