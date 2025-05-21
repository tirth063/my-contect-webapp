
'use client';

import { useCallback, useRef, useEffect } from 'react';

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
  moveThreshold?: number; // Pixels
}

export function useLongPress(
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void,
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void,
  { shouldPreventDefault = true, delay = 300, moveThreshold = 10 }: LongPressOptions = {}
) {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);
  const pressStartCoords = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggered = useRef(false);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      isLongPressTriggered.current = false;
      if (shouldPreventDefault && event.target) {
        target.current = event.target;
      }

      let clientX, clientY;
      if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }
      pressStartCoords.current = { x: clientX, y: clientY };

      timeout.current = setTimeout(() => {
        onLongPress(event);
        isLongPressTriggered.current = true;
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
      if (shouldTriggerClick && onClick && !isLongPressTriggered.current) {
        onClick(event);
      }
      pressStartCoords.current = null;
      isLongPressTriggered.current = false; // Reset for next interaction
    },
    [onClick]
  );

  const handleMove = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!pressStartCoords.current || !timeout.current) return;

    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const deltaX = Math.abs(clientX - pressStartCoords.current.x);
    const deltaY = Math.abs(clientY - pressStartCoords.current.y);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      clear(event, false); // Cancel long press if moved beyond threshold
    }
  }, [moveThreshold, clear]);


  useEffect(() => {
    // Clean up timeout if component unmounts
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);


  // Prevent context menu on long touch
  useEffect(() => {
    const targetElement = target.current as HTMLElement | null;
    if (!targetElement) return;

    const preventContextMenu = (event: Event) => {
        if (isLongPressTriggered.current) {
            event.preventDefault();
        }
    };

    targetElement.addEventListener("contextmenu", preventContextMenu);
    return () => {
      targetElement.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [isLongPressTriggered.current]);


  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    onTouchMove: (e: React.TouchEvent) => handleMove(e),
    onMouseMove: (e: React.MouseEvent) => handleMove(e), // Added for mouse move cancellation
  };
}
