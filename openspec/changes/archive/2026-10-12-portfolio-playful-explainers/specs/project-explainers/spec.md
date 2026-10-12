# Spec Delta

## Purpose

Explicadores interactivos, uno por proyecto, que muestran en tono juguetón cómo funciona de verdad cada proyecto. Cualquier visitante, aunque no sea técnico, debe entender la idea con solo mirarlos, y un desarrollador debe encontrar el detalle real si los toca.

## ADDED Requirements

### Requirement: Fidelidad al proyecto real
Cada explicador SHALL reflejar el comportamiento documentado de su proyecto. Las cifras que muestre (umbrales, presets) MUST coincidir con los valores por defecto publicados en el repositorio correspondiente.

#### Scenario: Umbral de fallos de Ralph
- **WHEN** una historia del explicador de Ralph acumula 3 fallos
- **THEN** se añade una guardrail (lección aprendida) visible y el agente vuelve a intentarlo con ella, como hace la detección de "gutter" de Ralph (`GUTTER_THRESHOLD = 3`)

#### Scenario: Umbral de fallos de LoopForge
- **WHEN** una historia del explicador de LoopForge acumula 3 fallos consecutivos
- **THEN** la historia se salta y se marca para revisión humana, como hace LoopForge con `GUTTER_THRESHOLD = 3`

#### Scenario: Presets de Audio Cleaner
- **WHEN** el visitante selecciona el preset `gentle`, `natural` o `aggressive`
- **THEN** el explicador muestra un silencio mínimo de 1200, 800 o 600 ms, un margen de voz de 350, 250 o 200 ms y una reducción de ruido del 50, 70 o 85 % en el refinado, respectivamente

#### Scenario: Silencio largo recortado
- **WHEN** un silencio entre dos frases dura al menos el silencio mínimo del preset activo
- **THEN** en la vista "después" ese silencio ocupa dos márgenes de voz más 150 ms

### Requirement: Explicador de Ralph, "el robot que no se rinde"
El explicador SHALL mostrar un tablero de historias pendientes, en curso y terminadas, y un agente que toma la siguiente historia sin pasar en cada iteración, la intenta y la verifica.
- Cada fallo SHALL sumar al contador de fallos de la historia, y la misma historia se reintenta.
- Al llegar al umbral, SHALL añadirse una guardrail visible, por ejemplo una nota pegada en la pared, que reduce la probabilidad de fallo en los intentos siguientes. Esta reducción es ilustrativa y queda documentada en el texto del explicador.
- El bucle SHALL detenerse cuando todas las historias pasan o cuando se alcanza un tope de iteraciones. El tope es ilustrativo, porque el valor real por defecto, 9999, no es visualizable, y se indica como tal.
- El visitante SHALL poder iniciar y pausar el bucle, reiniciarlo y ajustar con un control la probabilidad de fallo del agente.
- Un lector de pantalla MUST recibir el estado del bucle en vivo: iteración, historias terminadas y fallos.

#### Scenario: El bucle termina
- **WHEN** el visitante inicia el bucle con probabilidad de fallo baja
- **THEN** todas las historias acaban en "terminadas", el bucle se detiene solo y la lectura muestra el número de iteraciones usadas

#### Scenario: Tope de iteraciones
- **WHEN** el visitante pone la probabilidad de fallo al máximo
- **THEN** el bucle se detiene al alcanzar el tope de iteraciones y la lectura indica qué historias quedaron sin pasar

#### Scenario: Más torpeza, más iteraciones
- **WHEN** el visitante sube la probabilidad de fallo y reinicia
- **THEN** aparecen notas de guardrail y el bucle necesita más iteraciones para terminar

### Requirement: Explicador de LoopForge, worktrees en paralelo
El explicador SHALL mostrar el bucle de Ralph ejecutándose en 1 o en 3 carriles paralelos, a elección del visitante. Cada carril representa un git worktree aislado.
- Una historia con una dependencia sin terminar MUST esperar y no entrar en un carril.
- Al pasar la verificación, la historia SHALL fusionarse con la rama principal y su carril se libera.
- Una historia que llega al umbral de fallos SHALL salir del carril hacia "revisión humana".
- Un panel SHALL mostrar las iteraciones, los commits y los fallos, y un control de pausa SHALL congelar todos los carriles.

#### Scenario: Paralelo termina antes
- **WHEN** el visitante ejecuta el mismo conjunto de historias en 1 carril y después en 3 carriles
- **THEN** la versión de 3 carriles termina en menos pasos, y el panel lo muestra

#### Scenario: Dependencias respetadas
- **WHEN** la historia B depende de la historia A y A no ha pasado
- **THEN** B permanece en espera aunque haya un carril libre

#### Scenario: Pausa
- **WHEN** el visitante activa la pausa
- **THEN** ningún carril avanza hasta que la desactiva

### Requirement: Explicador de Audio Cleaner, el pipeline de limpieza
El explicador SHALL mostrar una forma de onda de voz con ruido que atraviesa las tres etapas del pipeline real, en este orden:
1. Eliminación de ruido (DeepFilterNet).
2. Detección de voz y recorte de silencios (Silero VAD).
3. Refinado de ruido (noisereduce, con el `prop_decrease` del preset).

En el recorte, cada segmento de voz se conserva con su margen (`speech_pad_ms`) a cada lado, y entre segmentos queda una pausa fija de 150 ms.
- El visitante SHALL poder elegir un preset y alternar entre la vista "antes" y la vista "después".
- La forma de onda MUST ser sintética y determinista: la misma semilla produce la misma onda. MUST NOT reproducir audio.

#### Scenario: Recorte según preset
- **WHEN** el visitante cambia de `gentle` a `aggressive`
- **THEN** la onda "después" es más corta, porque se recortan más silencios, y la lectura muestra la duración antes y después

#### Scenario: Silencios cortos se conservan
- **WHEN** un silencio de la onda dura menos que el silencio mínimo del preset activo
- **THEN** ese silencio no se recorta

### Requirement: Textos sin metáforas ajenas al proyecto
Los textos de los explicadores SHALL nombrar las etapas y piezas por lo que hacen en el proyecto real (por ejemplo "eliminación de ruido", "detección de voz", "recorte de silencios", "worktree"). MUST NOT usar metáforas ajenas al dominio, como lavadora, lavado, centrifugado o fogones.

#### Scenario: Copy de Audio Cleaner
- **WHEN** se lee la narración o la leyenda de la figura de Audio Cleaner
- **THEN** describe eliminación de ruido, detección de voz, recorte de silencios y pasada final, sin términos de lavado

### Requirement: Accesibilidad y movimiento
Todos los controles de cada explicador SHALL poder usarse con teclado y tener un nombre accesible. Con `prefers-reduced-motion: reduce`, los explicadores MUST NOT animarse solos: avanzan paso a paso solo a petición del visitante. Cada explicador SHALL incluir una descripción textual breve de lo que muestra.

#### Scenario: Movimiento reducido
- **WHEN** el sistema del visitante pide movimiento reducido
- **THEN** ningún explicador se anima sin interacción, y el control "siguiente paso" avanza el estado

#### Scenario: Teclado
- **WHEN** un visitante navega solo con Tab, Enter y las flechas
- **THEN** puede operar todos los controles de los tres explicadores, con un indicador de foco visible

### Requirement: Rendimiento y ligereza
Los explicadores MUST renderizarse como SVG y HTML, sin WebGL ni canvas. MUST NOT añadir dependencias de ejecución nuevas. Su estado inicial SHALL estar en el HTML del servidor. Las animaciones SHALL pausarse cuando el explicador no esté en pantalla.

#### Scenario: Sin JavaScript
- **WHEN** la página se carga sin JavaScript
- **THEN** cada explicador muestra un estado inicial estático legible con su descripción

#### Scenario: Fuera de pantalla
- **WHEN** un explicador animado sale del viewport
- **THEN** su animación se detiene, y se reanuda al volver a entrar
