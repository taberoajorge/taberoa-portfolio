# Spec Delta

## MODIFIED Requirements

### Requirement: Encontrable en buscadores
El sitio SHALL exponer:
- un `sitemap.xml` con las dos URL de la página principal y sus alternativas por idioma, más la URL de cada post;
- un `robots.txt` que permita el rastreo y apunte al sitemap;
- datos estructurados JSON-LD (`Person` y `ProfilePage`, y los proyectos como `SoftwareSourceCode` con su repositorio);
- un título y una descripción por idioma que incluyan el nombre, el rol y el stack principal.

El nombre MUST estar dentro del `h1`, y los encabezados MUST seguir el orden h1 → h2 → h3. Las páginas SHALL generarse como HTML estático.

#### Scenario: Rastreo
- **WHEN** un buscador pide `/robots.txt` y `/sitemap.xml`
- **THEN** ambos responden 200, y el sitemap lista `/` y `/es` con `hreflang` y la URL de cada post

#### Scenario: Datos estructurados
- **WHEN** se analiza el JSON-LD de cualquiera de las dos páginas
- **THEN** es JSON válido con un `Person` que tiene nombre, puesto, `sameAs` (LinkedIn y GitHub) y los tres repositorios
