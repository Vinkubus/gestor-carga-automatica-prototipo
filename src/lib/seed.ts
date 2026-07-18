import { v4 as uuid } from 'uuid';
import type {
  ExecutionHistoryRow,
  ExecutionStatus,
  PipelineStep,
  Process,
  ProcessKpis,
} from '../types/process';

function buildPipeline(variant: 'ok' | 'parcial' | 'error'): PipelineStep[] {
  const base: PipelineStep[] = [
    { id: uuid(), title: 'Lectura del repositorio documental', subtitle: 'Conectado exitosamente', status: 'OK' },
    { id: uuid(), title: 'Clasificación taxonómica', subtitle: 'Documentos clasificados', status: 'OK' },
    { id: uuid(), title: 'Validación de duplicidad', subtitle: 'Sin conflictos detectados', status: 'OK' },
    { id: uuid(), title: 'Carga al gestor documental', subtitle: '7 documentos fallaron', status: 'PARCIAL' },
    { id: uuid(), title: 'Persistencia de bitácora', subtitle: 'Registro completado', status: 'OK' },
  ];
  if (variant === 'ok') {
    base[3] = { ...base[3], subtitle: 'Carga completada sin incidentes', status: 'OK' };
  } else if (variant === 'error') {
    base[3] = { ...base[3], subtitle: '23 documentos fallaron', status: 'ERROR' };
    base[4] = { ...base[4], subtitle: 'Registro completado con advertencias', status: 'PARCIAL' };
  }
  return base;
}

function buildHistory(seedIndex: number, count = 20): ExecutionHistoryRow[] {
  const statuses: ExecutionStatus[] = ['Completado', 'Completado', 'Completado', 'Con errores', 'Parcial', 'Completado'];
  const rows: ExecutionHistoryRow[] = [];
  const base = new Date(2026, 6, 16, 2, 0, 0); // 16/07/2026 02:00
  for (let i = 0; i < count; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    const status = statuses[(i + seedIndex) % statuses.length];
    rows.push({
      id: uuid(),
      date,
      type: 'Automática',
      status,
    });
  }
  return rows;
}

function buildKpis(seedIndex: number): ProcessKpis {
  const multiplier = 1 + seedIndex * 0.35;
  return {
    contratos: Math.round(842 * multiplier),
    contratosDelta: Math.round(12 * multiplier),
    documentos: Math.round(3116 * multiplier),
    documentosDelta: Math.round(48 * multiplier),
    errores: Math.max(0, Math.round(7 - seedIndex)),
    erroresDelta: 4,
    duplicados: Math.round(24 * multiplier),
  };
}

interface SeedDefinition {
  id?: string;
  name: string;
  sourcePath: string;
  executionTime: string;
  frequency: Process['frequency'];
  status: Process['status'];
  requestedBy: string;
  pipelineVariant: 'ok' | 'parcial' | 'error';
}

const SEED_DEFINITIONS: SeedDefinition[] = [
  {
    id: 'a2f9414b-3014-4894-96c6-7d8e9f0a1b2c',
    name: 'Carga masiva DocuSign',
    sourcePath: '//servidor/compartido/cargas/docusign',
    executionTime: '02:00 AM',
    frequency: 'Diario',
    status: 'Parcial',
    requestedBy: 'Juan Pérez',
    pipelineVariant: 'parcial',
  },
  {
    id: '7ce03b8a-5d21-4a12-90ef-4a2b1c9d3e7f',
    name: 'Migración histórica de contratos',
    sourcePath: '//servidor/compartido/cargas/migracion',
    executionTime: '01:30 AM',
    frequency: 'Semanal',
    status: 'Completado',
    requestedBy: 'María Torres',
    pipelineVariant: 'ok',
  },
  {
    id: 'b19f2d6e-88ab-4e7d-a304-1f5c8a2b9e6d',
    name: 'Carga masiva Fiduciario',
    sourcePath: '//servidor/compartido/cargas/fiduciario',
    executionTime: '03:45 AM',
    frequency: 'Diario',
    status: 'En proceso',
    requestedBy: 'Luis Ramírez',
    pipelineVariant: 'ok',
  },
  {
    id: 'd4e5729c-6f83-4b1a-9d2e-3f7a8c5b0d9e',
    name: 'Proceso de carga A',
    sourcePath: '//servidor/compartido/cargas/proceso-a',
    executionTime: '04:20 AM',
    frequency: 'Mensual',
    status: 'Con errores',
    requestedBy: 'Ana Gómez',
    pipelineVariant: 'error',
  },
  {
    id: 'e7a9b3d1-2c4f-4e6a-8b0d-5f1c7e9a3b2d',
    name: 'Proceso de carga B',
    sourcePath: '//servidor/compartido/cargas/proceso-b',
    executionTime: '05:10 AM',
    frequency: 'Quincenal',
    status: 'Con errores',
    requestedBy: 'Carlos Medina',
    pipelineVariant: 'error',
  },
  {
    id: 'f3c1a7e8-9b2d-4f6c-8a0e-7d5b9f1c3a4e',
    name: 'Proceso de carga C',
    sourcePath: '//servidor/compartido/cargas/proceso-c',
    executionTime: '06:55 AM',
    frequency: 'Diario',
    status: 'Completado',
    requestedBy: 'Sofía Reyes',
    pipelineVariant: 'ok',
  },
];

export function buildSeedProcesses(): Process[] {
  return SEED_DEFINITIONS.map((def, index) => ({
    id: def.id ?? uuid(),
    name: def.name,
    sourcePath: def.sourcePath,
    executionTime: def.executionTime,
    frequency: def.frequency,
    status: def.status,
    requestedBy: def.requestedBy,
    autoLoadEnabled: def.status !== 'Desactivado',
    reprocessCount: 0,
    createdInSession: false,
    lastExecution: {
      startTime: def.executionTime,
      endTime: def.executionTime,
      durationMin: 47,
      success: def.status === 'Completado',
    },
    kpis: buildKpis(index),
    pipeline: buildPipeline(def.pipelineVariant),
    history: buildHistory(index),
  }));
}
