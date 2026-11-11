import React, { useEffect, useState } from 'react';
import { AppState, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, cancelAnimation } from 'react-native-reanimated';
import { useMotion } from './Motion';
export function Heart({ size = 40, color = '#FF6B99', outline = false }) {
 return <Svg width={size} height={size} viewBox="0 0 64 64"><Path d="M32 55C27 50 7 37 7 22C7 8 25 4 32 17C39 4 57 8 57 22C57 37 37 50 32 55Z" fill={outline ? 'none' : color} stroke={color} strokeWidth={outline ? 1.5 : 0} /><Path d="M15 23C15 17 20 13 25 16" fill="none" stroke="white" strokeOpacity={outline ? 0 : .45} strokeWidth="2.5" strokeLinecap="round" /></Svg>;
}
function FloatingHeart({ index, phase, height, vivid }) {
 const size = 15 + index % 4 * 9;
 const animated = useAnimatedStyle(() => {
  const t = (phase.value + index * .137) % 1;
  return { opacity: Math.sin(t * Math.PI) * (vivid ? .66 : .25), transform: [{ translateY: (1 - t) * (height + 120) - 60 }, { translateX: Math.sin(t * Math.PI * 2 + index) * 25 }, { rotateZ: `${Math.sin(t * 6 + index) * 22}deg` }, { scale: .75 + Math.sin(t * Math.PI) * .3 }] };
 });
 return <Animated.View style={[{ position: 'absolute', top: 0, left: `${(index * 31 + 7) % 94}%`, width: size, height: size }, animated]}><Heart size={size} color={['#FF5A8D', '#FFB46B', '#C09FFF'][index % 3]} outline={index % 3 === 0} /></Animated.View>;
}
export function FloatingHearts({ active = true, vivid = false }) {
 const reduced = useMotion();
 const { height } = useWindowDimensions();
 const phase = useSharedValue(0);
 const [foreground, setForeground] = useState(AppState.currentState !== 'background');
 useEffect(() => { const subscription = AppState.addEventListener('change', state => setForeground(state === 'active')); return () => subscription.remove(); }, []);
 useEffect(() => {
  if (active && foreground && !reduced) { phase.value = 0; phase.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false); }
  else cancelAnimation(phase);
  return () => cancelAnimation(phase);
 }, [active, foreground, reduced, phase]);
 if (reduced) return null;
 return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>{Array.from({ length: vivid ? 16 : 12 }, (_, i) => <FloatingHeart key={i} index={i} phase={phase} height={height} vivid={vivid} />)}</View>;
}
export function LightWave({ color = '#FFD39A', size = 180 }) {
 const reduced = useMotion();
 const progress = useSharedValue(0);
 useEffect(() => { progress.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }); return () => cancelAnimation(progress); }, [progress]);
 const first = useAnimatedStyle(() => ({ opacity: (1 - progress.value) * .65, transform: [{ scale: .35 + progress.value * 1.7 }] }));
 const second = useAnimatedStyle(() => ({ opacity: Math.sin(progress.value * Math.PI) * .32, transform: [{ scale: .15 + progress.value * 1.4 }] }));
 if (reduced) return null;
 const ring = { position: 'absolute', top: '50%', left: '50%', width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: size / 2, borderColor: color, borderWidth: 2 };
 return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}><Animated.View style={[ring, first]} /><Animated.View style={[ring, { borderWidth: 1 }, second]} /></View>;
}
