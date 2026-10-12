# Spec Delta

## Purpose

Cómo está organizado el código del portafolio: qué vive en cada carpeta, quién puede importar a quién y qué se comparte entre las figuras. La meta es que una persona o un agente encuentre cualquier cosa sin leerlo todo, y que añadir o cambiar una figura no obligue a copiar código.

## ADDED Requirements

### Requirement: Una carpeta, un propósito
El código de la aplicación SHALL organizarse en estas carpetas, cada una con un único propósito:

| Carpeta | Propósito |
|---|---|
| `src/app` | Rutas, metadatos y archivos especiales de Next. |
| `src/site` | Secciones de la página y SEO. |
| `src/content` | Textos por idioma y datos del sitio. |
| `src/models` | Modelos puros y deterministas de cada proyecto, con sus tests. |
| `src/figures/engine` | Motor compartido de las figuras. |
| `src/figures/parts` | Piezas de máquina comunes. |
| `src/figures/<proyecto>` | Una carpeta por figura. |
| `src/iso` | Kit isométrico vendorizado. |

Cada carpeta MUST tener un `AGENTS.md` de una a cinco líneas que diga para qué es y qué reglas tiene. No MUST haber archivos de utilidades genéricos sin propósito propio (`utils.ts`, `helpers.ts`, `misc.ts`).

#### Scenario: Ubicar una pieza
- **WHEN** alguien busca dónde cambiar el texto de un paso de LoopForge
- **THEN** lo encuentra en `src/content/en.ts` y `src/content/es.ts`, y en ningún componente

#### Scenario: Sin cajones de sastre
- **WHEN** se ejecuta `pnpm check`
- **THEN** falla si existe en `src/` un archivo llamado `utils`, `helpers` o `misc`

### Requirement: Fronteras de dependencias comprobadas
Las importaciones entre carpetas SHALL respetar estas reglas, y `pnpm check` MUST fallar si alguna se rompe:
- `src/models` no importa React, Next ni ninguna otra carpeta de `src/`.
- `src/iso` no importa nada de `src/` fuera de sí mismo.
- `src/figures` no importa `src/site` ni `src/app`.
- `src/site` no importa los módulos internos de una figura (`view`, `geometry`, `art`, `rig`), solo su componente público.
- `src/app` solo importa `src/site` y `src/content`.

#### Scenario: Importación prohibida
- **WHEN** un archivo de `src/models` importa desde `react`
- **THEN** `pnpm check` termina con error y nombra el archivo y la regla

#### Scenario: Árbol limpio
- **WHEN** se ejecuta `pnpm check` sobre el código actual
- **THEN** la comprobación de fronteras pasa

### Requirement: Lo común de las figuras vive una sola vez
Lo que comparten las figuras SHALL existir en un único lugar:
- el estado de reproducción y consentimiento, la selección de paso, los controles y la maqueta (`FigureShell`);
- el encuadre, el foco, la narración y el paso activo (clase base `Rig`);
- la base de máquina con patas, placa, ranura, tornillos, placa de etiqueta y regla;
- el cálculo de cajas de encuadre.

Un componente de figura MUST NOT redefinir esas piezas.

#### Scenario: Sin copias
- **WHEN** se buscan en `src/figures/<proyecto>` las definiciones de `blank`, `pick`, `setIo` o `look`
- **THEN** no aparecen fuera de `src/figures/engine`

#### Scenario: Figura más pequeña
- **WHEN** se compara cada componente de figura con su versión anterior
- **THEN** cada uno tiene al menos un 30 % menos de líneas, y las figuras se comportan igual (mismos tests, mismas capturas de referencia)

### Requirement: Contenido tipado por idioma
Los textos SHALL vivir en un archivo por idioma (`src/content/en.ts` y `src/content/es.ts`), y los datos sin idioma (enlaces, stack, repositorios, dominio) en un archivo aparte. El español MUST tener el mismo tipo que el inglés: si falta una clave o tiene otra forma, la comprobación de tipos falla.

#### Scenario: Clave que falta
- **WHEN** se borra una clave de `es.ts` que existe en `en.ts`
- **THEN** `pnpm typecheck` falla

### Requirement: Sin código de relleno
El código SHALL cumplir estas reglas:
- No hay exportaciones sin uso.
- No hay comentarios que repitan lo que dice el código; los comentarios explican el porqué o una decisión.
- No hay abstracciones con una sola implementación, salvo las piezas compartidas descritas arriba.
- No hay archivos huérfanos.
- Las simplificaciones deliberadas se marcan con `ponytail:` y nombran su límite.

`pnpm check` MUST detectar las exportaciones y los archivos sin uso.

#### Scenario: Exportación muerta
- **WHEN** un módulo exporta una función que nadie importa
- **THEN** `pnpm check` falla y nombra el símbolo

### Requirement: Comportamiento visible sin cambios
La reorganización MUST NOT cambiar lo que ve el visitante:
- el HTML servido en `/` y `/es` (sin contar los nombres de clases ni de archivos generados);
- los metadatos y el JSON-LD;
- los textos;
- el comportamiento de las tres figuras.

#### Scenario: Paridad de páginas
- **WHEN** se comparan antes y después el `<head>`, los textos visibles y el JSON-LD de `/` y `/es`
- **THEN** son iguales

#### Scenario: Paridad de figuras
- **WHEN** se ejecutan los tests de modelos y una pasada de cada figura con Play
- **THEN** los tests pasan y la narración recorre los mismos pasos en el mismo orden
