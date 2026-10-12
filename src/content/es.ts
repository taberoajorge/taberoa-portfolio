import type { Content } from './en';

const controls = {
  play: 'Reproducir',
  pause: 'Pausar',
  reset: 'Reiniciar',
  next: 'Siguiente paso',
};

export const es: Content = {
  seo: {
    title: 'Alex Taberoa · Senior Software Engineer (Full-Stack, IA, TypeScript)',
    description:
      'Alex Taberoa es Senior Software Engineer en remoto desde México: ingeniería de producto full-stack con IA usando TypeScript, Python, Node.js, React, PostgreSQL y MCP. Herramientas open source para agentes de IA.',
    locale: 'es_MX',
  },
  nav: { label: 'Idioma', other: 'English' },
  guide: {
    kicker: (n: number, total: number) => `Paso ${n} de ${total}`,
    inDrawing: 'En el dibujo',
    prev: 'Anterior',
    next: 'Siguiente',
    steps: 'Pasos',
  },
  hero: {
    name: 'Alex Taberoa',
    title: 'Senior Software Engineer',
    area: 'Ingeniería de producto full-stack con IA',
    lede: 'Construyo sistemas de producto con IA de punta a punta: contratos de agentes, autorización en backend, flujos de revisión antes de escribir y observabilidad en producción.',
    roles:
      'Busco roles de Software Engineer, Full Stack, Backend o Integrations · Remoto desde México',
    award: 'Developer of the Year en Outbuild · 2023 y 2024',
  },
  projectsTitle: 'Proyectos open source',
  projectsLede:
    'Cada uno está dibujado como una máquina que funciona. Pulsa reproducir para verla trabajar.',
  projects: {
    ralph: {
      title: 'Ralph',
      tag: 'Open source · MIT',
      did: 'Construí el motor del bucle: toma la siguiente historia sin terminar, la ejecuta con Codex, Claude, Cursor o Gemini, revisa el resultado y aprende guardrails de los fallos repetidos.',
      stack: ['Rust', 'Bash', 'Agentes de IA'],
      link: 'Ralph en GitHub',
    },
    loopforge: {
      title: 'LoopForge',
      tag: 'Open source · Escritorio',
      did: 'Diseñé y construí una app de escritorio que convierte cualquier CLI de IA en un ingeniero que trabaja horas y se verifica solo: planifica, divide en historias, las ejecuta en git worktrees paralelos, verifica y fusiona.',
      stack: ['Rust', 'Tauri v2', 'Bun', 'TypeScript'],
      link: 'LoopForge en GitHub',
    },
    audio: {
      title: 'Audio Cleaner',
      tag: 'Open source · Web + GPU',
      did: 'Construí la web app y el pipeline en GPU que limpia grabaciones de voz (DeepFilterNet, Silero VAD y noisereduce), con el progreso de cada trabajo enviado por webhooks.',
      stack: ['Next.js', 'Python', 'Modal GPU', 'Drizzle', 'Cloudflare R2'],
      link: 'Audio Cleaner en GitHub',
    },
  },
  ralph: {
    stories: [
      'Formulario de login',
      'Recuperar contraseña',
      'Página de perfil',
      'Alertas por email',
      'Modo oscuro',
    ],
    clumsiness: 'Torpeza del agente',
    steps: [
      {
        name: 'Cola de historias',
        sub: 'prd.json',
        title: 'Las historias que esperan',
        what: 'Ralph trabaja a partir de un PRD: una lista de historias de usuario pequeñas, cada una con sus criterios de aceptación. Siempre toma la siguiente que todavía no ha pasado.',
        map: ['tarjeta = una historia del PRD', 'pila en el cargador = historias pendientes'],
      },
      {
        name: 'El agente trabaja',
        sub: 'Codex · Claude · Cursor · Gemini',
        title: 'Un agente de IA construye la historia',
        what: 'Ralph arma un prompt con la historia, las reglas del proyecto y todas las guardrails aprendidas hasta ahora, y ejecuta el agente de código en modo autónomo.',
        map: [
          'sonda sobre la tarjeta = el agente trabajando en esa historia',
          'carro = Ralph moviendo el trabajo entre estaciones',
        ],
      },
      {
        name: 'Verificación',
        sub: 'deciden los tests',
        title: 'Revisar el resultado',
        what: 'Tras cada intento se comprueba el resultado contra sus criterios de aceptación. Si falla, la misma historia vuelve al agente: nada avanza hasta que pasa.',
        map: [
          'aguja = cómo salió este intento',
          'marca en el reloj = el nivel que debe superar',
          'agujero perforado = un intento fallido',
        ],
      },
      {
        name: 'Guardrails',
        sub: 'guardrails.md',
        title: 'Aprender de los fallos repetidos',
        what: 'Cuando una historia falla tres veces (GUTTER_THRESHOLD = 3), Ralph escribe una guardrail: una lección que se añade a cada prompt futuro para que el agente no repita el mismo error.',
        map: [
          'etiqueta en el tablero = una guardrail',
          'la marca del reloj baja = el siguiente intento es más fácil (ilustrativo)',
        ],
      },
      {
        name: 'Terminada',
        sub: 'passes: true',
        title: 'Historia terminada, a por la siguiente',
        what: 'Una historia que pasa queda marcada como terminada en el PRD y Ralph toma la siguiente. El bucle acaba cuando todas pasan o cuando llega a su tope de iteraciones.',
        map: ['tarjeta en la bandeja = una historia terminada', 'lectura = iteraciones usadas'],
      },
    ],
    doneAll: (it: number) => `Todas las historias pasan. ${it} iteraciones.`,
    capped: (left: string) => `Llegó al tope. Siguen fallando: ${left}.`,
    fig: {
      title: 'Ralph · el bucle',
      hint: 'Reproducir o paso a paso',
      label:
        'Un banco de inspección. Un cargador a la izquierda guarda las tarjetas de historias pendientes. Un carro sobre dos guías lleva la tarjeta de abajo a la estación de prueba, donde baja una sonda. Un reloj al frente muestra lo que sacó el verificador frente al umbral de fallo: por encima de la marca la tarjeta pasa y cae a la bandeja de la derecha; por debajo se le perfora un agujero y se vuelve a intentar. Cada tercer agujero cuelga una etiqueta de guardrail en el tablero del fondo y la marca del reloj baja.',
      keys: {
        lit: 'La historia en curso',
        raised: 'Historias pendientes y terminadas',
        dotted: 'Zona de fallo: tiradas bajo el umbral',
      },
      caption:
        'Ralph toma la siguiente historia sin terminar, un agente la construye y Ralph verifica el resultado. Un fallo perfora un agujero y la misma tarjeta vuelve bajo la sonda. Al 3er agujero Ralph escribe una guardrail (GUTTER_THRESHOLD = 3), que aquí reduce a la mitad la probabilidad de fallo de esa historia. Termina cuando todas las tarjetas están en la bandeja, o en un tope ilustrativo de 24 iteraciones.',
      idle: (pending: number, threshold: number) => `${pending} pendientes · umbral ${threshold}%`,
      running: (name: string, attempt: number, done: number, total: number) =>
        `${name} · intento ${attempt} · ${done}/${total}`,
      say: {
        load: (name: string) => `siguiente historia: ${name}`,
        test: 'el agente la construye · la sonda la verifica',
        roll: (roll: number, threshold: number) =>
          `el verificador saca ${roll} · necesita ${threshold}`,
        fail: (holes: number) => `falla · agujero ${holes} · otra vez`,
        guardrail: 'tercer agujero · Ralph escribe una guardrail · la marca baja',
        pass: 'pasa · a la bandeja de terminadas',
      },
    },
    ...controls,
  },
  loopforge: {
    stories: ['API de auth', 'UI de login', 'Esquema BD', 'Datos semilla', 'Reportes', 'Tests E2E'],
    lanes: (n: number) => (n === 1 ? '1 worktree' : `${n} worktrees`),
    finished: (ticks: number) => `Listo en ${ticks} pasos.`,
    steps: [
      {
        name: 'Plan y cola',
        sub: 'historias + dependencias',
        title: 'Un objetivo dividido en historias',
        what: 'LoopForge convierte un objetivo en un plan y lo divide en historias pequeñas. Algunas dependen de otras, y esas esperan hasta que lo que necesitan se haya fusionado.',
        map: ['tarjeta = una historia', 'pasador = una dependencia que aún no se fusionó'],
      },
      {
        name: 'Worktrees',
        sub: 'uno por historia',
        title: 'Trabajo en paralelo, por separado',
        what: 'Cada historia lista recibe su propio git worktree, una copia separada del código, para que varios agentes trabajen a la vez sin pisarse los archivos.',
        map: ['yunque = un git worktree', 'tres sondas = agentes trabajando en paralelo'],
      },
      {
        name: 'Verificar',
        sub: 'una lámpara por fallo',
        title: 'Cada worktree se comprueba',
        what: 'Tras cada intento LoopForge ejecuta la verificación. Un fallo enciende una lámpara y la historia se vuelve a intentar en el mismo worktree.',
        map: [
          'lámpara encendida = un fallo seguido',
          '1 o 3 worktrees = cuánto trabajo corre a la vez',
        ],
      },
      {
        name: 'Fusionar en main',
        sub: 'fast-forward',
        title: 'Lo que pasa llega a main',
        what: 'Una historia que pasa se fusiona en main con fast-forward y su worktree se elimina. Las historias que la esperaban quedan desbloqueadas.',
        map: ['plataforma = la rama main', 'pila encima = commits fusionados'],
      },
      {
        name: 'Revisión humana',
        sub: '3 fallos seguidos',
        title: 'Saber cuándo parar',
        what: 'Tras tres fallos seguidos, la historia sale del bucle y se marca para que la revise una persona, en lugar de quemar el bucle. Lo que depende de ella sigue bloqueado.',
        map: ['bandeja con bandera = esperando a una persona'],
      },
    ],
    fig: {
      title: 'LoopForge · bucles en paralelo',
      hint: 'Reproducir o paso a paso',
      label:
        'Un banco con tres yunques de prueba bajo un mismo puente, uno por git worktree. Una bandeja a la izquierda guarda seis tarjetas de historias; las que dependen de algo aún sin fusionar las sujeta un pasador. En cada paso, las tarjetas listas vuelan a los yunques libres y las tres sondas prueban a la vez. Si pasa, la tarjeta va a la plataforma de main a la derecha; tres fallos seguidos encienden tres lámparas y la mandan a la bandeja de revisión humana, que levanta una bandera.',
      keys: {
        lit: 'Historias en curso',
        raised: 'Historias en cola, fusionadas y en revisión',
        edge: 'Pasador: una dependencia aún no se fusionó',
      },
      caption:
        'LoopForge ejecuta el bucle de Ralph en paralelo. Una historia solo sale de la cola cuando todas sus dependencias se fusionaron; cada historia lista tiene su propio worktree. Si pasa, se fusiona en main con fast-forward; tres fallos seguidos (GUTTER_THRESHOLD = 3) la mandan a revisión humana en lugar de quemar el bucle. Cambia a un worktree para ver el mismo trabajo tardar más.',
      idle: (ready: number, lanes: number) =>
        `${ready} listas · ${lanes} worktree${lanes === 1 ? '' : 's'}`,
      say: {
        queue: (ready: string, waiting: number) =>
          `listas: ${ready}${waiting ? ` · ${waiting} esperan una dependencia` : ''}`,
        fill: (names: string) => `${names} → su propio worktree`,
        work: 'los agentes trabajan en paralelo, cada uno en su worktree',
        merged: (names: string) => `pasó → fusionada en main: ${names}`,
        review: (names: string) => `3 fallos seguidos → revisión humana: ${names}`,
        results: (merged: string, failed: string, review: string) =>
          [
            merged && `fusionada: ${merged}`,
            failed && `falló: ${failed}`,
            review && `a revisión: ${review}`,
          ]
            .filter(Boolean)
            .join(' · '),
        unlock: (names: string) => `desbloqueada: ${names}`,
      },
    },
    ...controls,
  },
  audio: {
    before: 'Antes',
    after: 'Después',
    steps: [
      {
        name: 'Subida',
        sub: 'web app → worker GPU',
        title: 'Llega una grabación',
        what: 'Subes una grabación de voz en la web app. Un worker con GPU toma el trabajo, y la app muestra el progreso mientras pasa por las tres etapas siguientes.',
        map: [
          'cinta que sale de la bobina izquierda = la grabación llegando',
          'barras oscuras = voz · barras finas = ruido de fondo',
          'regla = segundos',
        ],
      },
      {
        name: 'Quitar ruido',
        sub: 'DeepFilterNet',
        title: 'Eliminar el ruido de fondo',
        what: 'Un modelo neuronal separa la voz del ruido y baja el ruido de fondo sin tocar la voz.',
        map: ['primer cabezal = DeepFilterNet', 'barras más finas detrás = menos ruido'],
      },
      {
        name: 'Recortar silencios',
        sub: 'Silero VAD',
        title: 'Encontrar la voz y recortar silencios largos',
        what: 'La detección de voz encuentra dónde habla alguien. Los silencios más largos que el mínimo del preset se recortan, dejando un margen alrededor de cada frase y 150 ms entre frases.',
        map: [
          'cuchilla = Silero VAD',
          'barras que se desvanecen = silencio que se corta',
          'la cinta se cierra = la grabación se acorta',
          'selector al frente = el preset: cuánto debe durar una pausa para cortarla',
        ],
      },
      {
        name: 'Pasada final',
        sub: 'noisereduce',
        title: 'Pulir lo que queda',
        what: 'Una última pasada quita casi todo el ruido restante. Cuánto depende del preset: del 50% al 85%.',
        map: ['rodillo = noisereduce', 'selector al frente = el preset: cuánto ruido quitar'],
      },
      {
        name: 'Resultado',
        sub: 'lista para descargar',
        title: 'Una grabación más corta y limpia',
        what: 'El archivo limpio vuelve a la web app, listo para descargar: la voz queda intacta, el ruido desaparece y las pausas largas se acortan. Prueba otro preset y vuelve a reproducir para comparar.',
        map: [
          'cinta en la bobina derecha = la grabación limpia',
          'lectura = duración antes y después',
          'gentle = conserva más pausas · aggressive = más corta',
        ],
      },
    ],
    params: { silence: 'silencio mín.', pad: 'margen' },
    fig: {
      title: 'Audio Cleaner · el pipeline',
      hint: 'Reproducir o paso a paso · elige preset',
      label:
        'Una mesa de cinta. Una grabación de voz está impresa como forma de onda en una cinta de papel entre dos bobinas, sobre una regla en segundos. Un pórtico sobre dos guías lleva tres cabezales, uno por etapa del pipeline. El primero (DeepFilterNet) baja el ruido de fondo detrás de él; el segundo (Silero VAD) encuentra cada silencio largo y luego la cinta se cierra, dejando un margen alrededor de cada frase y 150 ms entre ellas; el tercero (noisereduce) quita casi todo el ruido que queda. Un selector al frente elige el preset.',
      keys: {
        raised: 'La voz en la cinta',
        dim: 'Ruido de fondo y silencios que se recortan',
        lit: 'La etapa que trabaja',
      },
      caption:
        'Audio Cleaner ejecuta tres etapas en un worker con GPU: DeepFilterNet quita el ruido de fondo, Silero VAD detecta la voz para recortar los silencios largos y noisereduce da una pasada final. Los presets son los del repositorio (presets.py). La grabación es sintética y no suena; sus tiempos y el recorte siguen las reglas reales.',
      say: {
        waiting: 'esperando una grabación · pulsa reproducir',
        arrive: (seconds: string) =>
          `subida · una grabación de voz de ${seconds} s con ruido de fondo`,
        denoise: 'eliminación de ruido · DeepFilterNet baja el ruido de fondo',
        detect: (silence: number) =>
          `detección de voz · Silero VAD encuentra silencios ≥ ${silence} ms`,
        trim: (pad: number) =>
          `recorte de silencios · deja ${pad} ms alrededor de cada frase + 150 ms entre ellas`,
        polish: (reduction: number) =>
          `pasada final · noisereduce quita el ${reduction}% de lo que queda`,
      },
    },
    ...controls,
  },
  contact: {
    title: 'Hablemos',
    description:
      'Si tienes un rol abierto, escríbeme. Mi código es público y mi CV está a un clic.',
    cv: 'Descargar CV (PDF)',
    email: 'Escribir',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
};
