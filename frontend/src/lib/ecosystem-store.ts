/**
 * Persistencia interim post-V1 — registro Partners (INC-A02).
 * Archivo JSON servidor · sin BD · sin rutas API REST.
 * Sustituir por tabla Supabase cuando el propietario autorice BD partners.
 */
import { promises as fs } from "fs";
import path from "path";
import type { EstadoPartner, PartnerRegistro } from "@/lib/partners-types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "ecosystem-partners.json");

interface PartnersStoreFile {
  partners: PartnerRegistro[];
}

async function readStore(): Promise<PartnersStoreFile> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as PartnersStoreFile;
  } catch {
    const empty: PartnersStoreFile = { partners: [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
}

async function writeStore(data: PartnersStoreFile) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generarCodigo() {
  return `DRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function listPartners(): Promise<PartnerRegistro[]> {
  const store = await readStore();
  return store.partners.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getPartnerByEmail(email: string): Promise<PartnerRegistro | null> {
  const store = await readStore();
  return (
    store.partners.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null
  );
}

export async function createPartnerRecord(
  nombre: string,
  email: string
): Promise<PartnerRegistro> {
  const store = await readStore();
  const codigo = generarCodigo();
  const nuevo: PartnerRegistro = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    codigo,
    enlace: `https://darivo.pro/ref/${codigo}`,
    estado: "Pendiente",
    registros: [],
    createdAt: new Date().toISOString(),
  };
  store.partners.unshift(nuevo);
  await writeStore(store);
  return nuevo;
}

export async function updatePartnerEstado(
  id: string,
  estado: EstadoPartner
): Promise<PartnerRegistro | null> {
  const store = await readStore();
  const idx = store.partners.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  store.partners[idx] = { ...store.partners[idx], estado };
  await writeStore(store);
  return store.partners[idx];
}
