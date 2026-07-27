type Slot = number | 'gap';

export function pageSlots(page: number, pages: number, span: number): Slot[] {
  const wanted = new Set<number>([1, pages]);

  for (let candidate = page - span; candidate <= page + span; candidate += 1) {
    if (candidate >= 1 && candidate <= pages) wanted.add(candidate);
  }

  const slots: Slot[] = [];
  let previous = 0;

  for (const current of [...wanted].sort((a, b) => a - b)) {
    if (previous !== 0 && current - previous > 1) slots.push('gap');
    slots.push(current);
    previous = current;
  }

  return slots;
}
