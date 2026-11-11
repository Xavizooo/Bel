import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { GameScreen as Screen, Button, CategoryPicker } from '../components/UI';
import { colors, styles } from '../theme';
import { useStore } from '../Store';
import { Enter } from '../components/Motion';
import { FeedbackControls } from '../Feedback';
import { Heart } from '../components/Atmosphere';
import { Shine } from '../components/Motion';
export default function Home({ navigation }) {
 const [category, setCategory] = useState('todos');
 const { items } = useStore();
 const count = items.filter(i => category === 'todos' || i.categoria === category).length;
 return <Screen hearts>
  <Enter><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.truth }} /><Text style={styles.label}>NEON SUNSET</Text></View></Enter>
  <Enter delay={60}><View style={{ paddingVertical: 24, gap: 14, position: 'relative', overflow: 'hidden' }}><View pointerEvents="none" style={{ position: 'absolute', right: 10, top: 28, opacity: .7, transform: [{ rotateZ: '14deg' }] }}><Heart size={64} color="#FF79A5" outline /></View><Text style={[styles.title, { fontSize: 68, lineHeight: 72, letterSpacing: -2 }]}>Verdad{ '\n' }<Text style={{ color: colors.truth }}>o </Text><Text style={{ color: colors.dare }}>Reto.</Text></Text><Text style={styles.muted}>Sus nombres. Un giro. Algo por descubrir.</Text><Shine /></View></Enter>
  <Enter delay={130}><View style={styles.panel}><Text style={styles.subtitle}>Elijan el ambiente</Text><CategoryPicker all value={category} onChange={setCategory} /><Text style={[styles.muted, { fontSize: 12 }]}>{count} tarjetas · A su ritmo</Text></View></Enter>
  <Enter delay={200}><Button title="Comenzar" caption="Que decida la suerte" large disabled={!count} onPress={() => navigation.navigate('Participantes', { category })} /></Enter>
  {!count && <Text style={styles.muted}>No hay tarjetas en esta categoría. Añade alguna o elige otra.</Text>}
  <View style={styles.row}><Button title="Agregar" secondary style={{ flex: 1 }} onPress={() => navigation.navigate('Agregar')} /><Button title="Lista" secondary style={{ flex: 1 }} onPress={() => navigation.navigate('Lista')} /></View>
  <FeedbackControls />
  <Text style={styles.muted}>Para personas adultas. Todo es opcional: pueden cambiar la tarjeta o pasar turno sin explicar por qué.</Text>
 </Screen>;
}
