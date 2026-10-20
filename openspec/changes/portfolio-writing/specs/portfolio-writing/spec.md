# Spec Delta

## Purpose

Que el portafolio publique textos largos propios, cada uno con una URL estable e indexable, sin cambiar cómo carga el resto del sitio.

## ADDED Requirements

### Requirement: Sección de escritos en la página principal
La página principal SHALL mostrar, entre los proyectos y el contacto, una sección con la lista de posts: fecha, título enlazado, resumen y un enlace de lectura. En `/es` cada entrada MUST indicar que el post está en inglés y el enlace MUST llevar `hreflang="en"`.

#### Scenario: Lista en inglés
- **WHEN** un visitante abre `/`
- **THEN** ve la sección «Writing» con el título del post enlazado a `/writing/<slug>`

#### Scenario: Lista en español
- **WHEN** un visitante abre `/es`
- **THEN** ve la sección «Escritos» y, junto a la fecha del post, «En inglés»

### Requirement: Una página estática por post
Cada post SHALL servirse en `/writing/<slug>` como HTML estático en inglés, con `<html lang="en">`, un `h1` con el título, el texto completo presente sin JavaScript y un bloque de código que no provoque scroll horizontal a 390 px. El post MUST terminar con una nota que diga cómo se redactó.

#### Scenario: Sin JavaScript
- **WHEN** se pide `/writing/<slug>` con JavaScript desactivado
- **THEN** el título, el texto y la tabla están en el HTML

#### Scenario: Móvil
- **WHEN** se abre el post a 390 px de ancho
- **THEN** no hay scroll horizontal de página; el bloque de código desplaza por dentro

### Requirement: Metadatos y datos estructurados del post
Cada página de post SHALL declarar su `canonical` en `/writing/<slug>`, sin alternativas por idioma, título y descripción propios, Open Graph de tipo `article` con `publishedTime`, y un JSON-LD `BlogPosting` cuyo `author` apunte a la `Person` del sitio.

#### Scenario: Compartir el post
- **WHEN** un servicio de previsualización pide `/writing/<slug>`
- **THEN** recibe `og:type=article`, `og:title` con el título del post y `og:description` con su resumen

#### Scenario: Datos estructurados
- **WHEN** se analiza el JSON-LD del post
- **THEN** es un `BlogPosting` válido con `headline`, `datePublished`, `inLanguage` `en` y `author` `https://taberoa.com/#person`

### Requirement: Posts descubribles
`/sitemap.xml` SHALL listar la URL de cada post y `/llms.txt` SHALL incluir una sección «Writing» con el título, la URL y el resumen de cada post.

#### Scenario: Sitemap
- **WHEN** un buscador pide `/sitemap.xml`
- **THEN** encuentra `https://taberoa.com/writing/<slug>`
