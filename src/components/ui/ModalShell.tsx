import { useEffect, useRef, useState, type ReactNode } from 'react';

const ANIMATION_MS = 400;

interface ModalShellProps {
  onClose: () => void;
  children: ReactNode | ((requestClose: (after?: () => void) => void) => ReactNode);
  maxWidth?: string;
  labelledBy?: string;
}

export function ModalShell({ onClose, children, maxWidth = 'max-w-[500px]', labelledBy }: ModalShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);

  function requestClose(after?: () => void) {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    window.setTimeout(() => (after ?? onClose)(), ANIMATION_MS);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        requestClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  function handleBackdropClick(e: React.MouseEvent) {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      requestClose();
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(5,28,44,0.9)] py-16 backdrop-blur-[17px] transition-opacity duration-[400ms] ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full ${maxWidth} overflow-hidden rounded-2xl bg-neutral-0 shadow-modal transition-[opacity,transform] duration-[400ms] ease-in-out ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {typeof children === 'function' ? children(requestClose) : children}
      </div>
    </div>
  );
}
