import React from 'react';
import { Text } from 'react-native';
import { GameScreen as Screen } from '../components/UI';
import ItemForm from '../components/ItemForm';
import { styles } from '../theme';
import { useStore } from '../Store';
export default function Add() {
 const { add, saving } = useStore();
 return <Screen><Text style={styles.title}>Una idea tuya</Text><Text style={styles.muted}>Se guarda solo en este teléfono.</Text><ItemForm saving={saving} onSave={async item => { await add(item); }} /></Screen>;
}
