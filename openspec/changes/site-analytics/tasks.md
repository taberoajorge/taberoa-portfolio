# Tasks

## 1. Medición

- [x] 1.1 Añadir `@vercel/analytics` 2.0.1 fijado y montar `<Analytics />` en `src/app/(en)/layout.tsx` y `src/app/(es)/layout.tsx`. Se verifica con `pnpm check` y `pnpm build` en verde y, en el build servido, el script de Vercel Analytics presente en `/`, `/es` y el post.
- [x] 1.2 Comprobar los presupuestos. Se verifica con `pnpm perf`: 100 en las cuatro categorías en móvil y escritorio para `/` y `/es`, y el JS de primera carga ≤ 110 KB en local.

## 2. Activación (con el visto bueno del dueño)

- [ ] 2.1 Web Analytics ya está activado en el proyecto `taberoa-portfolio` de Vercel (comprobado por la API el 20 de octubre). PR con `pnpm delivery:pr-create`, merge con CI en verde. Se verifica cuando, tras el despliegue, el panel de Analytics muestra la primera vista de `/writing/java-to-typescript-migration-parity-harness`.
