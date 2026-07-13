/** Export CSV 100% cliente — usado por los paneles de Admin (Empleados, Partners, ...) sin backend. */
export function descargarCsv(filename: string, filas: string[][]) {
  const csv = filas.map((f) => f.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
