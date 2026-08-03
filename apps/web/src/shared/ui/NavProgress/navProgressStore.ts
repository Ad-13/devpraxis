type Listener = () => void;

let count = 0;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function startNavigation(): void {
  count += 1;
  if (count === 1) emit();
}

export function finishNavigation(): void {
  count = Math.max(0, count - 1);
  if (count === 0) emit();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): boolean {
  return count > 0;
}

export function getServerSnapshot(): boolean {
  return false;
}
