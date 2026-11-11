# Validación de la actualización - 11 noviembre 2026

## Comprobaciones completadas

- `npm test`: 28 pruebas aprobadas.
- Lógica por jugador: una misma tarjeta puede salir una vez a cada persona; el consumo de una no reduce el contador de otra. Se contemplan participantes con el mismo nombre.
- Variedad: se evita la última tarjeta si hay alternativas; si es la única pendiente, no se bloquea. Nunca se habilita una ya recibida por esa persona.
- Categorías, agotamiento individual y reinicio de ronda comprobados.
- Nombres: nunca se elige la misma posición para `{otro}`; los marcadores repetidos conservan un destinatario; reemplazos con caracteres especiales son literales.
- Formato: las 40 tarjetas anteriores siguen siendo válidas; opciones nuevas y límites de duración comprobados.
- Reloj: inicio manual, pausa, reanudación, retrasos de intervalos, fin a cero y reinicio.
- Geometría de ruleta y almacenamiento: pruebas anteriores conservadas.
- Babel: 28 archivos JavaScript/JSX analizados sin errores.
- `npm ls --depth=0`: árbol de dependencias sin paquetes inválidos.
- Versiones de audio, hápticos, assets, SVG, React y web contrastadas con el catálogo incluido en Expo SDK 57.
- Exportación web y Android/Hermes completada, con los cinco sonidos WAV y las fuentes locales incluidos.

La consulta de compatibilidad en línea de Expo sufrió un timeout. La instalación se completó con las versiones del catálogo local del SDK y npm; se verificaron esas versiones y ambas exportaciones.

## Límites

No se ejecutaron interacciones en un navegador, teléfono ni emulador. No se ha verificado audio audible, vibración física, fluidez ni accesibilidad con lector de pantalla. No se generó APK. La compilación y las pruebas de lógica no sustituyen esa revisión.

## Prueba manual recomendada

1. Reemplazar todos los archivos, ejecutar npm ci y abrir web o Expo Go.
2. Crear una tarjeta normal, otra con nombres, otra con temporizador y otra con ambas opciones.
3. Editarlas y cerrar/abrir la app para comprobar que sus opciones se conservan.
4. Comprobar rechazos: texto vacío, nombres activos sin marcador, marcador desconocido y duración fuera de 5-600.
5. Jugar con dos y luego con tres participantes: `{otro}` corresponde a otra posición; se mantienen los nombres en la tarjeta.
6. Jugar con dos personas y comprobar que una misma pregunta puede salir una vez a cada una. Cambiar pregunta consume esa tarjeta solo para quien juega. Verificar los contadores individuales y la variedad entre turnos.
6a. Si alguien agota ambos tipos, Pasar turno permite seguir sin borrar el registro de los demás; la ruleta continúa incluyendo a todos.
7. Iniciar una nueva ronda y confirmar que las vistas vuelven a estar disponibles.
8. Temporizador: iniciar, pausar, esperar, continuar, reiniciar y dejar llegar a cero. Pausar al salir de la app y verificar reanudación manual.
9. Cambiar tarjeta mientras corre y pasar turno: el reloj anterior no emite avisos posteriores.
10. Activar/desactivar sonido y vibración por separado. Probar giro, ganador, los últimos tres segundos y fin de tiempo. Silenciar durante un giro.
11. Probar fuente ampliada, pantalla estrecha, nombres largos y reducir movimiento.

## Referencias de API consultadas

- https://docs.expo.dev/versions/v57.0.0/sdk/audio/
- https://docs.expo.dev/versions/latest/sdk/haptics/

## Validación de la actualización de efectos

- Se repitieron las 28 pruebas existentes y el análisis de los 28 archivos JavaScript/JSX: aprobados.
- Exportaciones web y Android/Hermes completadas con los componentes de entrada, corazones y tarjetas nuevos.
- No cambian la lógica de preguntas por jugador, el formato de tarjetas ni sus claves de almacenamiento.
- No se han medido cuadros por segundo ni se ha hecho una prueba visual/interactiva en navegador o teléfono. Las exportaciones confirman compilación, no la apariencia ni la fluidez final.

Comprobar en tu dispositivo:

1. Al abrir: intro completa y botón Entrar; volver a Inicio no repite la intro.
2. Corazones detrás del contenido, sin bloquear botones; detenerse al salir de Inicio.
3. Ruleta: pequeños golpes de flecha y clics mientras gira, sector correcto resaltado al finalizar. Silenciar conserva la animación.
4. Verdad o Reto: expansión de la elegida, desvanecimiento de la otra y un solo cambio de pantalla ante toques rápidos.
5. Tarjeta cubierta: revelar con un toque, texto legible, giro completo y botones habilitados al terminar.
6. Cursor/presión: inclinación leve, retorno al salir/soltar, sin afectar el giro.
7. Cambiar pregunta: la nueva vuelve cubierta; el temporizador anterior se descarta.
8. Temporizador: aparece tras revelar, pulsa solo en los últimos tres segundos en marcha y muestra una onda al llegar a cero.
9. Reducir movimiento: sin intro, corazones, inclinación ni giro prolongado; todavía se puede revelar, elegir y jugar.
10. Probar pantalla estrecha, fuente grande y una pregunta de 500 caracteres para verificar la altura de la tarjeta.

## Revisión del módulo Lista

- `npm test`: 37 pruebas aprobadas (28 existentes y 9 de integración nuevas).
- Las pruebas nuevas montan List, ItemForm y Store reales con React Test Renderer. Solo se simulan la superficie nativa/animada y el almacenamiento del dispositivo. No son una comprobación visual en navegador ni teléfono.
- Se comprueban filtros, lista vacía, metadatos de nombres y duración, edición de todos los campos conservando el ID, cancelación y recarga.
- Se comprueban fallos de escritura: conservan formulario o tarjeta anterior y permiten reintentar.
- Se comprueban confirmación/cancelación de borrado, eliminación de la última tarjeta sin volver a sembrar predeterminadas y dobles toques al guardar y borrar.
- Se sustituyó Alert.alert: la implementación instalada de React Native Web es vacía y no mostraba la confirmación de borrado.
- Se fija el tamaño del contenedor sin ScrollView y se desplazan encabezado y tarjetas con FlatList. El desplazamiento final todavía debe revisarse físicamente en el dispositivo.
- Análisis de los 28 archivos JS/JSX completado sin errores.
- Exportaciones web y Android/Hermes completadas.

Revisión manual restante: abrir Lista en ventana pequeña, desplazarse hasta la última tarjeta y comprobar que la confirmación de borrado es visible y accesible, con texto largo y fuente ampliada.

## Actualización Neon Portal

- Se reemplaza únicamente la animación de inicio, conservando Lista revisada y el juego.
- Las 37 pruebas automáticas existentes pasan. Se verifica la sintaxis de la nueva entrada y se exporta para web y Android/Hermes.
- No se añaden pruebas de píxeles ni se afirma validación visual o de cuadros por segundo. La apariencia y fluidez deben comprobarse en el dispositivo.
- Revisión manual: entrada completa y omisión, recarga, volver al Inicio sin repetir, ventanas de poca altura, opción de reducir movimiento y ausencia de bloqueo al terminar la escena.
