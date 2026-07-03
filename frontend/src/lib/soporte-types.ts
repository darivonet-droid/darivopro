/** Estados oficiales — 09-PANEL-ADMIN-SOPORTE.md §5 */
export type EstadoTicket = "Nuevo" | "En proceso" | "Resuelto";

export interface SoporteTicket {
  id: string;
  userId: string;
  userEmail: string;
  userNombre: string;
  plan: string;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  createdAt: string;
  ultimaRespuesta?: string;
}

export interface CrearTicketInput {
  asunto: string;
  descripcion: string;
}
