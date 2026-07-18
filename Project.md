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
