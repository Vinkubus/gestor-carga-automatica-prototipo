import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { buildSeedProcesses } from '../lib/seed';
import type { ExecutionHistoryRow, Frequency, Process, ProcessStatus } from '../types/process';

interface NewProcessInput {
  name: string;
  sourcePath: string;
  executionTime: string;
  frequency: Frequency;
}

interface ProcessStoreState {
  processes: Process[];
  addProcess: (input: NewProcessInput) => Process;
  toggleAutoLoad: (id: string, enabled: boolean) => void;
  reprocess: (id: string) => void;
  setExecuting: (id: string, executing: boolean) => void;
  getById: (id: string) => Process | undefined;
}

function nextReprocessStatus(count: number): ProcessStatus {
  if (count <= 1) return 'Con errores';
  if (count === 2) return 'Parcial';
  return 'Completado';
}

export const useProcessStore = create<ProcessStoreState>((set, get) => ({
  processes: buildSeedProcesses(),

  addProcess: (input) => {
    const newProcess: Process = {
      id: uuid(),
      name: input.name,
      sourcePath: input.sourcePath,
      executionTime: input.executionTime,
      frequency: input.frequency,
      status: 'Programado',
      requestedBy: 'Tú',
      autoLoadEnabled: true,
      reprocessCount: 0,
      createdInSession: true,
      lastExecution: {
        startTime: input.executionTime,
        endTime: input.executionTime,
        durationMin: 0,
        success: false,
      },
      kpis: {
        contratos: 0,
        contratosDelta: 0,
        documentos: 0,
        documentosDelta: 0,
        errores: 0,
        erroresDelta: 0,
        duplicados: 0,
      },
      pipeline: [
        { id: uuid(), title: 'Lectura del repositorio documental', subtitle: 'Pendiente de primera ejecución', status: 'OK' },
        { id: uuid(), title: 'Clasificación taxonómica', subtitle: 'Pendiente de primera ejecución', status: 'OK' },
        { id: uuid(), title: 'Validación de duplicidad', subtitle: 'Pendiente de primera ejecución', status: 'OK' },
        { id: uuid(), title: 'Carga al gestor documental', subtitle: 'Pendiente de primera ejecución', status: 'OK' },
        { id: uuid(), title: 'Persistencia de bitácora', subtitle: 'Pendiente de primera ejecución', status: 'OK' },
      ],
      history: [],
    };
    set((state) => ({ processes: [newProcess, ...state.processes] }));
    return newProcess;
  },

  toggleAutoLoad: (id, enabled) => {
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === id
          ? {
              ...p,
              autoLoadEnabled: enabled,
              status: enabled ? (p.status === 'Desactivado' ? 'Completado' : p.status) : 'Desactivado',
            }
          : p,
      ),
    }));
  },

  setExecuting: (id, executing) => {
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === id ? { ...p, status: executing ? 'En proceso' : p.status } : p,
      ),
    }));
  },

  reprocess: (id) => {
    const process = get().processes.find((p) => p.id === id);
    if (!process) return;
    const newCount = process.reprocessCount + 1;
    const newStatus = nextReprocessStatus(newCount);
    const now = new Date();
    const historyRow: ExecutionHistoryRow = {
      id: uuid(),
      date: now,
      type: 'Reproceso',
      status: newStatus === 'Completado' || newStatus === 'Con errores' || newStatus === 'Parcial' ? newStatus : 'Completado',
    };
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === id
          ? {
              ...p,
              reprocessCount: newCount,
              status: newStatus,
              createdInSession: false,
              lastExecution: {
                startTime: p.executionTime,
                endTime: p.executionTime,
                durationMin: Math.max(5, Math.round(Math.random() * 60)),
                success: newStatus === 'Completado',
              },
              history: [historyRow, ...p.history],
            }
          : p,
      ),
    }));
  },

  getById: (id) => get().processes.find((p) => p.id === id),
}));
