# Spec Delta

## Purpose

Que el portafolio se publique desde su propio repositorio de GitHub en su propio proyecto de Vercel y bajo su dominio, de forma que cada push a `main` se despliegue solo y cada PR tenga su vista previa.

## ADDED Requirements

### Requirement: Repositorio público en GitHub
El código SHALL vivir en el repositorio público `taberoajorge/taberoa-portfolio`, con `main` como rama por defecto y protección de `main`: se exige el check de CI y no se permiten pushes forzados. El remoto `origin` del checkout local MUST apuntar a ese repositorio.

#### Scenario: Remoto
- **WHEN** se ejecuta `git remote get-url origin`
- **THEN** devuelve la URL de `taberoajorge/taberoa-portfolio`

### Requirement: Vercel conectado al repositorio correcto
El proyecto de Vercel `taberoa-portfolio` SHALL estar conectado por Git a `taberoajorge/taberoa-portfolio`:
- `main` es la rama de producción;
- cada PR genera una vista previa;
- usa Node 24 y pnpm.

Ningún otro proyecto de Vercel MUST desplegar este repositorio.

#### Scenario: Push a main
- **WHEN** se fusiona un PR en `main`
- **THEN** Vercel crea un despliegue de producción desde ese commit

#### Scenario: PR
- **WHEN** se abre un PR
- **THEN** Vercel publica una vista previa y la enlaza en el PR

### Requirement: Dominio propio
`taberoa.com` SHALL servir el portafolio, y `www.taberoa.com` MUST redirigir con 308 a `taberoa.com`. Ningún otro proyecto, incluido `todo-app`, MUST tener esos dominios asignados. Las URL canónicas, el sitemap, el JSON-LD y `llms.txt` MUST usar `https://taberoa.com`.

#### Scenario: Dominio
- **WHEN** se pide `https://taberoa.com/`
- **THEN** responde el portafolio con su `canonical` hacia `https://taberoa.com/`

#### Scenario: www
- **WHEN** se pide `https://www.taberoa.com/es`
- **THEN** redirige con 308 a `https://taberoa.com/es`

### Requirement: Paridad con producción
Tras el despliegue, las comprobaciones de `site-performance` SHALL repetirse contra `https://taberoa.com` con los mismos umbrales que en local.

#### Scenario: Lighthouse en producción
- **WHEN** se ejecuta `pnpm perf --url https://taberoa.com` tras el despliegue
- **THEN** cumple los mismos umbrales que en local
