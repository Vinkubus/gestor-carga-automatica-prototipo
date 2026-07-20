# Progreso

Última actualización: 2026-07-17 (sesión inicial de construcción del prototipo completo).

## Estado general: ✅ Funcional, las 5 pantallas construidas y verificadas en navegador real

El build de producción pasa (`npm run build`) y no hay errores de TypeScript (`tsc -b`).

## Checklist por pantalla

### 1. Concentrador de procesos (`ConcentradorPage.tsx`) — ✅ Verificado en navegador
- [x] Tabla con 5 columnas, 6 procesos semilla con IDs únicos y estatus mezclados
- [x] Buscador en vivo por ID o nombre (probado: escribir "Fiduciario" filtra a 1 resultado)
- [x] Chips de filtro por estatus, conteo correcto, chip activo con estilo distinto
- [x] KPI cards derivadas del mismo store que los chips y el pie de tabla (probado: crear un
      proceso sube "Configurados" de 6 a 7 en KPI, chip "Todos" y pie de tabla al mismo tiempo)
- [x] Selector "Mostrar N registros" + paginación con `disabled` real cuando no hay
      página anterior/siguiente
- [x] "Ver detalle" navega a `/procesos/:id`
- [x] "+ Nuevo proceso" abre el modal
- [x] Scroll horizontal de la tabla verificado forzando el body a 420px vía inyección de CSS
      (el entorno de automatización del navegador no permite resize real de viewport en esta
      sesión) — `wrapper.scrollWidth (900) > wrapper.clientWidth (338)`, columnas no se
      comprimen. **Recomendado**: volver a verificar con un resize real de ventana / DevTools
      responsive mode cuando alguien tenga acceso directo al navegador.

### 2. Modal nuevo proceso (`NewProcessModal.tsx`) — ✅ Verificado en navegador
- [x] Autocompletado solo en el primer foco de Nombre y Ruta, campos editables después
- [x] Bloque de estructura de nombres de solo lectura (texto exacto del Figma, incluyendo el
      segmento `{tipo_persona}` que no estaba en el prompt original del usuario pero sí en el
      Figma — se priorizó fidelidad al diseño)
- [x] Dropdown de frecuencia (Diario/Semanal/Quincenal/Mensual) abre/cierra, opciones seleccionables
- [x] Loader + botón deshabilitado al crear (setTimeout de 900ms simulando request)
- [x] Toast "Se creó un nuevo proceso" tras cerrar el modal
- [x] Proceso nuevo aparece con estatus "Programado" y UUID generado (verificado: ID
      `2814d762-...` con status `Programado`)
- ⚠️ **Nota de UX no resuelta**: el bloque de estructura de nombres (`font-code`, texto
  monoespaciado) se corta/overflow ligeramente en el ancho del modal en la primera línea larga.
  Es cosmético, no bloquea funcionalidad. Candidato a ajuste fino (`text-wrap` o reducir
  `tracking`) en una próxima sesión.

### 3. Detalle de proceso (`DetailPage.tsx`) — ✅ Verificado en navegador
- [x] Header: nombre, chip de ID, "Solicitado por X · Se ejecuta [frecuencia] a las [hora]"
- [x] Banner de última ejecución con variante de color/copy según `process.status`
      (success/danger/warning/primary/neutral/info — ver `BANNER_VARIANTS` en `DetailPage.tsx`).
      Nota: esto es una decisión de diseño interna, no 1:1 con Figma — ver progress abajo.
- [x] 4 KPI cards (Contratos, Documentos, Errores, Duplicados)
- [x] Panel Pipeline de Ejecución con copy anonimizado (ver Project.md)
- [x] Panel Histórico de Ejecuciones con scroll vertical (`max-h-[432px] overflow-y-auto`),
      20 filas semilla + filas nuevas de reproceso se insertan arriba
- [x] Botón Reproceso: loader (~1.4s) → actualiza banner, KPI cards y pipeline (ver
      `kpisAfterReprocess` / `pipelineVariantForStatus` en `src/lib/seed.ts`), agrega fila al histórico
- [x] **Máquina de estados de reproceso verificada end-to-end en navegador**: 3 clics
      consecutivos sobre "Carga masiva DocuSign" pasaron por Con errores → Parcial → Completado,
      con las 3 filas nuevas en el histórico en el orden correcto
- [x] Switch de carga automática abre el modal de confirmación
- [x] Cancelar el modal revierte el switch (probado: click en Cancelar, switch se mantiene
      "Encendida", sin cambios de estado)
- ⚠️ **No verificado end-to-end en navegador**: el flujo de **confirmar "Apagar carga"** hasta
  ver el estatus "Desactivado" reflejado en la tabla del concentrador. La lógica en
  `useProcessStore.toggleAutoLoad` se revisó por código y parece correcta, pero solo se probó
  interactivamente el camino de Cancelar. **Siguiente paso recomendado**: abrir el switch,
  confirmar "Apagar carga", volver al concentrador y confirmar visualmente el badge
  "Desactivado" + que los conteos se actualicen.
- [x] **KPIs y pipeline se recalculan en cada reproceso** (corregido en esta sesión, después de
  la primera pasada). `reprocess()` en `useProcessStore.ts` llama a `kpisAfterReprocess(prev,
  newStatus)` y `buildPipeline(pipelineVariantForStatus(newStatus), newKpis.errores)`
  (`src/lib/seed.ts`). Contratos/documentos crecen con cada corrida (número aleatorio acotado),
  errores se recalcula según el nuevo status (0 si Completado, bajo si Parcial, alto si Con
  errores) y el paso "Carga al gestor documental" del pipeline muestra el mismo número de
  "documentos fallaron" que el KPI de Errores, para que ambos paneles cuenten la misma historia.
  Verificado en navegador: reprocesar "Proceso de carga A" subió Contratos 1726→1758, Documentos
  6388→6468, cambió Errores 4→15 y el pipeline pasó a mostrar "15 documentos fallaron" en el
  paso con badge ERROR — coherente entre sí.

### 4. Modal confirmación apagado/encendido (`ToggleAutoLoadModal.tsx`) — ✅ Verificado en navegador (variante apagar)
- [x] Copy distinto según encender/apagar (ver decisión documentada en Project.md para "encender")
- [x] Cancelar cierra sin cambios
- ⚠️ Confirmar "Apagar carga" no se verificó visualmente hasta el final (ver nota arriba)
- ⚠️ La variante "Encender" (con el proceso ya apagado) nunca se disparó en las pruebas de esta
  sesión — no hay un proceso semilla con `autoLoadEnabled: false` de origen, solo se llega ahí
  apagando uno manualmente primero.

### 5. Modal selección de rango de fechas (`ExportDateRangeModal.tsx` + `DateRangeCalendar.tsx`) — ✅ Verificado a fondo en navegador
- [x] Selección de franja continua (no días sueltos), mecánica de mitades izquierda/derecha por
      celda **verificada con zoom de pantalla**: sin huecos visibles entre 20-26 y 27-31 de julio
- [x] Franja cruza de julio a agosto sin romperse (verificado visualmente)
- [x] Radios de 15px solo en el primer/último día pintado de cada renglón (incluye el caso de
      un solo día pintado en un renglón, que recibe redondeo en ambos lados)
- [x] 1er clic fija inicio, 2do fija fin (con inversión si el 2do es anterior), 3er clic reinicia
- [x] Texto de rango en español largo, actualizado en vivo ("20 de julio de 2026 al 05 de agosto
      de 2026")
- [x] Botón Exportar deshabilitado hasta rango completo, luego habilitado
- [x] Exportar cierra el modal y dispara el toast "Se descargó el archivo con los resultados
      exportados"
- [x] Indicador de "hoy" (anillo) en el día actual
- ⚠️ **No verificado interactivamente**: navegación de mes (flechas prev/next) y selector de año
  (`<select>` nativo por año). El código existe y compila, pero no se hizo click real sobre las
  flechas ni sobre el dropdown de año durante las pruebas de esta sesión.

## Transversales — estado

- [x] Estado compartido entre concentrador y detalle (Zustand, un solo store)
- [x] Toasts apilables, auto-dismiss 4s, cierre manual (verificado visualmente)
- [x] **Toast rediseñado al tema Dark del design system** (2026-07-20, ver decisión en
      `Project.md`): fondo `neutral-900/90` semitransparente, texto blanco, ícono a color por
      tipo (`success`/`error`/`warning`/`info`), barra de progreso de 4px que crece de izquierda
      a derecha durante los 4s visibles y dispara el fade-out (~200ms) al llegar al borde
      derecho; fade-in también de ~200ms. Posición: centrado horizontal, 260px del top. Se
      agregaron los tokens `success-500`, `danger-600`, `warning-600` a `tailwind.config.js`.
      Verificado en navegador real: se disparó el toast de "Carga automática apagada/encendida"
      desde `DetailPage`, confirmando fondo oscuro semitransparente (se alcanza a ver el KPI
      card detrás), ícono verde, barra creciendo y disolvencia de entrada/salida. Solo se probó
      el tipo `success` (los 3 call sites actuales — crear proceso, exportar,
      encender/apagar auto-carga — usan ese tipo por default); los tipos `error`/`warning`/
      `info` quedan implementados pero sin un flujo real en la app que los dispare todavía.
- [x] **Fondo de la página de detalle corregido a `#f8fbfe`** (2026-07-20, ver `Project.md`):
      confirmado contra el Figma (nodo `990:21756`) con `get_variable_defs` — el token ya
      existía en Tailwind como `neutral-50`. Se aplicó en un wrapper `min-h-screen w-full` para
      que cubra todo el viewport, no solo la columna centrada. Verificado en navegador: el
      concentrador sigue en blanco (no se tocó) y el detalle ahora muestra el fondo gris-azulado
      con las tarjetas blancas encima.
- [x] **Colores de íconos corregidos** (2026-07-20, ver decisión en `Project.md`): las 5 KPI
      cards del concentrador ahora pintan cada ícono con el color semántico del Figma
      (`info-600`/`success-600`/`danger-700`/`primary-700`/`warning-700`) en vez del gris oscuro
      heredado por default. Se corrigió el token compartido `success.600` (`#47b881` → `#009942`,
      valor real de Figma), lo que también ajustó el tono del borde en el banner de
      `DetailPage.tsx`. El ícono del modal "Exportar resultados" pasó de `neutral-900` a
      `info-600` (índigo), fiel al Figma aunque no sea el hex exacto (`#7876ff`, inconsistente
      entre archivos de Figma — se usó el token existente por decisión del usuario). Verificado
      visualmente en navegador real en ambas pantallas.
- [x] **Desplazamiento vertical de 24px agregado al toast** (2026-07-20): entra con
      `translateY(-24px)→0` (arriba hacia abajo) + fade-in, sale con `translateY(0)→-24px`
      (abajo hacia arriba, mismo recorrido en reversa) + fade-out, ambos en 200ms. Verificado con
      un script inyectado en la página real (`getComputedStyle` del toast) que confirmó
      `transform: matrix(1,0,0,1,0,-24)` y `opacity: 0` tanto en el instante de aparición como
      en el de cierre, y visualmente que el estado en reposo (posición 260px del top, fondo,
      barra de progreso) no se vio afectado.
- [x] Escape cierra modales (verificado)
- [x] Click fuera del modal cierra (implementado en `ModalShell.tsx`, **no probado
      interactivamente** en esta sesión — Escape sí se probó)
- [x] Foco visible, labels asociados, `disabled` real
- [x] Git: 8 commits atómicos, repo remoto creado y pusheado a
      `https://github.com/Vinkubus/gestor-carga-automatica-prototipo`

## Deuda técnica / próximos pasos sugeridos (en orden de prioridad)

1. Verificar en navegador real el flujo completo de apagar → Desactivado en concentrador, y la
   variante "Encender" del modal de confirmación.
2. Probar navegación de mes/año del date picker con clicks reales (flechas y `<select>` de año).
3. Ajustar el overflow cosmético del bloque de estructura de nombres en el modal de nuevo proceso.
4. Revisar el input `type="time"` del modal de nuevo proceso: funciona con el widget nativo del
   navegador, pero UX-wise podría valer la pena un componente custom más cercano al ícono
   `ri-timer-2-line` que muestra el Figma en vez del control nativo del SO.
5. No hay pruebas automatizadas (unit/e2e). Todo lo "verificado" en este documento fue manual
   vía Chrome DevTools Protocol en una sola sesión. Si el proyecto va a crecer, vale la pena
   agregar al menos unit tests para `useProcessStore` (la máquina de estados de reproceso y las
   reglas de conteo son las partes más fáciles de romper sin darse cuenta).
6. El prototipo no tiene manejo de errores de red/backend porque no existe backend — si en algún
   momento se conecta a una API real, todo `store/` necesita revisarse desde cero (hoy asume que
   las acciones siempre "funcionan" de forma síncrona/optimista).
7. `kpisAfterReprocess` usa `Math.random()` acotado para simular actividad nueva en cada
   reproceso — es intencional para un prototipo (cada reproceso se ve distinto), pero si se
   necesita reproducibilidad (tests, demos guionadas) habría que cambiarlo a una función
   determinista basada en `reprocessCount`.

## Preguntas abiertas para el usuario (si retoma el proyecto)

- ¿El copy simétrico del modal "encender carga" (`ToggleAutoLoadModal.tsx`) es aceptable como
  definitivo, o hay copy real del equipo de diseño/producto que deba reemplazarlo?
- ¿Hay una paleta de "Desactivado"/"Programado" oficial en el design system, o los tokens neutral/
  info elegidos en esta sesión (sin referencia directa en el Figma) son aceptables?
