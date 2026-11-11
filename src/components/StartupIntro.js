import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { Heart } from './Atmosphere';
import { useMotion } from './Motion';
import { styles } from '../theme';
const CLAMP = Extrapolation.CLAMP;
const COLORS = ['#FF689E', '#FFC283', '#BEA1FF'];

function PortalRing({ index, size, progress }) {
 const animated = useAnimatedStyle(() => ({
  opacity: interpolate(progress.value, [0, .09 + index * .025, .43, .69], [0, .72, .95, 0], CLAMP),
  transform: [{ perspective: 850 }, { rotateX: `${48 + index * 17}deg` }, { rotateY: `${index === 1 ? -27 : 17}deg` }, { rotateZ: `${index * 65 + progress.value * (index % 2 ? -600 : 540)}deg` }, { scale: interpolate(progress.value, [0, .18, .43, .62], [.2, 1, 1.06, 1.45], CLAMP) }],
 }));
 const diameter = size * (1 + index * .13);
 return <Animated.View style={[{ position: 'absolute', width: diameter, height: diameter, borderRadius: diameter / 2, borderWidth: index === 1 ? 3 : 2, borderColor: '#FFFFFF0D', borderTopColor: COLORS[index], borderBottomColor: COLORS[(index + 1) % 3] }, animated]} />;
}
function OrbitHeart({ index, radius, progress }) {
 const size = 15 + index % 4 * 6;
 const animated = useAnimatedStyle(() => {
  const angle = index * Math.PI * 2 / 12 + progress.value * 10;
  const collapse = interpolate(progress.value, [.37, .535], [0, 1], CLAMP);
  const distance = radius * (.8 + index % 3 * .12) * (1 - collapse);
  const depth = (Math.sin(angle) + 1) / 2;
  return {
   opacity: interpolate(progress.value, [0, .1, .48, .555], [0, 1, 1, 0], CLAMP) * (.35 + .65 * depth),
   transform: [{ translateX: Math.cos(angle) * distance }, { translateY: Math.sin(angle) * distance * .6 }, { scale: (.65 + depth * .55) * (1 - collapse * .55) }, { rotateZ: `${Math.sin(angle) * 24}deg` }],
  };
 });
 return <Animated.View style={[{ position: 'absolute', width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, top: '50%', left: '50%' }, animated]}><Heart size={size} color={COLORS[index % 3]} outline={index % 4 === 0} /></Animated.View>;
}
function BurstParticle({ index, radius, progress }) {
 const isHeart = index % 5 === 0;
 const size = isHeart ? 17 : 3;
 const angle = index * Math.PI * 2 / 24;
 const animated = useAnimatedStyle(() => {
  const travel = interpolate(progress.value, [.49, .81], [0, 1], CLAMP);
  const distance = radius * (.15 + travel * (1.65 + index % 3 * .25));
  return {
   opacity: interpolate(progress.value, [.485, .53, .68, .84], [0, .9, .6, 0], CLAMP),
   transform: [{ translateX: Math.cos(angle) * distance }, { translateY: Math.sin(angle) * distance * .9 }, { rotateZ: `${index * 15 - 90 + travel * (isHeart ? 55 : 0)}deg` }, { scale: 1 - travel * .6 }],
  };
 });
 return <Animated.View style={[{ position: 'absolute', top: '50%', left: '50%', width: size, height: isHeart ? size : 12 + index % 4 * 4, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: 3, backgroundColor: isHeart ? 'transparent' : COLORS[index % 3] }, animated]}>{isHeart && <Heart size={size} color={COLORS[index % 3]} />}</Animated.View>;
}
function Shockwave({ index, size, progress }) {
 const animated = useAnimatedStyle(() => ({
  opacity: interpolate(progress.value, [.48 + index * .035, .54 + index * .035, .79 + index * .035], [0, .45, 0], CLAMP),
  transform: [{ scale: interpolate(progress.value, [.48 + index * .035, .81 + index * .035], [.15, 2.4], CLAMP) }],
 }));
 return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: index ? 1 : 2, borderColor: COLORS[index] }, animated]} />;
}
function Star({ index, progress, width, height }) {
 const animated = useAnimatedStyle(() => ({
  opacity: interpolate(progress.value, [0, .14, .6, .94], [0, .3 + index % 3 * .15, .2, 0], CLAMP),
  transform: [{ translateY: -progress.value * (12 + index % 3 * 8) }, { scale: .7 + Math.sin(progress.value * Math.PI) * .5 }],
 }));
 return <Animated.View style={[{ position: 'absolute', top: height * (.08 + ((index * 17) % 80) / 100), left: width * (.05 + ((index * 31) % 90) / 100), width: index % 3 ? 2 : 4, height: index % 3 ? 2 : 4, borderRadius: 3, backgroundColor: COLORS[index % 3] }, animated]} />;
}
export default function StartupIntro() {
 const [visible, setVisible] = useState(true);
 const reduced = useMotion();
 const { width, height } = useWindowDimensions();
 const portalSize = Math.max(150, Math.min(width * .76, height * .43, 330));
 const progress = useSharedValue(0), fade = useSharedValue(1);
 const alive = useRef(true), dismissing = useRef(false);
 function finish() { if (alive.current) setVisible(false); }
 useEffect(() => {
  alive.current = true;
  if (reduced) { setVisible(false); return () => { alive.current = false; }; }
  progress.value = withTiming(1, { duration: 4300, easing: Easing.linear }, done => { if (done) runOnJS(finish)(); });
  return () => { alive.current = false; cancelAnimation(progress); cancelAnimation(fade); };
 }, [reduced, progress, fade]);
 const shell = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, .91, 1], [1, 1, 0], CLAMP) * fade.value }));
 const glow = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, .25, .5, .61, .9], [0, .1, .3, .12, .04], CLAMP), transform: [{ scale: interpolate(progress.value, [0, .5, .72], [.4, 1.1, 1.8], CLAMP) }] }));
 const heart = useAnimatedStyle(() => ({
  opacity: interpolate(progress.value, [0, .17, .66, .83], [0, 1, 1, 0], CLAMP),
  transform: [{ translateY: interpolate(progress.value, [.52, .75], [0, -portalSize * .57], CLAMP) }, { scale: interpolate(progress.value, [0, .18, .37, .49, .54, .65, .82], [.12, .85, .95, 1.2, .88, .65, .48], CLAMP) }, { rotateZ: `${interpolate(progress.value, [0, .2, .48, .75], [-24, 0, 10, 0], CLAMP)}deg` }],
 }));
 const kicker = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.13, .24, .4, .49], [0, 1, 1, 0], CLAMP), transform: [{ translateY: interpolate(progress.value, [.13, .24], [12, 0], CLAMP) }] }));
 const brand = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.56, .7], [0, 1], CLAMP), transform: [{ translateY: interpolate(progress.value, [.56, .7], [12, 0], CLAMP) }] }));
 const truth = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.54, .68], [0, 1], CLAMP), transform: [{ perspective: 900 }, { translateX: interpolate(progress.value, [.54, .69], [-width * .26, 0], CLAMP) }, { rotateY: `${interpolate(progress.value, [.54, .69], [-26, 0], CLAMP)}deg` }] }));
 const dare = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.58, .72], [0, 1], CLAMP), transform: [{ perspective: 900 }, { translateX: interpolate(progress.value, [.58, .73], [width * .26, 0], CLAMP) }, { rotateY: `${interpolate(progress.value, [.58, .73], [26, 0], CLAMP)}deg` }] }));
 const caption = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.7, .8], [0, 1], CLAMP), transform: [{ translateY: interpolate(progress.value, [.7, .8], [10, 0], CLAMP) }] }));
 const sweep = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [.66, .7, .82, .87], [0, .8, .8, 0], CLAMP), transform: [{ translateX: interpolate(progress.value, [.66, .87], [-width, width], CLAMP) }, { rotateZ: '20deg' }] }));
 const meter = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
 function dismiss() { if (dismissing.current) return; dismissing.current = true; cancelAnimation(progress); fade.value = withTiming(0, { duration: 180 }, done => { if (done) runOnJS(finish)(); }); }
 if (!visible || reduced) return null;
 const compact = height < 560;
 const titleSize = Math.min(76, width * .17, height * (compact ? .09 : .105));
 return <Animated.View accessibilityViewIsModal style={[StyleSheet.absoluteFillObject, { zIndex: 1000, backgroundColor: '#100A19', overflow: 'hidden' }, shell]}>
  <LinearGradient colors={['#201027', '#100A19', '#24122C']} style={StyleSheet.absoluteFillObject} />
  {Array.from({ length: 14 }, (_, i) => <Star key={i} index={i} progress={progress} width={width} height={height} />)}
  <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: '42%', left: '50%', width: portalSize, height: portalSize, marginTop: -portalSize / 2, marginLeft: -portalSize / 2, alignItems: 'center', justifyContent: 'center' }}>
   <Animated.View style={[{ position: 'absolute', width: portalSize * 1.25, height: portalSize * 1.25, borderRadius: portalSize, backgroundColor: '#FF4388' }, glow]} />
   {[0, 1, 2].map(i => <PortalRing key={i} index={i} size={portalSize} progress={progress} />)}
   {Array.from({ length: 12 }, (_, i) => <OrbitHeart key={i} index={i} radius={portalSize * .46} progress={progress} />)}
   {[0, 1].map(i => <Shockwave key={i} index={i} size={portalSize} progress={progress} />)}
   {Array.from({ length: 24 }, (_, i) => <BurstParticle key={i} index={i} radius={portalSize * .46} progress={progress} />)}
   <Animated.View style={heart}><Heart size={88} color="#FF6B9F" /></Animated.View>
   <Animated.View style={[{ position: 'absolute', bottom: 0, width: width - 40, alignItems: 'center' }, kicker]}><Text style={[styles.label, { fontSize: 10, letterSpacing: 3, color: '#E7C9DD', textAlign: 'center' }]}>LA SUERTE ESTÁ POR GIRAR</Text></Animated.View>
  </View>
  <View pointerEvents="none" style={{ position: 'absolute', top: compact ? '27%' : '40%', left: 24, right: 24, alignItems: 'center', overflow: 'hidden', paddingVertical: compact ? 8 : 12 }}>
   <Animated.Text style={[styles.label, { color: '#D6B5E1', letterSpacing: 4, marginBottom: compact ? 8 : 12 }, brand]}>NEON SUNSET</Animated.Text>
   <Animated.Text style={[styles.title, { color: '#FF83B0', fontSize: titleSize, lineHeight: titleSize * 1.12, letterSpacing: -2, textAlign: 'center' }, truth]}>Verdad</Animated.Text>
   <Animated.Text style={[styles.title, { color: '#FFC88D', fontSize: titleSize, lineHeight: titleSize * 1.12, letterSpacing: -2, textAlign: 'center' }, dare]}>o Reto.</Animated.Text>
   <Animated.View style={[{ position: 'absolute', top: 22, bottom: 30, width: 70 }, sweep]}><LinearGradient colors={['#FFFFFF00', '#FFFFFF20', '#FFFFFF00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} /></Animated.View>
   <Animated.Text style={[styles.muted, { color: '#DDC9E2', textAlign: 'center', marginTop: compact ? 10 : 18, fontSize: 14 }, caption]}>Atrévete a descubrir.</Animated.Text>
  </View>
  <View style={{ position: 'absolute', bottom: Math.max(24, height * .045), left: 24, right: 24, alignItems: 'center', gap: 16 }}>
   <View pointerEvents="none" style={{ width: 92, height: 2, backgroundColor: '#FFFFFF12', overflow: 'hidden', borderRadius: 2 }}><Animated.View style={[{ width: 92, height: 2, backgroundColor: '#FFB5D0' }, meter]} /></View>
   <Pressable accessibilityRole="button" accessibilityLabel="Omitir animación de inicio" onPress={dismiss} style={{ paddingVertical: 14, paddingHorizontal: 27, borderRadius: 28, borderWidth: 1, borderColor: '#FFFFFF30', backgroundColor: '#FFFFFF08' }}><Text style={[styles.text, { fontSize: 14 }]}>Entrar  →</Text></Pressable>
  </View>
 </Animated.View>;
}
