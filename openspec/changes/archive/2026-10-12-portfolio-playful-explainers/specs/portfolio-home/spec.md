# Spec Delta

## Purpose

Página principal del portafolio de Alex Taberoa. Debe pasar el primer vistazo de un reclutador en segundos (rol, stack, qué busca) y llevar a desarrolladores y reviewers a la evidencia: proyectos, código y CV.

## ADDED Requirements

### Requirement: Hero orientado a reclutadores
El primer bloque visible de la página SHALL mostrar, en este orden:
1. El nombre.
2. El rol y el área en las primeras palabras del titular ("Senior Software Engineer · Full-Stack AI Product Engineering").
3. El stack principal (TypeScript, Python, Node.js, React, PostgreSQL, MCP).
4. Los roles buscados.
5. Una señal de confianza: Developer of the Year en Outbuild, 2023 y 2024.

El titular MUST NOT empezar con un saludo genérico.

#### Scenario: Primer vistazo en escritorio
- **WHEN** un visitante abre la página en un viewport de 1440×900
- **THEN** el nombre, el rol, el stack principal y los roles buscados son visibles sin hacer scroll

#### Scenario: Primer vistazo en móvil
- **WHEN** un visitante abre la página en un viewport de 390×844
- **THEN** el nombre, el rol y el stack principal son visibles sin hacer scroll, y no hay scroll horizontal

#### Scenario: Contenido sin JavaScript
- **WHEN** la página se carga con JavaScript desactivado
- **THEN** todo el texto del hero, las tarjetas de proyecto y el contacto están presentes en el HTML

### Requirement: Tarjetas de proyecto con contribución y enlace honesto
Cada proyecto (LoopForge, Ralph, Audio Cleaner) SHALL mostrar:
- qué construyó Alex, en una frase con un verbo en primera persona o impersonal;
- su stack;
- un enlace cuya etiqueta coincida con el destino.

Una etiqueta "Demo" MUST apuntar a una demo en vivo, y una etiqueta "Repo" o "Repositorio" MUST apuntar al código.

#### Scenario: Etiqueta coherente con el destino
- **WHEN** un visitante lee la tarjeta de Audio Cleaner y no existe una demo en vivo publicada
- **THEN** la tarjeta no muestra "PUBLIC DEMO" ni "Demo", y su enlace se etiqueta como repositorio

#### Scenario: Enlaces externos seguros
- **WHEN** un visitante activa el enlace de un proyecto
- **THEN** se abre en una pestaña nueva con `rel="noreferrer"`

### Requirement: Contacto y CV accesibles
La página SHALL ofrecer la descarga del CV en PDF, un enlace de correo y un enlace a LinkedIn. Cada uno MUST tener un nombre accesible en el idioma servido.

#### Scenario: Descarga de CV
- **WHEN** un visitante activa "Descargar CV" / "Download CV"
- **THEN** el navegador descarga `alex-taberoa-cv.pdf`

### Requirement: Una URL por idioma
El sitio SHALL servir el inglés en `/` y el español en `/es`, cada uno como una página propia con el atributo `lang` del `<html>` acorde. Cada página MUST declarar su URL canónica y enlazar la otra con `hreflang` (`en`, `es` y `x-default` hacia `/`).

Un visitante cuyo navegador pida español (`Accept-Language` empieza por `es`) y que no haya elegido inglés SHALL ser redirigido de `/` a `/es`. Un selector visible SHALL permitir cambiar de idioma, y la elección se MUST recordar.

#### Scenario: Visitante hispanohablante
- **WHEN** la petición a `/` trae `Accept-Language: es-MX,es;q=0.9` y no hay elección previa
- **THEN** responde con una redirección a `/es`, que sirve el contenido en español con `<html lang="es">`

#### Scenario: Elige inglés
- **WHEN** ese mismo visitante usa el selector para pasar a inglés
- **THEN** ve `/` en inglés con `<html lang="en">`, y en las visitas siguientes a `/` no se le redirige

#### Scenario: Buscador
- **WHEN** un rastreador pide `/` sin preferencia de idioma
- **THEN** recibe el inglés con `canonical` hacia `/` y `hreflang` hacia `/` y `/es`

### Requirement: Encontrable en buscadores
El sitio SHALL exponer:
- un `sitemap.xml` con las dos URL y sus alternativas por idioma;
- un `robots.txt` que permita el rastreo y apunte al sitemap;
- datos estructurados JSON-LD (`Person` y `ProfilePage`, y los proyectos como `SoftwareSourceCode` con su repositorio);
- un título y una descripción por idioma que incluyan el nombre, el rol y el stack principal.

El nombre MUST estar dentro del `h1`, y los encabezados MUST seguir el orden h1 → h2 → h3. Las páginas SHALL generarse como HTML estático.

#### Scenario: Rastreo
- **WHEN** un buscador pide `/robots.txt` y `/sitemap.xml`
- **THEN** ambos responden 200, y el sitemap lista `/` y `/es` con `hreflang`

#### Scenario: Datos estructurados
- **WHEN** se analiza el JSON-LD de cualquiera de las dos páginas
- **THEN** es JSON válido con un `Person` que tiene nombre, puesto, `sameAs` (LinkedIn y GitHub) y los tres repositorios

### Requirement: Dos columnas en escritorio
En pantallas anchas, cada proyecto SHALL mostrar su texto (qué construí, stack y enlace) en una columna a la izquierda que se queda fija al hacer scroll, y su figura a la derecha. En móvil, el texto y la figura SHALL ir apilados.

#### Scenario: Escritorio
- **WHEN** la página se ve a 1440 px de ancho
- **THEN** el texto de cada proyecto queda a la izquierda de su figura y no hay scroll horizontal

### Requirement: Vista previa al compartir
La página SHALL exponer una imagen Open Graph de 1200×630 con el nombre, el rol y el stack principal, junto con título y descripción OG coherentes con el hero.

#### Scenario: Compartir el enlace
- **WHEN** un servicio de previsualización (LinkedIn, Slack, X) pide la página
- **THEN** recibe `og:image`, `og:title` y `og:description`, y la imagen responde con estado 200 y 1200×630 px

### Requirement: La página no bloquea el contenido
La página MUST NOT mostrar pantallas de carga, intros animadas ni overlays antes del contenido. El contenido SHALL poder recorrerse con scroll en cualquier viewport.

#### Scenario: Viewport bajo
- **WHEN** un visitante abre la página en una ventana de escritorio de 1280×600
- **THEN** puede hacer scroll hasta los explicadores y el contacto sin contenido recortado
