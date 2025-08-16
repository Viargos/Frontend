'use client';

import { useEffect, useCallback } from 'react';

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

interface UseKeyboardShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  eventType?: 'keydown' | 'keyup' | 'keypress';
  target?: EventTarget | null;
}

/**
 * Custom hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(
  keys: string | string[],
  handler: KeyboardShortcutHandler,
  options: UseKeyboardShortcutOptions = {}
) {
  const {
    preventDefault = false,
    stopPropagation = false,
    eventType = 'keydown',
    target = null
  } = options;

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      const pressedKey = event.key.toLowerCase();
      
      if (keyArray.includes(pressedKey)) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        handler(event);
      }
    },
    [keys, handler, preventDefault, stopPropagation]
  );

  useEffect(() => {
    const eventTarget = target || document;
    eventTarget.addEventListener(eventType, handleKeyEvent as EventListener);

    return () => {
      eventTarget.removeEventListener(eventType, handleKeyEvent as EventListener);
    };
  }, [handleKeyEvent, eventType, target]);
}

/**
 * Hook specifically for Escape key (most common use case)
 */
export function useEscapeKey(handler: () => void, isActive: boolean = true) {
  useKeyboardShortcut(
    'escape',
    handler,
    { preventDefault: true }
  );
}

/**
 * Hook for handling modifier key combinations
 */
export function useKeyboardCombo(
  combo: {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  },
  handler: KeyboardShortcutHandler,
  options: UseKeyboardShortcutOptions = {}
) {
  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrl = false, shift = false, alt = false, meta = false } = combo;
      
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatches = event.ctrlKey === ctrl;
      const shiftMatches = event.shiftKey === shift;
      const altMatches = event.altKey === alt;
      const metaMatches = event.metaKey === meta;
      
      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        if (options.preventDefault) event.preventDefault();
        if (options.stopPropagation) event.stopPropagation();
        handler(event);
      }
    },
    [combo, handler, options]
  );

  useEffect(() => {
    const eventTarget = options.target || document;
    const eventType = options.eventType || 'keydown';
    
    eventTarget.addEventListener(eventType, handleKeyEvent as EventListener);

    return () => {
      eventTarget.removeEventListener(eventType, handleKeyEvent as EventListener);
    };
  }, [handleKeyEvent, options.target, options.eventType]);
}

/**
 * Hook for common keyboard shortcuts
 */
export function useCommonShortcuts(shortcuts: {
  onSave?: () => void;
  onCancel?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
}) {
  const {
    onSave,
    onCancel,
    onCopy,
    onPaste,
    onUndo,
    onRedo,
    onSelectAll
  } = shortcuts;

  // Save: Ctrl+S / Cmd+S
  useKeyboardCombo(
    { key: 's', ctrl: true },
    onSave || (() => {}),
    { preventDefault: !!onSave }
  );

  // Cancel: Escape
  useKeyboardShortcut('escape', onCancel || (() => {}));

  // Copy: Ctrl+C / Cmd+C
  useKeyboardCombo(
    { key: 'c', ctrl: true },
    onCopy || (() => {}),
    { preventDefault: !!onCopy }
  );

  // Paste: Ctrl+V / Cmd+V
  useKeyboardCombo(
    { key: 'v', ctrl: true },
    onPaste || (() => {}),
    { preventDefault: !!onPaste }
  );

  // Undo: Ctrl+Z / Cmd+Z
  useKeyboardCombo(
    { key: 'z', ctrl: true },
    onUndo || (() => {}),
    { preventDefault: !!onUndo }
  );

  // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
  useKeyboardCombo(
    { key: 'y', ctrl: true },
    onRedo || (() => {}),
    { preventDefault: !!onRedo }
  );

  // Select All: Ctrl+A / Cmd+A
  useKeyboardCombo(
    { key: 'a', ctrl: true },
    onSelectAll || (() => {}),
    { preventDefault: !!onSelectAll }
  );
}
