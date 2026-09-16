import { useEffect, useRef, type ReactNode } from "react";

export default function Modal({ title, onClose, busy = false, children }: {
  title: string; onClose: () => void; busy?: boolean; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>('input:not([type="file"])')?.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="workspace-modal" aria-labelledby="modal-title"
    onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <header className="modal-heading"><div><span className="eyebrow">EMPRESA INTELIGENTE</span><h2 id="modal-title">{title}</h2></div>
      <button type="button" className="icon-button" aria-label="Cerrar ventana" disabled={busy} onClick={onClose}>×</button>
    </header>
    <div className="modal-body">{children}</div>
  </dialog>;
}
