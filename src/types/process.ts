export type ProcessStatus =
  | 'Completado'
  | 'Con errores'
  | 'Parcial'
  | 'En proceso'
  | 'Desactivado'
  | 'Programado';

export type Frequency = 'Diario' | 'Semanal' | 'Quincenal' | 'Mensual';

export type ExecutionType = 'Automática' | 'Reproceso';

export type ExecutionStatus = 'Completado' | 'Con errores' | 'Parcial';

export interface ExecutionHistoryRow {
  id: string;
  date: Date;
  type: ExecutionType;
  status: ExecutionStatus;
}

export type PipelineStepStatus = 'OK' | 'PARCIAL' | 'ERROR';

export interface PipelineStep {
  id: string;
  title: string;
  subtitle: string;
  status: PipelineStepStatus;
}

export interface ProcessKpis {
  contratos: number;
  contratosDelta: number;
  documentos: number;
  documentosDelta: number;
  errores: number;
  erroresDelta: number;
  duplicados: number;
}

export interface Process {
  id: string;
  name: string;
  sourcePath: string;
  executionTime: string; // e.g. "02:00 AM"
  frequency: Frequency;
  status: ProcessStatus;
  requestedBy: string;
  autoLoadEnabled: boolean;
  reprocessCount: number;
  createdInSession: boolean;
  lastExecution: {
    startTime: string;
    endTime: string;
    durationMin: number;
    success: boolean;
  };
  kpis: ProcessKpis;
  pipeline: PipelineStep[];
  history: ExecutionHistoryRow[];
}
