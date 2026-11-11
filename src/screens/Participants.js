import React, { useRef, useState } from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import Animated, { LinearTransition, FadeOut } from 'react-native-reanimated';
import { GameScreen as Screen, Button } from '../components/UI';
import { Enter, useMotion } from '../components/Motion';
import { styles, colors } from '../theme';
import { useGame } from '../GameSession';
const PALETTE = [colors.truth, colors.dare, '#A484FF', '#65C9BD'];
function NameRow({ item, index, canRemove, onChange, onRemove }) {
 const [focused, setFocused] = useState(false);
 const reduced = useMotion();
 const accent = PALETTE[index % PALETTE.length];
 return <Animated.View layout={reduced ? undefined : LinearTransition.springify().damping(22)} exiting={reduced ? undefined : FadeOut.duration(120)}>
  <Enter><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: focused ? '#FFFFFF0C' : '#FFFFFF05', borderRadius: 22, borderWidth: 1, borderColor: focused ? accent + 'AA' : colors.border }}>
   <View style={{ width: 42, height: 42, borderRadius: 16, backgroundColor: accent + '25', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: accent, fontFamily: 'Outfit_600SemiBold', fontSize: 20 }}>{item.name.trim().slice(0, 1).toUpperCase() || String(index + 1)}</Text></View>
   <View style={{ flex: 1, minWidth: 0 }}><Text style={[styles.label, { fontSize: 9, letterSpacing: 1 }]}>PARTICIPANTE {index + 1}</Text>
    <TextInput accessibilityLabel={`Nombre del participante ${index + 1}`} placeholder="Escribe su nombre" placeholderTextColor="#A597B8" value={item.name} maxLength={40} autoCapitalize="words" autoCorrect={false} onChangeText={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ minHeight: 38, paddingVertical: 6, color: 'white', fontFamily: 'Inter_400Regular', fontSize: 16, outlineStyle: 'none' }} />
   </View>
   {canRemove && <Pressable accessibilityRole="button" accessibilityLabel={`Quitar participante ${index + 1}`} onPress={onRemove} hitSlop={6} style={{ minWidth: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.muted, fontSize: 24 }}>×</Text></Pressable>}
  </View></Enter>
 </Animated.View>;
}
export default function Participants({ navigation, route }) {
 const { category = 'todos' } = route.params || {};
 const serial = useRef(2);
 const { startSession } = useGame();
 const [names, setNames] = useState([{ id: 0, name: '' }, { id: 1, name: '' }]);
 const ready = names.length >= 2 && names.every(item => item.name.trim());
 return <Screen>
  <Enter><Text style={styles.label}>PREPAREN LA PARTIDA</Text></Enter>
  <Enter delay={60}><Text style={styles.title}>¿Quiénes juegan?</Text><Text style={[styles.muted, { marginTop: 10 }]}>Al menos dos personas. Solo sus nombres.</Text></Enter>
  <View style={{ gap: 12 }}>{names.map((item, index) => <NameRow key={item.id} item={item} index={index} canRemove={names.length > 2}
   onChange={value => setNames(current => current.map(row => row.id === item.id ? { ...row, name: value } : row))}
   onRemove={() => setNames(current => current.filter(row => row.id !== item.id))} />)}</View>
  <Button title="+ Agregar participante" secondary onPress={() => { const id = serial.current++; setNames(current => [...current, { id, name: '' }]); }} />
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={styles.muted}>{names.length} participantes</Text><Text style={[styles.muted, { fontSize: 12 }]}>{ready ? 'Todo listo para girar' : 'Completa todos los nombres'}</Text></View>
  <Button title="Ir a la ruleta" disabled={!ready} accent={colors.dare} onPress={() => { if (ready) { startSession(); navigation.navigate('Ruleta', { category, players: names.map(item => item.name.trim()), turn: 1 }); } }} />
  <Text style={[styles.muted, { fontSize: 12, textAlign: 'center' }]}>Los nombres se usan durante esta partida. Todos tienen la misma probabilidad.</Text>
 </Screen>;
}
