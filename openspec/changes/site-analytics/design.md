# Design

## Context

Sitio estático en Next 15 sobre Vercel, detrás del proxy de Cloudflare. Sin cookies ni banner de consentimiento. `pnpm perf` mide Lighthouse y el JS de primera carga (hoy ~106 KB en local; 117 KB en producción por el script que inyecta Cloudflare).

## Goals / Non-Goals

**Goals:**
- Vistas, visitantes, referentes y países por página, en el mismo panel donde viven los despliegues.
- Cero cambio para el visitante: sin cookies, sin banner, sin retraso perceptible.

**Non-Goals:**
- Eventos personalizados, UTM, profundidad de lectura: necesitan Pro ($20/mes) o otra herramienta (Umami Cloud gratis, Plausible $9/mes). Se reconsidera cuando las cifras lo justifiquen.
- Speed Insights: el presupuesto de JS no lo admite y `pnpm perf` ya mide lo mismo.

## Decisions

1. **Componente oficial, no el `<script>` a mano.** `@vercel/analytics/next` resuelve la ruta del script que Vercel configura en el build (v2 usa rutas únicas) y agrupa por `route`. *Alternativa descartada:* la etiqueta `<script defer src="/_vercel/insights/script.js">`, que ahorra un componente cliente pero depende de una ruta heredada.
2. **Un `<Analytics />` por layout raíz**, porque cada idioma tiene su propio `<html lang>`. No hay layout común que compartir.
3. **Sin `beforeSend`.** No hay rutas privadas ni parámetros sensibles que redactar; la URL del post lleva solo el `slug`.
4. **Solo en Vercel** (`process.env.VERCEL`). Fuera de Vercel el script no existe: medido el 20 de octubre, su 404 bajó Best Practices a 96 (`errors-in-console`) en `pnpm perf` local. Con la condición, local y CI no lo montan; el coste real del script se mide en producción con `pnpm perf --url`.

## Risks / Trade-offs

- **Presupuesto de JS.** El script (~1,6 KB) se pide antes de `load`. Medido en local con el componente montado: el JS de primera carga siguió dentro de los 110 KB. En producción se suma a los 117 KB que ya impone Cloudflare.
- **Bloqueadores.** Parte de los visitantes bloquean `/_vercel/insights`; las cifras son un mínimo, no un total.
- **Cloudflare.** El proxy no toca estas peticiones; el beacon de Cloudflare Web Analytics no se activa para no duplicar scripts.

## Migration Plan

Un PR. Revertir el commit quita el componente y la dependencia.

## Open Questions

Ninguna.
