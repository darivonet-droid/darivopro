import { T } from "@/lib/design-system/tokens";
import { Fragment, type ReactNode } from "react";

/**
 * Renderer Markdown mínimo y fiel para los documentos legales (Términos,
 * Privacidad). Soporta lo que esos MD usan: encabezados #/##/###, negrita **,
 * itálica *, código en línea `x`, listas *, tablas GitHub, y reglas ---.
 * No interpreta enlaces [texto](url) — es intencional: los corchetes de
 * marcador [pendiente] deben seguir visibles tal cual hasta revisión legal
 * (ver comentario en terminos/privacidad page.tsx).
 */

// Negrita **x**, itálica *x*, código `x` → nodos React; recursivo para
// permitir anidamiento (p. ej. `código` dentro de **negrita**).
function inline(texto: string, keyBase: string): ReactNode[] {
  const nodos: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+?)`/g;
  let cursor = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto))) {
    if (m.index > cursor) {
      nodos.push(<Fragment key={`${keyBase}-t${key++}`}>{texto.slice(cursor, m.index)}</Fragment>);
    }
    if (m[1] !== undefined) {
      nodos.push(<strong key={`${keyBase}-b${key}`}>{inline(m[1], `${keyBase}-b${key++}`)}</strong>);
    } else if (m[2] !== undefined) {
      nodos.push(<em key={`${keyBase}-i${key}`}>{inline(m[2], `${keyBase}-i${key++}`)}</em>);
    } else if (m[3] !== undefined) {
      nodos.push(
        <code
          key={`${keyBase}-c${key++}`}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]"
          style={{ color: T.text }}
        >
          {m[3]}
        </code>
      );
    }
    cursor = regex.lastIndex;
  }
  if (cursor < texto.length) {
    nodos.push(<Fragment key={`${keyBase}-t${key++}`}>{texto.slice(cursor)}</Fragment>);
  }
  return nodos;
}

export function MarkdownLegal({ source }: { source: string }) {
  const lineas = source.replace(/\r\n/g, "\n").split("\n");
  const bloques: ReactNode[] = [];
  let i = 0;
  let parrafo: string[] = [];

  const cerrarParrafo = () => {
    if (parrafo.length) {
      const key = `p${bloques.length}`;
      bloques.push(
        <p key={key} className="mb-3 text-sm leading-relaxed" style={{ color: T.textMid }}>
          {inline(parrafo.join(" "), key)}
        </p>
      );
      parrafo = [];
    }
  };

  while (i < lineas.length) {
    const linea = lineas[i];
    const t = linea.trim();

    // Tabla (líneas consecutivas que empiezan por |)
    if (t.startsWith("|")) {
      cerrarParrafo();
      const filas: string[] = [];
      while (i < lineas.length && lineas[i].trim().startsWith("|")) {
        filas.push(lineas[i].trim());
        i++;
      }
      const parseFila = (f: string) => f.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const cabecera = parseFila(filas[0]);
      const cuerpo = filas.slice(2).map(parseFila); // filas[1] = separador ---
      const key = `tb${bloques.length}`;
      bloques.push(
        <div key={key} className="mb-4 overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {cabecera.map((c, j) => (
                  <th key={j} className="border px-3 py-2 font-bold" style={{ borderColor: T.slateD, color: T.text }}>
                    {inline(c, `${key}-h${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cuerpo.map((fila, r) => (
                <tr key={r}>
                  {fila.map((c, j) => (
                    <td key={j} className="border px-3 py-2 align-top" style={{ borderColor: T.slateD, color: T.textMid }}>
                      {inline(c, `${key}-r${r}c${j}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (t === "---") {
      cerrarParrafo();
      bloques.push(<hr key={`hr${bloques.length}`} className="my-5" style={{ borderColor: T.slateD }} />);
      i++;
      continue;
    }

    if (t.startsWith("### ")) {
      cerrarParrafo();
      const key = `h3${bloques.length}`;
      bloques.push(
        <h3 key={key} className="mb-2 mt-4 text-sm font-extrabold" style={{ color: T.text }}>
          {inline(t.slice(4), key)}
        </h3>
      );
      i++;
      continue;
    }
    if (t.startsWith("## ")) {
      cerrarParrafo();
      const key = `h2${bloques.length}`;
      bloques.push(
        <h2 key={key} className="mb-2 mt-6 text-base font-black" style={{ color: T.text }}>
          {inline(t.slice(3), key)}
        </h2>
      );
      i++;
      continue;
    }
    if (t.startsWith("# ")) {
      cerrarParrafo();
      const key = `h1${bloques.length}`;
      bloques.push(
        <h1 key={key} className="mb-4 text-xl font-black" style={{ color: T.text }}>
          {inline(t.slice(2), key)}
        </h1>
      );
      i++;
      continue;
    }

    // Lista (* o -)
    if (t.startsWith("* ") || t.startsWith("- ")) {
      cerrarParrafo();
      const items: string[] = [];
      while (i < lineas.length) {
        const li = lineas[i].trim();
        if (li.startsWith("* ") || li.startsWith("- ")) {
          items.push(li.slice(2));
          i++;
        } else break;
      }
      const key = `ul${bloques.length}`;
      bloques.push(
        <ul key={key} className="mb-3 ml-5 list-disc text-sm leading-relaxed" style={{ color: T.textMid }}>
          {items.map((it, j) => (
            <li key={j} className="mb-1">
              {inline(it, `${key}-i${j}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Línea en blanco → cierra párrafo; texto → acumula
    if (t === "") {
      cerrarParrafo();
    } else {
      parrafo.push(t);
    }
    i++;
  }
  cerrarParrafo();

  return <div>{bloques}</div>;
}
