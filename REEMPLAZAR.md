# Actualización: Neon Portal

## Copiar y reemplazar

1. Detén Expo con Ctrl+C.
2. Copia todo el contenido de `verdad-o-reto` sobre tu carpeta actual y acepta reemplazar. Incluye todos los archivos nuevos y la carpeta `src/assets/audio`.
3. Desde tu carpeta ejecuta:

```sh
npm ci
npx expo start --web --clear
```

Para Expo Go en Android o iPhone:

```sh
npx expo start --clear
```

Esta entrega incluye las dependencias de audio, vibración y web de la versión anterior; no añade otras nuevas. Es necesario reemplazar también package.json, package-lock.json y app.json. No basta con copiar App.js. No se incluye node_modules.

## Nueva animación de inicio: Neon Portal

La entrada anterior se reemplaza por una secuencia de 4,3 segundos:

1. Aparecen estrellas y anillos de neón en perspectiva.
2. Doce corazones orbitan con tamaños y opacidades que sugieren profundidad.
3. Se reúnen en el centro y generan una expansión de ondas y partículas.
4. “Verdad” y “o Reto.” entran desde lados opuestos con una pasada de luz.
5. La escena se desvanece y deja ver Inicio.

**Entrar →** permite omitirla en cualquier momento. Solo aparece al abrir o recargar la app; no al volver al Inicio. Se omite si está activada la opción de reducir movimiento del sistema. La entrada no reproduce audio automáticamente.

Se ajusta al ancho y alto de la ventana, incluidas ventanas de poca altura. Utiliza los recursos y dependencias existentes. El módulo Lista corregido y el resto de funciones se conservan.

## Correcciones y verificación de Lista

- Borrar abre ahora una confirmación dentro de la app, tanto en web como en móvil. Cancelar conserva la tarjeta.
- Se corrige el contenedor de altura de Lista y se incorpora el encabezado al desplazamiento, para permitir llegar a las últimas tarjetas incluso en pantallas pequeñas.
- Editar conserva el ID y permite modificar texto, tipo, categoría, nombres y temporizador. Los cambios se muestran solo después de guardarse correctamente.
- Si se cambia una categoría, la tarjeta puede dejar de verse bajo el filtro actual; selecciona Todos o su nueva categoría para encontrarla.
- Durante el guardado se bloquean los controles del formulario y los dobles toques. Borrar también tiene bloqueo contra confirmaciones repetidas.
- Si falla el guardado o el borrado, se conserva la información anterior y se muestra un mensaje para reintentar.
- Se incluyen 9 pruebas de integración de Lista, ItemForm, Store y almacenamiento. Pasan además las 28 pruebas anteriores (37 en total).

Para usar la entrega, copia todos los archivos y ejecuta npm ci. Se añade una dependencia de desarrollo para ejecutar las pruebas de integración; los efectos y funciones de juego de la versión Neon Hearts se conservan.

## Nueva entrada y efectos

- Al abrir la app aparece una escena de 4,3 segundos: portal de neón con tres anillos en perspectiva, doce corazones en órbita, convergencia al centro, expansión de luz y partículas, y título que entra desde ambos lados. **Entrar →** permite omitirla. No se reproduce sonido automáticamente en esta entrada.
- La entrada se muestra una vez al abrir; en web, recarga para verla otra vez. Al volver al inicio durante una partida no interrumpe de nuevo.
- En Inicio quedan corazones sutiles flotando detrás del contenido. Se detienen al abandonar la pantalla o pasar la app a segundo plano.
- La ruleta mueve la flecha al cruzar segmentos y reproduce clics vinculados a esos cruces si el sonido está activo. Se limita la frecuencia de los clics para no saturar el audio cuando hay muchos participantes.
- Al elegir ganador, su sector se resalta, los otros se atenúan y su nombre aparece con rebote suave, confeti y ondas de luz.
- Al elegir Verdad o Reto, la opción elegida se expande y la otra se desvanece antes de abrir la tarjeta. Se bloquean toques repetidos durante esa transición.
- Las tarjetas aparecen boca abajo. Toca **Toca para descubrir** para revelarlas con un giro 3D. Cada tarjeta nueva vuelve a estar cubierta.
- Las tarjetas se inclinan suavemente con el cursor en navegador o al presionarlas en un teléfono. La inclinación retorna al salir o soltar.
- Si la tarjeta tiene temporizador, este aparece después de revelarla y conserva su inicio manual. En los últimos tres segundos, el anillo cambia de color y pulsa; al finalizar aparece una onda de luz.

Todos los efectos respetan la opción de reducir movimiento del sistema. Con ella activada, se omite la entrada y los efectos continuos, se simplifican las transiciones y la tarjeta se revela sin giro. Sonido y vibración mantienen sus interruptores independientes.

Esta versión conserva las preguntas por jugador, los contadores, la variedad entre turnos y las opciones de nombres/temporizador al crear o editar. No añade dependencias respecto a la entrega anterior.

## Crear o editar tarjetas con estas opciones

En Inicio → Agregar, o Lista → Editar:

1. Selecciona Verdad o Reto y una categoría.
2. Escribe el texto.
3. Si corresponde, activa **Usar nombres**. Los botones insertan `{jugador}` o `{otro}` donde esté el cursor. Los marcadores deben escribirse exactamente así, en minúsculas.
4. Si corresponde, activa **Cuenta regresiva**. Elige 15, 30 o 60 segundos, o escribe una duración entera entre 5 y 600.
5. Revisa la vista previa y guarda.

Las opciones de nombres y temporizador son independientes y sirven para ambos tipos de tarjeta. Se pueden usar juntas o dejarlas apagadas. No se modifican automáticamente las preguntas existentes.

Ejemplo con ambas opciones:

Texto: `{jugador}, inventa un anuncio divertido para un producto que elija {otro}.`
Usar nombres: activado.
Cuenta regresiva: activada, 30 segundos.

Si juega Ana y la otra persona elegida es Luis, se verá: “Ana, inventa un anuncio divertido para un producto que elija Luis.”

`{jugador}` es quien salió en la ruleta. `{otro}` se elige al azar entre las otras personas. Si aparece varias veces, conserva el mismo destinatario durante esa tarjeta. Dos participantes pueden tener el mismo nombre, pero siguen siendo personas distintas por su posición en la lista.

## Preguntas por jugador

Cada pregunta puede tocarle una vez a cada participante por ronda. Si Ana ya recibió una tarjeta y Luis todavía no, Luis podrá recibirla. Cuando todos la hayan recibido, ya no podrá salirle a nadie hasta confirmar una nueva ronda.

Los contadores de Verdad y Reto muestran las tarjetas pendientes **para la persona elegida**, en la categoría seleccionada. Al mostrar una tarjeta se registra únicamente para quien salió en la ruleta. Participar como `{otro}` en una tarjeta no consume esa pregunta para su propio turno. Dos personas con el mismo nombre conservan registros separados.

Cambiar pregunta también cuenta como haberla recibido: esa tarjeta no vuelve a salirle a esa persona durante la ronda. Las categorías respetan su registro; cambiar a Todos no vuelve a habilitar las recibidas.

Para mantener variedad, se evita mostrar la última tarjeta de nuevo cuando hay otra pendiente del mismo tipo y categoría para esa persona. Si esa es la única pendiente, sí puede salirle: no se bloquea una tarjeta que todavía no ha recibido.

La ruleta sigue sorteando entre todos, sin excluir participantes por sus tarjetas. Si alguien ya agotó ambos tipos en la categoría, puede pulsar Pasar turno. No se añaden un historial consultable ni una pantalla de cierre.

El botón existente **Nueva ronda de preguntas** pide confirmación y limpia el registro de todos, conservando nombres y turno. Iniciar una partida nueva también limpia los registros.

Los registros y nombres duran mientras la partida siga abierta; se reinician al cerrar o recargar. Las preguntas creadas y sus opciones siguen guardadas localmente.

## Cuenta regresiva

Aparece solo si la tarjeta la tiene activada. Empieza manualmente con **Iniciar**. Permite Pausar, Continuar y Reiniciar; muestra un anillo circular y avisa al llegar a cero. Los últimos tres segundos tienen un sonido breve si está activado.

El reloj mide tiempo transcurrido real. Se pausa al pasar la app a segundo plano y se descarta al cambiar de tarjeta o pasar turno. El final del contador no obliga a cambiar de turno.

## Sonido y vibración

Hay interruptores independientes en Inicio, Ruleta y Tarjeta. Los efectos incluyen giro de ruleta, ganador, cambios de tarjeta y fin del tiempo. Los ajustes duran mientras la app siga abierta. Los sonidos son archivos locales originales; no necesitan una API.

En navegador, el sonido puede necesitar una interacción y depende de sus reglas de reproducción. La vibración depende del navegador y del hardware; en un computador sin motor háptico no se sentirá. En iPhone también influyen sus ajustes y modos del sistema. Se utiliza reproducción de audio, sin solicitar grabación ni acceso al micrófono.

## Estilo conservado

Se mantiene Neon Motion: rueda circular, luces ambientales, botones con resorte, confeti, giro de tarjetas y compatibilidad con reducir movimiento.
