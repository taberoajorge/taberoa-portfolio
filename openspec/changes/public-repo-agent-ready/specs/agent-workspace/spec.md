# Spec Delta

## Purpose

Que cualquier agente de código que se abra en el repo (Claude Code, Codex, Cursor, OpenCode, Gemini CLI/Antigravity o GitHub Copilot) cargue el mismo contexto y las mismas reglas, tenga a mano las mismas skills y se vea frenado por las mismas guardas, sin depender de la configuración personal de nadie.

## ADDED Requirements

### Requirement: Una sola fuente de instrucciones
`AGENTS.md` en la raíz SHALL ser la fuente canónica de instrucciones para agentes. Debe incluir:
- el propósito del repo y el mapa de carpetas;
- los comandos (bootstrap, dev, check, build, entrega);
- las reglas de arquitectura y contra el código de relleno;
- el flujo spec-first con OpenSpec;
- las reglas de commits y PRs;
- las prohibiciones: sin atribución, sin secretos y sin editar `src/iso`.

Los archivos propios de cada cliente MUST importar o remitir a `AGENTS.md` en lugar de duplicar su contenido. Cada carpeta de `src/` y `scripts/` MUST tener su `AGENTS.md` breve con las reglas locales.

#### Scenario: Cliente nuevo
- **WHEN** se abre el repo con cualquiera de los clientes soportados
- **THEN** el cliente carga las instrucciones de `AGENTS.md`, directamente o a través de su archivo propio

#### Scenario: Sin duplicados
- **WHEN** se comparan los archivos de instrucciones de cada cliente
- **THEN** ninguno repite reglas de `AGENTS.md` más allá de una línea de remisión y las notas propias de ese cliente

### Requirement: Skills de proyecto compartidas
El repo SHALL versionar en una ubicación canónica estas skills del proyecto:
- `worktree-bootstrap`: preparar un checkout;
- `orca-cli` y `orchestration`: stubs que descubren la guía del binario instalado de Orca;
- `add-figure`: cómo añadir o cambiar una figura con el motor compartido;
- `verify-ui`: cómo comprobar páginas y figuras en escritorio, móvil, con movimiento reducido y sin JS;
- las skills de OpenSpec.

Cada cliente que tenga su propio directorio de skills MUST recibir un adaptador que remita a la versión canónica, nunca una copia que pueda divergir.

#### Scenario: Skill disponible
- **WHEN** un agente de cualquier cliente pide añadir una figura nueva
- **THEN** encuentra la skill `add-figure` en el directorio de skills de su cliente o en el compartido

#### Scenario: Una sola versión
- **WHEN** se cambia la skill canónica
- **THEN** todos los clientes ven el cambio sin editar sus adaptadores

### Requirement: Harness de hooks común
Un único script de hooks SHALL atender a todos los clientes que soporten hooks. Cada cliente lo llama desde su archivo de configuración con su nombre y el evento. El script MUST cubrir tres momentos:
- **Al iniciar sesión:** añade al contexto la rama, el puerto del worktree y los cambios de OpenSpec activos.
- **Antes de usar una herramienta:**
  - bloquea editar `src/iso`;
  - bloquea escribir secretos conocidos;
  - bloquea `git push --force` a `main`;
  - bloquea commits con atribución.
- **Al terminar:** si hay cambios sin un certificado de `pnpm check` en verde para el árbol actual, pide ejecutarlo antes de dar el trabajo por terminado.

#### Scenario: Editar el kit vendorizado
- **WHEN** un agente intenta editar un archivo de `src/iso`
- **THEN** el hook lo bloquea y explica que es código vendorizado

#### Scenario: Terminar sin checks
- **WHEN** un agente termina tras modificar archivos sin ejecutar `pnpm check` sobre ese estado
- **THEN** el hook de cierre le pide ejecutarlo y no certifica el trabajo

#### Scenario: Terminar con checks
- **WHEN** `pnpm check` pasó sobre el árbol actual
- **THEN** el hook de cierre deja terminar y registra el certificado

### Requirement: Configuración por cliente versionada y sin secretos
La configuración de proyecto de cada cliente SHALL versionarse: instrucciones, skills, hooks, permisos y MCP si hace falta. MUST NOT contener credenciales ni rutas personales. Los ajustes locales de cada cliente MUST estar en `.gitignore`.

#### Scenario: Sin credenciales
- **WHEN** se escanea el repo en busca de secretos
- **THEN** no aparecen en la configuración de ningún cliente

### Requirement: OpenSpec como flujo de cambio
El repo SHALL tener `openspec/config.yaml` con el contexto del proyecto y reglas para las tareas: separar implementación y verificación, y no marcar como hecha una tarea sin verificar. Las specs principales en `openspec/specs/` MUST validar en modo estricto en `pnpm check`.

#### Scenario: Spec inválida
- **WHEN** una spec principal pierde su sección `Purpose`
- **THEN** `pnpm check` falla
