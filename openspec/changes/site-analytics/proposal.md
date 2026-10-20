# Proposal

## Why

El primer post ya está publicado y se va a compartir en LinkedIn y X. Hoy no hay forma de saber cuántas personas llegan al post, desde dónde, ni qué páginas del sitio ven. Sin eso no se puede juzgar si la historia funcionó ni qué cambiar en la siguiente.

## What Changes

- Se usa Vercel Web Analytics, ya activado en el proyecto (plan Hobby: 50.000 eventos al mes, ventana de un mes, sin cookies ni banner).
- El sitio monta el componente `Analytics` de `@vercel/analytics/next` en los dos layouts raíz, así cada vista de `/`, `/es` y `/writing/<slug>` se cuenta con su referente, país y dispositivo.

Lo que el visitante ve no cambia. No se guardan cookies ni identificadores persistentes: el visitante se cuenta con un hash que caduca cada día.

## Capabilities

### New Capabilities
- `site-analytics`: medición de visitas por página y origen, sin cookies, dentro de los presupuestos de carga.

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- **Código:** `src/app/(en)/layout.tsx` y `src/app/(es)/layout.tsx`; `package.json` y el lockfile.
- **Dependencias:** `@vercel/analytics` 2.0.1 (MIT). Su script pesa unos 1,6 KB comprimidos y se carga diferido.
- **Presupuestos:** `pnpm perf` sigue siendo la puerta: 100 en las cuatro categorías y el JS de primera carga dentro de los 110 KB en local.
- **Decisiones del dueño:** Vercel Web Analytics, gratis, antes que Umami o Plausible. Los eventos personalizados (leer hasta el final, clic en contacto) y los parámetros UTM requieren el plan Pro; quedan fuera por ahora.
- **Acciones fuera de la máquina:** el merge, que despliega a producción.
