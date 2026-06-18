"use client";
import { useMemo, useState } from "react";

const PAGE_SIZE = 20;

export function usePaginatedList<T>(items: T[]) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const slice = useMemo(() => items.slice(0, visible), [items, visible]);
  const hayMas = visible < items.length;

  const cargarMas = () => setVisible((v) => Math.min(v + PAGE_SIZE, items.length));

  return { slice, hayMas, cargarMas, total: items.length, visible: slice.length };
}
