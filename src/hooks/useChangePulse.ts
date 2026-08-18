import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which keys changed value since the last render pass.
 *
 * The artboard replays its `em-pop` keyframe imperatively whenever a price
 * ticks. React equivalent: report the ids whose value differs from the one we
 * last saw, so the view can key the pop animation off that. Only ids present
 * on a later poll pulse — the first load uses `em-rise` instead, as designed.
 */
export function useChangePulse(entries: Array<{ key: string; value: string }>): Set<string> {
  const seen = useRef<Map<string, string> | null>(null);
  const [pulsed, setPulsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const previous = seen.current;
    const next = new Map(entries.map((e) => [e.key, e.value]));

    if (previous === null) {
      // First load: establish a baseline without pulsing anything.
      seen.current = next;
      return;
    }

    const changed = new Set<string>();
    for (const [key, value] of next) {
      const before = previous.get(key);
      if (before !== undefined && before !== value) changed.add(key);
    }
    seen.current = next;

    if (changed.size > 0) setPulsed(changed);
  }, [entries]);

  return pulsed;
}
