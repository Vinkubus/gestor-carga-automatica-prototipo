import { useEffect, useRef, type ReactNode } from 'react';

interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  labelledBy?: string;
}

export function ModalShell({ onClose, children, maxWidth = 'max-w-[500px]', labelledBy }: ModalShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(5,28,44,0.9)] py-16 backdrop-blur-[17px]"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full ${maxWidth} overflow-hidden rounded-2xl bg-neutral-0 shadow-modal`}
      >
        {children}
      </div>
    </div>
  );
}
