import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { StoreProvider, useStore } from './src/Store';
import { Screen, Button } from './src/components/UI';
import { MotionProvider, useMotion } from './src/components/Motion';
import { GameSessionProvider } from './src/GameSession';
import { FeedbackProvider } from './src/Feedback';
import { colors, styles } from './src/theme';
import Home from './src/screens/Home';
import Choose from './src/screens/Choose';
import Card from './src/screens/Card';
import Add from './src/screens/Add';
import List from './src/screens/List';
import Participants from './src/screens/Participants';
import Roulette from './src/screens/Roulette';
import StartupIntro from './src/components/StartupIntro';
const Stack = createNativeStackNavigator();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: 'white', primary: colors.truth, border: colors.border } };
function Navigator() {
 const { loading, error, reload } = useStore();
 const reduced = useMotion();
 if (loading) return <Screen><ActivityIndicator color={colors.truth} /><Text style={styles.text}>Preparando sus tarjetas…</Text></Screen>;
 if (error) return <Screen><Text style={styles.title}>No pudimos abrir los datos</Text><Text style={styles.text}>{error}</Text><Button title="Reintentar" onPress={reload} /></Screen>;
 return <NavigationContainer theme={theme}><View style={{ flex: 1 }}><Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: 'white', headerTitleStyle: { fontFamily: 'Outfit_600SemiBold' }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.bg }, animation: reduced ? 'none' : 'slide_from_right', animationDuration: 350 }}>
  <Stack.Screen name="Inicio" component={Home} options={{ title: 'Verdad o Reto' }} />
  <Stack.Screen name="Participantes" component={Participants} options={{ title: 'Participantes' }} />
  <Stack.Screen name="Ruleta" component={Roulette} options={{ title: 'La ruleta', headerBackVisible: false, gestureEnabled: false }} />
  <Stack.Screen name="Elegir" component={Choose} options={{ title: 'Su momento', headerBackVisible: false, gestureEnabled: false }} />
  <Stack.Screen name="Tarjeta" component={Card} options={{ title: 'A jugar', animation: reduced ? 'none' : 'fade', animationDuration: 220, headerBackVisible: false, gestureEnabled: false }} />
  <Stack.Screen name="Agregar" component={Add} />
  <Stack.Screen name="Lista" component={List} />
 </Stack.Navigator><StartupIntro /></View></NavigationContainer>;
}
export default function App() {
 const [loaded, error] = useFonts({ Outfit_600SemiBold, Inter_400Regular, Inter_600SemiBold });
 return <SafeAreaProvider><StatusBar style="light" />{!loaded && !error ? <Screen><ActivityIndicator color={colors.truth} /></Screen> : error ? <Screen><Text style={{ color: 'white', fontSize: 18 }}>No se pudieron cargar las fuentes incluidas. Cierra y abre la app para reintentar.</Text></Screen> : <MotionProvider><FeedbackProvider><GameSessionProvider><StoreProvider><Navigator /></StoreProvider></GameSessionProvider></FeedbackProvider></MotionProvider>}</SafeAreaProvider>;
}
