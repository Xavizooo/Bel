import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, cancelAnimation } from 'react-native-reanimated';
import { colors } from '../theme';
const MotionContext = createContext(false);
export const useMotion = () => useContext(MotionContext);
export function MotionProvider({ children }) {
 const [reduced, setReduced] = useState(false);
 useEffect(() => {
  let alive = true;
  AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduced(value); }).catch(() => {});
  const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
  return () => { alive = false; subscription.remove(); };
 }, []);
 return <MotionContext.Provider value={reduced}>{children}</MotionContext.Provider>;
}
export function Enter({ children, delay = 0, style }) {
 const reduced = useMotion();
 return <Animated.View entering={reduced ? undefined : FadeInDown.delay(delay).springify().damping(22).stiffness(180)} style={style}>{children}</Animated.View>;
}
export function Reveal({ children }) {
 const reduced = useMotion();
 const value = useSharedValue(reduced ? 1 : 0);
 useEffect(() => { value.value = withSpring(1, { damping: 17, stiffness: 160 }); return () => cancelAnimation(value); }, [value]);
 const animated = useAnimatedStyle(() => ({ opacity: value.value, transform: [{ scale: .88 + .12 * value.value }, { translateY: 12 * (1 - value.value) }] }));
 return <Animated.View style={reduced ? undefined : animated}>{children}</Animated.View>;
}
const PALETTE = [colors.truth, colors.dare, '#BDA4FF', '#7CEAD9'];
function Piece({ index, progress }) {
 const x = ((index * 73) % 280) - 140;
 const drift = ((index * 41) % 90) - 45;
 const animated = useAnimatedStyle(() => ({ opacity: progress.value > .82 ? (1 - progress.value) / .18 : 1, transform: [{ translateX: x + drift * progress.value }, { translateY: -30 + (160 + index % 5 * 18) * progress.value }, { rotateZ: `${index * 21 + progress.value * 300}deg` }, { scale: 1 - .35 * progress.value }] }));
 return <Animated.View style={[{ position: 'absolute', top: 0, left: '50%', width: index % 2 ? 5 : 7, height: 11, borderRadius: 2, backgroundColor: PALETTE[index % PALETTE.length] }, animated]} />;
}
export function Confetti() {
 const reduced = useMotion();
 const progress = useSharedValue(0);
 useEffect(() => { progress.value = withTiming(1, { duration: 1500 }); return () => cancelAnimation(progress); }, [progress]);
 if (reduced) return null;
 return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 3, overflow: 'hidden' }}>{Array.from({ length: 24 }, (_, i) => <Piece key={i} index={i} progress={progress} />)}</View>;
}
export function Shine() {
 const reduced = useMotion();
 const progress = useSharedValue(0);
 useEffect(() => { progress.value = withDelay(250, withTiming(1, { duration: 1200 })); return () => cancelAnimation(progress); }, [progress]);
 const animated = useAnimatedStyle(() => ({ opacity: Math.sin(progress.value * Math.PI) * .12, transform: [{ translateX: -150 + 900 * progress.value }, { rotateZ: '24deg' }] }));
 if (reduced) return null;
 return <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -180, bottom: -180, left: 0, width: 90, backgroundColor: 'white' }, animated]} />;
}
