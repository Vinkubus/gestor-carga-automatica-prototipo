import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCardOverview } from '../components/ui/KpiCardOverview';
import { Chip } from '../components/ui/Chip';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useProcessStore } from '../store/useProcessStore';
import type { ProcessStatus } from '../types/process';
import { NewProcessModal } from '../components/modals/NewProcessModal';

type FilterKey = 'Todos' | 'Completado' | 'Con errores' | 'Parcial' | 'En proceso';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export function ConcentradorPage() {
  const processes = useProcessStore((s) => s.processes);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('Todos');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [isNewProcessOpen, setNewProcessOpen] = useState(false);

  const counts = useMemo(() => {
    const base: Record<ProcessStatus, number> = {
      Completado: 0,
      'Con errores': 0,
      Parcial: 0,
      'En proceso': 0,
      Desactivado: 0,
      Programado: 0,
    };
    for (const p of processes) base[p.status]++;
    return base;
  }, [processes]);

  const filtered = useMemo(() => {
    let list = processes;
    if (filter !== 'Todos') {
      list = list.filter((p) => p.status === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
    }
    return list;
  }, [processes, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);
  const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, filtered.length);

  function handleFilterChange(next: FilterKey) {
    setFilter(next);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1580px] flex-col items-center px-6 py-12 md:px-10 md:py-16">
      <div className="flex w-full max-w-[1500px] flex-col items-start">
        {/* Header */}
        <div className="flex w-full flex-col items-start gap-8 pb-8">
          <div className="flex w-full flex-wrap items-center gap-8">
            <div className="flex min-w-[260px] flex-1 flex-col items-start gap-0.5">
              <p className="text-[11px] font-semibold tracking-[1.1px] text-primary-700 uppercase">
                Concentrador
              </p>
              <h1 className="text-2xl font-semibold text-neutral-900">Gestor de Carga Automática</h1>
              <p className="text-base text-neutral-700">
                Consulta y administra los procesos de carga automática
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewProcessOpen(true)}
              className="shrink-0 rounded-3xl bg-primary-700 px-6 py-3 text-base font-semibold text-primary-100 hover:brightness-95"
            >
              + Nuevo proceso
            </button>
          </div>

          {/* KPI cards */}
          <div className="flex w-full flex-wrap items-stretch rounded-lg border border-neutral-300">
            <KpiCardOverview icon="ri-upload-cloud-line" iconBg="bg-info-100" value={processes.length} label="Configurados" />
            <KpiCardOverview icon="ri-checkbox-circle-line" iconBg="bg-success-100" value={counts.Completado} label="Completados" />
            <KpiCardOverview icon="ri-error-warning-line" iconBg="bg-danger-100" value={counts['Con errores']} label="Con error" />
            <KpiCardOverview icon="ri-restart-line" iconBg="bg-primary-200" value={counts['En proceso']} label="En proceso" />
            <KpiCardOverview icon="ri-file-damage-line" iconBg="bg-warning-200" value={counts.Parcial} label="Parcial" />
          </div>
        </div>

        {/* Search + filter chips */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4 pb-6">
          <div className="w-full max-w-[400px] min-w-[240px]">
            <label htmlFor="process-search" className="sr-only">
              Buscar proceso por ID o nombre
            </label>
            <div className="flex h-10 items-center gap-1 rounded-3xl border border-neutral-300 bg-neutral-0 px-4 py-2">
              <i className="ri-search-line text-xl text-neutral-500" aria-hidden="true" />
              <input
                id="process-search"
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Ingresa ID o nombre del proceso"
                className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Chip label="Todos" count={processes.length} active={filter === 'Todos'} onClick={() => handleFilterChange('Todos')} />
            <Chip
              label="Completados"
              count={counts.Completado}
              active={filter === 'Completado'}
              onClick={() => handleFilterChange('Completado')}
            />
            <Chip
              label="Con errores"
              count={counts['Con errores']}
              active={filter === 'Con errores'}
              onClick={() => handleFilterChange('Con errores')}
            />
            <Chip label="Parcial" count={counts.Parcial} active={filter === 'Parcial'} onClick={() => handleFilterChange('Parcial')} />
            <Chip
              label="En proceso"
              count={counts['En proceso']}
              active={filter === 'En proceso'}
              onClick={() => handleFilterChange('En proceso')}
            />
          </div>
        </div>

        {/* Page size selector */}
        <div className="flex w-full items-center gap-2 pb-4">
          <span className="text-sm text-neutral-700">Mostrar</span>
          <label htmlFor="page-size" className="sr-only">
            Registros por página
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 rounded-lg border border-neutral-300 bg-neutral-0 px-3 py-2 text-xs text-neutral-900 focus:outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-neutral-700">registros</span>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-lg border border-neutral-300">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-50">
                <th className="px-6 py-2 text-xs font-bold text-neutral-500">ID DEL PROCESO</th>
                <th className="px-6 py-2 text-xs font-bold text-neutral-500">NOMBRE DEL PROCESO</th>
                <th className="px-6 py-2 text-xs font-bold text-neutral-500">HORA</th>
                <th className="px-6 py-2 text-xs font-bold text-neutral-500">ESTATUS</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-neutral-500">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p, i) => (
                <tr key={p.id} className={`border-b border-neutral-300 ${i % 2 === 1 ? 'bg-neutral-50' : 'bg-neutral-0'}`}>
                  <td className="p-4">
                    <span className="inline-block truncate rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700">
                      {p.id}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-neutral-900">{p.name}</td>
                  <td className="p-4 text-sm text-neutral-700">{p.executionTime}</td>
                  <td className="p-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/procesos/${p.id}`)}
                      className="text-sm text-primary-700 hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-neutral-500">
                    No se encontraron procesos que coincidan con la búsqueda o filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4 pt-4">
          <p className="text-sm text-neutral-700">
            Mostrando registros del <span className="font-bold">{rangeStart} al {rangeEnd}</span>, de un total de{' '}
            <span className="font-bold">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
              className="flex size-[34px] items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <i className="ri-arrow-left-s-line" aria-hidden="true" />
            </button>
            <span className="flex items-center justify-center rounded-full border border-primary-500 bg-primary-300 px-3 py-2 text-sm font-semibold text-neutral-700">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Página siguiente"
              className="flex size-[34px] items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <i className="ri-arrow-right-s-line" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isNewProcessOpen && <NewProcessModal onClose={() => setNewProcessOpen(false)} />}
    </div>
  );
}
