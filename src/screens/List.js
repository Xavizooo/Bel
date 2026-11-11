import React, { useState } from 'react';
import { Text, View, FlatList, Alert } from 'react-native';
import { GameScreen as Screen, Button, CategoryPicker } from '../components/UI';
import ItemForm from '../components/ItemForm';
import { styles, colors } from '../theme';
import { LABELS } from '../domain';
import { useStore } from '../Store';
export default function List() {
 const { items, update, remove, saving } = useStore();
 const [editing, setEditing] = useState(null);
 const [category, setCategory] = useState('todos');
 function confirmDelete(item) {
  Alert.alert('¿Borrar esta tarjeta?', item.texto, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Borrar', style: 'destructive', onPress: async () => { try { await remove(item.id); } catch { Alert.alert('No se pudo borrar', 'La tarjeta se ha conservado. Inténtalo otra vez.'); } } }]);
 }
 if (editing) return <Screen><Text style={styles.title}>Editar tarjeta</Text><ItemForm key={editing.id} initial={editing} saving={saving} onCancel={() => setEditing(null)} onSave={async item => { await update(editing.id, item); setEditing(null); }} /></Screen>;
 const filtered = items.filter(i => category === 'todos' || category === i.categoria);
 return <Screen scroll={false}><Text style={styles.title}>Sus tarjetas</Text><CategoryPicker all value={category} onChange={setCategory} /><Text style={styles.muted}>{filtered.length} tarjetas · Toca Editar para cambiar texto, tipo o categoría.</Text><FlatList style={{ flex: 1 }} data={filtered} keyExtractor={i => i.id} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} ListEmptyComponent={<Text style={styles.muted}>No hay tarjetas aquí. Puedes crear nuevas desde Agregar.</Text>} renderItem={({ item }) => <View style={styles.panel}><Text style={[styles.label, { color: item.tipo === 'verdad' ? colors.truth : colors.dare }]}>{item.tipo.toUpperCase()} · {LABELS[item.categoria]}</Text><Text style={styles.text}>{item.texto}</Text><Text style={[styles.muted, { fontSize: 12 }]}>{item.conNombres ? 'Con nombres de participantes' : 'Sin nombres'} · {item.segundos ? `${item.segundos} s` : 'Sin temporizador'}</Text><View style={styles.row}><Button title="Editar" secondary disabled={saving} style={{ flex: 1 }} onPress={() => setEditing(item)} /><Button title="Borrar" secondary disabled={saving} style={{ flex: 1 }} onPress={() => confirmDelete(item)} /></View></View>} /></Screen>;
}
