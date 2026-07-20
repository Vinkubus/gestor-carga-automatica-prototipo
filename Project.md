# Gestor de Carga Automática — Prototipo

Prototipo interactivo (sin backend, todo el estado en memoria) de una herramienta bancaria
para administrar procesos de carga automatizada de documentos. Construido para revisión con
cliente a partir de un diseño en Figma que debía replicarse con fidelidad exacta (colores,
tipografía, espaciados, radios, sombras, iconografía).

Repositorio: https://github.com/Vinkubus/gestor-carga-automatica-prototipo (rama `main`)

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS **v3** (no v4 — se bajó de versión a propósito para poder usar
  `tailwind.config.js` clásico con tokens nombrados; ver "Decisión: tokens" abajo)
- `react-router-dom` con `HashRouter` (rutas: `/` y `/procesos/:id`)
- Zustand para estado en memoria (sin persistencia, se resetea al recargar)
- `remixicon` (paquete npm) para iconografía — el Figma usa Remix Icons, así que los nombres
  de clase (`ri-*`) deben mapear 1:1 a los iconos que aparecen en el diseño
- `uuid` para generar IDs de proceso

## Cómo correr el proyecto

```
npm install
npm run dev      # http://localhost:5173/
npm run build    # typecheck (tsc -b) + build de producción
```

No hay variables de entorno ni backend. Todo el dato vive en `useProcessStore` (Zustand) y se
reinicia a la semilla original (`src/lib/seed.ts`) en cada reload de página.

## Fuente de diseño (Figma)

- **File key**: `kFWXg9eK53JnyrjCI2RCf0`
- Nodos leídos con el MCP de Figma (`get_design_context` / `get_variable_defs` / `get_metadata`):

| Pantalla | Nodo Figma | Componente en código |
|---|---|---|
| 1. Concentrador de procesos (inicio) | `990:20346` | `src/pages/ConcentradorPage.tsx` |
| 2. Modal nuevo proceso | `990:20663` | `src/components/modals/NewProcessModal.tsx` |
| 3. Detalle de proceso | `990:21756` | `src/pages/DetailPage.tsx` |
| 4. Modal confirmación apagado/encendido | `991:22220` | `src/components/modals/ToggleAutoLoadModal.tsx` |
| 5. Modal selección de rango de fechas | `991:26599` | `src/components/modals/ExportDateRangeModal.tsx` + `DateRangeCalendar.tsx` |
| 6. Toast (tema Dark, variantes Success/Error/Warning/Info) | Archivo DS Components (`qeuLcrMUFyrsmDDwxNRKRN`), nodo `71:187` | `src/components/ui/ToastViewport.tsx` |

Si se necesita volver a leer el Figma (para agregar una pantalla nueva, corregir un detalle
visual, etc.), usar el MCP de Figma (`mcp__plugin_figma_figma__get_design_context`) con ese
`fileKey` y el `nodeId` correspondiente. El archivo tiene componentes muy anidados; cuando la
respuesta se trunca por tamaño, es mejor pedir `get_metadata` primero para ubicar el nodo hijo
específico y luego `get_design_context` solo sobre ese subnodo.

## Estructura de carpetas

```
src/
  App.tsx                    HashRouter + rutas + ToastViewport
  main.tsx / index.css       entry point, fuentes (Google Fonts) + remixicon + Tailwind
  types/process.ts           tipos de dominio (Process, ProcessStatus, ExecutionHistoryRow...)
  lib/
    dates.ts                 formateo de fechas en español (largo/corto), utilidades de calendario
    seed.ts                  6 procesos semilla + generador de pipeline/historial/KPIs
  store/
    useProcessStore.ts       estado de procesos: addProcess, toggleAutoLoad, reprocess, setExecuting
    useToastStore.ts         toasts apilables con auto-dismiss (4s)
  components/
    ui/                      StatusBadge, Chip, KpiCardOverview, KpiCardDetail, ModalShell, ToastViewport
    modals/                  NewProcessModal, ToggleAutoLoadModal, ExportDateRangeModal, DateRangeCalendar
  pages/
    ConcentradorPage.tsx     pantalla 1
    DetailPage.tsx           pantalla 3 (incluye banner, KPIs, pipeline, histórico)
```

## Modelo de datos (`src/types/process.ts`)

```ts
ProcessStatus = 'Completado' | 'Con errores' | 'Parcial' | 'En proceso' | 'Desactivado' | 'Programado'
Frequency     = 'Diario' | 'Semanal' | 'Quincenal' | 'Mensual'
ExecutionType = 'Automática' | 'Reproceso'
```

`Process` incluye: id (uuid), name, sourcePath, executionTime, frequency, status, requestedBy,
autoLoadEnabled, reprocessCount, createdInSession, lastExecution, kpis, pipeline (5 pasos),
history (array de `ExecutionHistoryRow`).

## Reglas de negocio duras (no romper al modificar)

1. **Los conteos nunca se hardcodean.** KPI cards del concentrador, chips de filtro y pie de
   tabla ("Mostrando registros del X al Y, de un total de Z") se derivan siempre del mismo
   array `processes` del store. Si se agrega un estatus nuevo o se cambia la semilla, todo debe
   seguir cuadrando automáticamente.
2. **`Programado` es exclusivo de procesos creados en la sesión** que aún no han ejecutado (flag
   `createdInSession`). Ningún proceso semilla lo tiene, y en cuanto corre por primera vez
   (`reprocess()`) deja de mostrarlo para siempre.
3. **Máquina de estados de reproceso, contador por proceso** (`reprocessCount`, no global):
   1er reproceso → `Con errores`, 2do → `Parcial`, 3ro → `Completado`, 4to en adelante se
   mantiene en `Completado`. Cada reproceso agrega una fila nueva al historial con
   `type: 'Reproceso'` (las 20 filas semilla son todas `'Automática'`).
4. **Apagar la carga automática** (`toggleAutoLoad(id, false)`) pone `status: 'Desactivado'` en
   el concentrador. Encenderla de vuelta restaura `'Completado'` si venía de `'Desactivado'`
   (no intenta recordar el estatus anterior real, ver TODO en progress.md).
5. **Copy**: nunca mencionar DocuSign, SharePoint u OpenText en texto fijo de la interfaz. Solo
   como dato de ejemplo dentro de un nombre de proceso (p. ej. "Carga masiva DocuSign" en la
   tabla semilla). Ver "Decisión: copy del pipeline" abajo — esto ya causó un conflicto real con
   el Figma una vez, cuidado si se vuelve a traer contenido nuevo del diseño.

## Decisiones tomadas (con aprobación del usuario) que un modelo nuevo no debería revertir sin preguntar

- **Copy del pipeline anonimizado**: el Figma trae literalmente "Lectura SharePoint" y "Carga
  OpenText (OTCS)" como nombres de paso del pipeline (nodo `990:21796`). Eso viola la regla de
  copy de arriba, así que se renombraron a "Lectura del repositorio documental" y "Carga al
  gestor documental" (`src/lib/seed.ts`, función `buildPipeline`). El resto del pipeline
  (colores, badges, estructura, textos de "Clasificación taxonómica", "Validación de
  duplicidad", "Persistencia de bitácora") es fiel al Figma.
- **Copy del modal "encender carga"**: el Figma (nodo `991:22220`) solo tiene la variante de
  APAGAR ("¿Apagar la carga automática?"). No existe una variante de "encender" en el archivo.
  Se usó copy simétrico: "¿Encender la carga automática?" / "El sistema reanudará el
  procesamiento automático de documentos según la frecuencia configurada." Mismo layout/colores
  que la variante de apagar. Si el diseñador entrega el copy real más adelante, reemplazar en
  `ToggleAutoLoadModal.tsx`.
- **Animación de entrada en los modales (2026-07-20)**: `ModalShell.tsx` (usado por los 3
  modales — nuevo proceso, apagar/encender carga, exportar) ahora hace fade-in del fondo oscuro
  y fade-in + desplazamiento sutil (`translateY(12px)→0`) del panel al aparecer, con
  `ease-in-out` (curva bezier) en 300ms. Solo animación de entrada, no se pidió salida.
- **Fondo de la página de detalle (2026-07-20)**: `DetailPage.tsx` no tenía fondo propio y
  heredaba el blanco del `body`. Se confirmó con `get_variable_defs` sobre el nodo Figma
  `990:21756` que la página usa `neutral/50 (#f8fbfe)` de fondo (token que ya existía en
  `tailwind.config.js`). Se envolvió el contenido (ambos `return`, incluido el caso
  "proceso no encontrado") en un `<div className="min-h-screen w-full bg-neutral-50">` para que
  el color cubra todo el viewport de borde a borde, no solo la columna centrada de `max-w-[1500px]`.
  Las tarjetas internas (banner, pipeline, histórico) ya tenían `bg-neutral-0` explícito, así que
  siguen viéndose blancas sobre el nuevo fondo gris-azulado, igual que en el Figma. Cambio
  aplicado solo a `DetailPage`; el concentrador (`ConcentradorPage.tsx`) sigue con fondo blanco
  porque no se pidió tocarlo.
- **Corrección de colores de íconos (2026-07-20)**: los 5 íconos de las KPI cards del
  concentrador (`ConcentradorPage.tsx` → `KpiCardOverview.tsx`) no tenían clase de color y
  heredaban el gris oscuro global (`neutral-900` del `body`), en vez del color semántico por
  tipo que muestra el Figma del concentrador (nodo `990:20387`, archivo
  `kFWXg9eK53JnyrjCI2RCf0`). Se agregó la prop `iconColor` a `KpiCardOverview` y se fijó, por
  tarjeta: Configurados `text-info-600`, Completados `text-success-600`, Con error
  `text-danger-700`, En proceso `text-primary-700`, Parcial `text-warning-700` (verificados con
  `get_variable_defs` sobre ese nodo). De paso se corrigió el token **`success.600`** en
  `tailwind.config.js`, que tenía un valor equivocado (`#47b881`) de una sesión anterior; el
  valor real de Figma es `#009942` (confirmado en dos archivos distintos: este nodo y el toast).
  Esto también cambió el tono del borde `border-success-600` en el banner de `DetailPage.tsx`
  (más verde/saturado que antes) — cambio aceptado explícitamente por el usuario.
  También se corrigió el ícono del modal "Exportar resultados" (`ExportDateRangeModal.tsx`):
  estaba en `text-neutral-900` y el Figma (nodo `991:27817`/`991:27818`, mismo archivo) lo pinta
  de índigo. Se leyó el SVG exportado directamente y su hex exacto es `#7876ff`, que no coincide
  con ningún token `info` existente (el archivo "DS Components" define `info/700` como
  `#514ee0`, una inconsistencia entre archivos de Figma). Por decisión del usuario se reusó el
  token ya existente **`info-600` (`#6465ff`)** en vez de crear un token nuevo solo para ese hex.
- **Rediseño del Toast (tema Dark del design system)**: el toast original era una tarjeta clara
  fija en la esquina inferior derecha, sin variantes por tipo. Se reemplazó por el componente
  `Toast` del archivo Figma "DS Components" (nodo `71:187`), solo en su variante **Dark**: fondo
  `neutral/900` con `opacity-90` (semitransparente), texto blanco, ícono a color según el tipo de
  feedback. Se agregó `type: 'success'|'error'|'warning'|'info'` a `ToastItem`
  (`useToastStore.ts`, default `'success'` para no romper los 3 call sites existentes, que siguen
  siendo mensajes de confirmación). Cada toast tiene una barra de 4px bajo el contenido que crece
  de izquierda a derecha durante los 4s que el toast está visible; al llegar al borde derecho el
  toast se disuelve (fade-out ~200ms) y se remueve del store. También hay fade-in (~200ms) al
  aparecer. El toast ahora se posiciona centrado horizontalmente, a 260px del top (antes:
  esquina inferior derecha). El auto-dismiss por `setTimeout` en el store se eliminó: ahora el
  ciclo de vida completo (entrada, barra de progreso, salida) lo controla `ToastViewport.tsx` vía
  eventos `transitionend`, y `dismissToast(id)` solo remueve del arreglo cuando la animación de
  salida termina (tanto en el auto-dismiss como en el cierre manual con el botón X).
  **Actualización 2026-07-20**: se agregó un desplazamiento vertical sutil de 24px sincronizado
  con la disolvencia (no estaba en el nodo Figma original, pedido explícito del usuario): al
  aparecer el toast entra con `translateY(-24px)` → `translateY(0)` (de arriba hacia abajo) a la
  vez que hace fade-in; al cerrarse hace el recorrido inverso, `translateY(0)` → `translateY(-24px)`
  (de abajo hacia arriba) a la vez que hace fade-out. Ambas transiciones (`opacity` y `transform`)
  comparten los mismos 200ms/`ease-out` en `ToastViewport.tsx`.
  Colores agregados a `tailwind.config.js` (tomados de las variables del nodo Figma, no existían
  antes): `success.500 #00b652`, `danger.600 #e32f2c`, `warning.600 #dea600` (el de `info.600
  #6465ff` ya existía). **Supuesto sin confirmar pixel a pixel**: el ícono usa el mismo color que
  su línea de progreso — Figma exporta el ícono como imagen y no pudimos leer su hex exacto, así
  que se asumió el patrón típico de "un color de marca por tipo de feedback". Si al revisar en
  Figma el ícono tiene un tono distinto a la línea, avisar para ajustar el token.
- **Tokens de Tailwind vs. Figma**: el código exportado por el MCP de Figma usa clases como
  `bg-[var(--primary\/700,#2a7de1)]` (variables CSS con `/` en el nombre). Se decidió **no**
  usar ese patrón y en su lugar declarar los tokens con nombres normales en
  `tailwind.config.js` (`primary.700`, `neutral.300`, etc.) y usar utilidades estándar
  (`bg-primary-700`). Los valores hex son los mismos que trae el Figma, solo cambia la sintaxis.
- **Dos inconsistencias dentro del propio Figma, resueltas así**:
  - El nodo del modal "Nuevo proceso" (`990:20663`) trae de fondo una réplica del concentrador
    con conteos/estilo de badge "En proceso" distintos a los del concentrador real
    (`990:20346`). Se usa `990:20346` como fuente de verdad para tabla/KPIs del concentrador.
  - La fila 1 de la tabla semilla decía "Carga parcial" en el badge pero el chip/KPI decía
    "Parcial" para el mismo estatus. Se unificó a **"Parcial"** en toda la app.

## Semilla de datos (`src/lib/seed.ts`)

6 procesos fijos con IDs UUID reales extraídos del propio Figma donde existían (para que el
detalle de "Carga masiva DocuSign", el único con diseño de detalle completo en Figma, siga
coincidiendo con el ID `a2f9414b-3014-4894-96c6-7d8e9f0a1b2c` que aparece en los nodos
`990:21756`, `991:22220` y `991:26599`). Los otros 5 procesos tienen datos de detalle
(KPIs/pipeline/historial) generados por fórmula a partir de esos mismos valores base, ya que
el Figma no incluye su detalle específico.

## Accesibilidad implementada

- Foco visible global (`outline` en `:focus-visible`, `src/index.css`)
- Labels asociados a inputs (`htmlFor` / `sr-only` donde el label visual no aplica por diseño)
- `disabled` real (no solo visual) en paginación y botones durante loaders
- Escape cierra todos los modales (`ModalShell.tsx`), click fuera del modal también
- Toasts con `role="status"` / `aria-live="polite"`
