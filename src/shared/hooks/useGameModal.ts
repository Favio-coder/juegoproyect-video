import { useState, useCallback, useRef } from "react";
import type { GameModalProps, GameModalAction } from "../components/GameModal/GameModal";

export interface ShowModalOptions {
  avatarSrc?: string;
  avatarAlt?: string;
  title?: string;
  message?: string;
  actions?: GameModalAction[];
  closeOnBackdrop?: boolean;
  width?: number | string;
}

export interface UseGameModalReturn {
  /** Props to spread onto <GameModal /> */
  modalProps: GameModalProps;
  /** Imperatively show a modal. Returns a promise that resolves with the
   *  index of the action clicked, or -1 if dismissed via backdrop/ESC. */
  showModal: (opts: ShowModalOptions) => Promise<number>;
  /** Imperatively close the modal */
  closeModal: () => void;
  /** Whether the modal is currently open */
  isOpen: boolean;
}

/**
 * useGameModal — SweetAlert-style imperative API for GameModal.
 *
 * Usage:
 * ```tsx
 * const { modalProps, showModal } = useGameModal();
 *
 * const result = await showModal({
 *   avatarSrc: advisingSvg,
 *   title: "¡Manos arriba!",
 *   message: "Levanta ambos brazos sobre tus hombros",
 *   actions: [{ label: "¡Comenzar!", onClick: () => {} }],
 * });
 *
 * // In JSX:
 * <GameModal {...modalProps} />
 * ```
 */
export function useGameModal(): UseGameModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [opts, setOpts] = useState<ShowModalOptions>({});
  const resolveRef = useRef<((idx: number) => void) | null>(null);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(-1);
    resolveRef.current = null;
  }, []);

  const showModal = useCallback((options: ShowModalOptions): Promise<number> => {
    setOpts(options);
    setIsOpen(true);
    return new Promise<number>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  /* Build action wrappers that resolve the promise */
  const wrappedActions: GameModalAction[] = (opts.actions ?? []).map(
    (action, i) => ({
      ...action,
      onClick: () => {
        action.onClick();
        setIsOpen(false);
        resolveRef.current?.(i);
        resolveRef.current = null;
      },
    })
  );

  const modalProps: GameModalProps = {
    isOpen,
    avatarSrc: opts.avatarSrc,
    avatarAlt: opts.avatarAlt,
    title: opts.title,
    message: opts.message,
    actions: wrappedActions,
    closeOnBackdrop: opts.closeOnBackdrop ?? true,
    onClose: closeModal,
    width: opts.width,
  };

  return { modalProps, showModal, closeModal, isOpen };
}
