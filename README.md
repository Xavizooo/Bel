# Verdad o Reto — Neon Sunset

**Actualización Neon Motion, participantes y ruleta:** consulta `REEMPLAZAR.md` para copiar sobre tu proyecto.

App para dos o más participantes en JavaScript, Expo SDK 57 y React Navigation 7. Sin backend, cuentas, telemetría ni llamadas a APIs. 40 tarjetas locales: 20 verdades y 20 retos repartidos en divertidos, románticos y picantes. Las propuestas picantes son suaves y opcionales.

## Abrir en Android

Requisitos: Node.js LTS compatible con Expo (recomendado Node 22.13 o superior), Expo Go para Android compatible con SDK 57, teléfono y computador en la misma red Wi-Fi.

Descomprime el ZIP, abre la carpeta `verdad-o-reto` en VS Code y abre una terminal dentro de ella:

```sh
npm ci
npx expo start
```

Abre Expo Go en Android y escanea el QR. La primera carga compila el proyecto. Debe aparecer «Verdad o Reto», con Jugar, Agregar y Lista. Pulsa Jugar, registra los nombres y gira la ruleta.

Si Expo Go indica versión incompatible, instala la versión Android para SDK 57 desde https://expo.dev/go (fuente oficial). No cambies versiones individuales de React Native o Reanimated para intentar corregirlo.

Si Metro muestra caché vieja: `npx expo start --clear`. Si no conecta, verifica misma Wi-Fi y permite Node.js en el firewall de Windows. No hace falta Django ni servidor de aplicación.

## Qué está incluido

- Inicio: categorías antes de jugar, Jugar, Agregar y Lista.
- Participantes: mínimo dos nombres, con opción de añadir o quitar personas.
- Ruleta: sorteo animado con la misma probabilidad para cada participante.
- Elegir: nombre del participante y dos botones grandes.
- Tarjeta: selección aleatoria, pasar turno, cambiar sin repetir la tarjeta actual.
- Agregar: tipo mediante dos botones, categoría y validación de texto.
- Lista: listado virtualizado, filtros por categoría, edición inline y borrado con confirmación.
- Persistencia local: primer arranque copia JSON; después se lee AsyncStorage. Borrar todas deja una lista vacía, no restaura automáticamente las predeterminadas.
- Si guardar falla, conserva el estado anterior. Si los datos almacenados no se pueden leer, muestra error y reintento sin sobrescribirlos.
- Glass con paneles semitransparentes, borde y LinearGradient, sin Blur ni shadowColor.
- Fuentes Outfit e Inter incluidas como recursos locales del paquete.
- Animaciones Reanimated: botón 1.05 al presionar, giro Y en dos mitades y cambio de texto en el centro; entrada fade/desplazamiento. Fondo estático para priorizar fluidez.

## Modelo de datos

```json
{"id":"default-001","tipo":"verdad","texto":"¿Cuál ha sido tu cita más incómoda?","categoria":"divertido"}
```

Se añade `categoria` a los tres campos pedidos para permitir la selección del ambiente. Valores: `divertido`, `romantico`, `picante`. La opción «Todos» es un filtro y no se guarda en los items.

Clave AsyncStorage: `@neon-sunset/questions/v1`. Los datos pertenecen a esta instalación: borrar datos/desinstalar puede eliminarlos. No hay sincronización ni copia en la nube.

## Orden de revisión acompañado

El código final ya está completo; revisaremos una etapa por vez:

1. Base abriendo en Expo Go.
2. Navegación entre las siete pantallas.
3. Elegir y Tarjeta, filtros y selección aleatoria.
4. Agregar, editar, borrar y verificar persistencia al cerrar/abrir.
5. Colores, glass, tipografías y tamaños en tu Android.
6. Animaciones y rendimiento.

## Comandos usados para las librerías

No necesitas repetirlos si `npm ci` terminó correctamente. Para reconstruir las dependencias sobre una base de Expo SDK 57:

```sh
npx expo install @react-navigation/native@^7 @react-navigation/native-stack@^7 react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage expo-linear-gradient expo-font @expo-google-fonts/outfit @expo-google-fonts/inter
npx expo install react-native-reanimated react-native-worklets
```

Se mantiene la configuración Babel por defecto de Expo; no se añade manualmente un plugin de Reanimated. No hay TypeScript.

## Offline: juego y entorno de desarrollo

Las preguntas, fuentes y operaciones de la app son locales. La sesión de desarrollo de Expo Go carga JavaScript y assets desde Metro en tu computador; el QR no genera una aplicación instalada independiente. Para un arranque garantizado sin computador ni conexión, hay que generar e instalar una APK con el bundle y recursos incluidos. Eso no exige backend; lo abordamos después de probar la app.

## Verificación

```sh
npm test
npx expo install --check
npx expo export --platform android
```

Ver `VALIDACION.md` para resultados y límites de las pruebas realizadas. No incluye APK ni pruebas físicas de Android.

## Mapa del proyecto

- App.js: fuentes, navegación y arranque.
- src/Store.js: estado y operaciones de almacenamiento.
- src/domain.js: validación, filtros e IDs.
- src/data/defaults.json: tarjetas predeterminadas.
- src/screens/: siete pantallas.
- src/session.js: sorteo de participantes.
- src/components/: botones, selectores y formulario reutilizables.
- src/theme.js: colores y estilos.
- tests/: pruebas de lógica.

Documentación consultada: https://docs.expo.dev/more/create-expo/ y https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/

## Neon Motion y navegador

Consulta `REEMPLAZAR.md`. Tras copiar los archivos ejecuta `npm ci` y luego `npx expo start --web --clear`. Las dependencias web y SVG ya están declaradas. Se conservan la paleta rosa/naranja, el almacenamiento y las categorías. Los efectos respetan reducir movimiento. La implementación usa Reanimated para transformaciones y opacidad, sin actualizar el estado de React en cada cuadro del giro.

## Tarjetas con nombres y cuenta regresiva

Lee `REEMPLAZAR.md` para instalar esta actualización y crear tarjetas opcionales con `{jugador}`, `{otro}` y temporizador. Las tarjetas recibidas se excluyen para cada jugador por separado hasta confirmar una nueva ronda; otras personas todavía pueden recibirlas. Se incluyen controles de sonido y vibración y cinco sonidos locales originales. Se conservan las preguntas existentes; los nombres y el historial no se guardan al cerrar.

## Preguntas por jugador

Cada tarjeta puede salir una vez a cada persona en la ronda. Los contadores corresponden al participante elegido. Se evita repetir inmediatamente la última tarjeta cuando tiene alternativas pendientes; si solo le falta esa, puede recibirla. La ruleta mantiene a todos los participantes. Consulta `REEMPLAZAR.md` para detalles.

## Neon Hearts

Incluye entrada omitible de tres segundos con corazones y luz, corazones ambientales en Inicio, flecha de ruleta con clics por cruce de segmento, realce del ganador, expansión al elegir, tarjetas boca abajo con revelación 3D e inclinación y pulso/onda al finalizar el temporizador. La entrada no se repite al volver al Inicio. Los efectos respetan reducir movimiento. Consulta `REEMPLAZAR.md`.
