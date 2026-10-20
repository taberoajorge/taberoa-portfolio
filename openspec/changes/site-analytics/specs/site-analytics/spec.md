# Spec Delta

## Purpose

Saber cuántas personas llegan a cada página del sitio y desde dónde, sin cookies ni consentimiento y sin salirse de los presupuestos de carga.

## ADDED Requirements

### Requirement: Vistas por página sin cookies
Cada página del sitio SHALL registrar una vista en Vercel Web Analytics con su ruta, referente, país y tipo de dispositivo. El sitio MUST NOT guardar cookies ni identificadores persistentes para medir, y MUST NOT mostrar ningún banner de consentimiento.

#### Scenario: Visita desde LinkedIn
- **WHEN** un visitante abre `/writing/<slug>` desde un enlace en LinkedIn
- **THEN** el panel de Analytics cuenta una vista de esa ruta con `linkedin.com` como referente, y el navegador no recibe ninguna cookie del sitio

### Requirement: Dentro del presupuesto
El script de medición SHALL cargarse diferido, pesar menos de 3 KB comprimidos y montarse solo en despliegues de Vercel, donde existe. `pnpm perf` MUST seguir dando 100 en las cuatro categorías de Lighthouse en móvil y escritorio para `/` y `/es`, con el JS de primera carga dentro de su presupuesto en local.

#### Scenario: Presupuesto
- **WHEN** se ejecuta `pnpm perf` sobre el build de producción en local
- **THEN** las cuatro puntuaciones son 100 y el JS de primera carga es de 110 KB o menos
