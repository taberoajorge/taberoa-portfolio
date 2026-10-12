# Spec Delta

## Purpose

Preparar cualquier checkout o worktree del repo con un solo comando, de forma que varios worktrees convivan en la misma máquina sin pisarse. Orca lo ejecuta automáticamente al crear un worktree.

## ADDED Requirements

### Requirement: Un comando de preparación
`sh scripts/bootstrap.sh` SHALL preparar un checkout limpio:
1. comprueba la versión mayor de Node fijada en `.node-version` y que haya Corepack;
2. instala las dependencias con el lockfile congelado;
3. activa los hooks de Git versionados;
4. imprime el puerto y la URL de ese checkout.

MUST usar POSIX `sh`, sin depender de fish ni de bash. MUST NOT copiar credenciales, iniciar servidores ni tocar otros checkouts.

#### Scenario: Checkout nuevo
- **WHEN** se ejecuta `sh scripts/bootstrap.sh` en un clon recién hecho con la versión de Node correcta
- **THEN** termina con código 0, quedan instaladas las dependencias, `core.hooksPath` vale `.githooks` y se imprime la URL local

#### Scenario: Node equivocado
- **WHEN** la versión mayor de Node activa no coincide con `.node-version`
- **THEN** el script termina con error y dice cómo cambiar de versión, sin instalar nada

#### Scenario: Hooks ajenos
- **WHEN** `core.hooksPath` ya apunta a otra carpeta
- **THEN** el script se detiene y explica cómo integrarlos, sin sobrescribirlos

### Requirement: Integración con Orca
El repo SHALL incluir un `orca.yaml` que ejecute el bootstrap como preparación del worktree y haga esperar a los agentes hasta que termine.

#### Scenario: Worktree creado desde Orca
- **WHEN** se crea un worktree con Orca desde una rama que contiene esta configuración
- **THEN** Orca ejecuta `sh scripts/bootstrap.sh` y los agentes arrancan cuando ha terminado

### Requirement: Un puerto por worktree
`pnpm dev` y `pnpm start` SHALL usar un puerto derivado de forma determinista de la ruta canónica del checkout, dentro de un rango fijo. Si otro worktree registrado tiene el mismo puerto, MUST fallar antes de arrancar y nombrar ese worktree.

#### Scenario: Dos worktrees a la vez
- **WHEN** se ejecuta `pnpm dev` en dos worktrees distintos de este repo
- **THEN** cada uno escucha en su propio puerto y los dos funcionan a la vez

#### Scenario: Puerto estable
- **WHEN** se ejecuta `pnpm dev` dos veces en el mismo checkout
- **THEN** usa el mismo puerto ambas veces

#### Scenario: Colisión
- **WHEN** dos worktrees registrados reciben el mismo puerto
- **THEN** `pnpm dev` falla con un mensaje que nombra el otro worktree y sugiere moverlo

### Requirement: Documentación de worktrees
`docs/worktrees.md` SHALL explicar:
- cómo preparar un worktree, con y sin Orca;
- cómo se reparten los puertos;
- qué se comparte entre checkouts (el almacén de pnpm, la configuración de Git) y qué no (`node_modules`, el estado local).

#### Scenario: Sin Orca
- **WHEN** alguien crea un worktree con `git worktree add` y sigue `docs/worktrees.md`
- **THEN** obtiene el mismo resultado que con Orca, ejecutando el bootstrap a mano
