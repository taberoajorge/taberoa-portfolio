# Spec Delta

## Purpose

Cómo entra un cambio al repo público: qué se comprueba en local y en CI, cómo deben ser los commits y los PRs, y qué no puede publicarse nunca (secretos, atribución a IA).

## ADDED Requirements

### Requirement: Un comando de comprobación
`pnpm check` SHALL ejecutar en orden:
1. el formato y el lint (Biome);
2. los tipos (TypeScript);
3. los tests (modelos, scripts y harness);
4. las fronteras de dependencias y la detección de código muerto;
5. la validación estricta de OpenSpec.

MUST terminar con un código distinto de cero si cualquiera falla.

#### Scenario: Todo en verde
- **WHEN** se ejecuta `pnpm check` en `main`
- **THEN** termina con código 0

#### Scenario: Un fallo
- **WHEN** un test falla
- **THEN** `pnpm check` termina con un código distinto de cero y muestra el test

### Requirement: CI en GitHub
Cada PR y cada push a `main` SHALL ejecutar un workflow que:
- instale con el lockfile congelado y la versión de Node de `.node-version`;
- ejecute `pnpm check` y `pnpm build`;
- audite las dependencias de producción;
- escanee el cambio en busca de secretos con una herramienta de versión fija y suma verificada.

Las acciones de terceros MUST fijarse por SHA de commit y el workflow MUST tener permisos de solo lectura.

#### Scenario: Secreto en un PR
- **WHEN** un PR añade una clave privada
- **THEN** el job de CI falla en el paso de escaneo de secretos

### Requirement: Commits convencionales y sin atribución
Cada mensaje de commit SHALL seguir Conventional Commits (`tipo(ámbito): asunto`). MUST NOT contener atribución a herramientas de IA, ni trailers como `Co-Authored-By` de un asistente, ni pies del tipo "Generated with/by…". Un hook `commit-msg` versionado MUST rechazarlo en local, y la misma regla MUST comprobarse en CI sobre los commits del PR.

#### Scenario: Atribución
- **WHEN** un commit incluye `Co-Authored-By: Claude <noreply@anthropic.com>`
- **THEN** el hook `commit-msg` lo rechaza con un mensaje que dice qué quitar

#### Scenario: Formato
- **WHEN** un commit se titula "arreglos varios"
- **THEN** se rechaza y se indica el formato esperado

### Requirement: PRs con descripción útil
Un PR SHALL tener un título en Conventional Commits y un cuerpo con las secciones `Summary`, `Intent` y `Verification`. `pnpm delivery:pr-create` MUST:
1. validar el título y el cuerpo;
2. comprobar que la rama está al día con `origin/main`;
3. abrir el PR con `gh`.

La plantilla de PR del repo MUST tener esas tres secciones.

#### Scenario: Cuerpo incompleto
- **WHEN** se ejecuta `pnpm delivery:pr-create` con un cuerpo sin `Verification`
- **THEN** se detiene antes de llamar a GitHub y nombra la sección que falta

#### Scenario: Rama atrasada
- **WHEN** `origin/main` tiene commits que la rama no contiene
- **THEN** se detiene y pide actualizar la rama

### Requirement: Antes de subir
El hook `pre-push` SHALL:
- comprobar que la versión mayor de Node coincide con `.node-version`;
- ejecutar `pnpm check` y `pnpm build`;
- rechazar un push forzado a `main`.

Los pushes que solo borran ramas o etiquetas MUST saltarse los checks.

#### Scenario: Push con checks rotos
- **WHEN** se hace push de una rama cuyo `pnpm check` falla
- **THEN** el push se cancela

### Requirement: Higiene de repo público
El repo SHALL incluir:
- un README en inglés con el propósito, el mapa de arquitectura, los comandos, la preparación de agentes y worktrees, y la licencia;
- un `LICENSE` vigente, que aclare que el código es MIT y que los textos, el CV y la identidad personal no lo son;
- un `.gitignore` que excluya las capturas locales, el estado de los hooks de agente, los archivos de entorno y los ajustes locales de los clientes;
- Dependabot para npm y para GitHub Actions.

No MUST haber archivos generados ni locales versionados.

#### Scenario: Archivos locales
- **WHEN** se ejecuta `git ls-files`
- **THEN** no aparecen `shots/`, `.next/`, `.claude/settings.local.json`, ni el estado de hooks o archivos `.env`
