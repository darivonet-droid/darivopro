/** Estados oficiales — schema real `soporte_tickets.estado` (CHECK), ver 09-PANEL-ADMIN-SOPORTE.md §5 */
export type EstadoTicket = "Abierto" | "En progreso" | "Resuelto" | "Cerrado";

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
  ultimaRespuesta?: string | null;
}

export interface CrearTicketInput {
  asunto: string;
  descripcion: string;
}

export type AutorMensaje = "usuario" | "admin";

export interface SoporteMensaje {
  id: string;
  ticketId: string;
  autorTipo: AutorMensaje;
  autorUserId: string | null;
  mensaje: string;
  createdAt: string;
}
