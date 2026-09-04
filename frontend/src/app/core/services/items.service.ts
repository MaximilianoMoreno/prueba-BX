import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Item {
  _id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  esInsumo: boolean;
  stock?: number;
  cantidadTotal?: number;
  prioridadReposicion?: 'baja' | 'media' | 'alta';
  almacenable: boolean;
  estado: 'Disponible' | 'Pendiente de Aprobación' | 'En Uso' | 'Agotado';
  propietarioId: string;
  grupoId: string;
  imagenUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Grupo {
  _id: string;
  nombre: string;
  descripcion?: string;
  creadorId: string;
  miembros: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Solicitud {
  _id: string;
  itemId: string;
  solicitanteId: string;
  propietarioId: string;
  estado: 'Pendiente' | 'Aceptada' | 'Rechazada';
  fechaSolicitud: Date;
  fechaRespuesta?: Date;
  motivoRechazo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  constructor(private apiService: ApiService) {}

  // Items
  getItemsByGroup(groupId: string): Observable<Item[]> {
    return this.apiService.get<Item[]>(`grupos/${groupId}/items`);
  }

  getAllMyItems(): Observable<Item[]> {
    return this.apiService.get<Item[]>('items/mis-items');
  }

  getItemById(itemId: string): Observable<Item> {
    return this.apiService.get<Item>(`items/${itemId}`);
  }

  createItem(itemData: Partial<Item>): Observable<Item> {
    return this.apiService.post<Item>('items', itemData);
  }

  updateItem(itemId: string, itemData: Partial<Item>): Observable<Item> {
    return this.apiService.put<Item>(`items/${itemId}`, itemData);
  }

  deleteItem(itemId: string): Observable<any> {
    return this.apiService.delete(`items/${itemId}`);
  }

  // Grupos
  getMyGroups(): Observable<Grupo[]> {
    return this.apiService.get<Grupo[]>('grupos/mis-grupos');
  }

  getGroupById(groupId: string): Observable<Grupo> {
    return this.apiService.get<Grupo>(`grupos/${groupId}`);
  }

  createGroup(groupData: { nombre: string; descripcion?: string }): Observable<Grupo> {
    return this.apiService.post<Grupo>('grupos', groupData);
  }

  addMemberToGroup(groupId: string, userId: string): Observable<Grupo> {
    return this.apiService.post<Grupo>(`grupos/${groupId}/miembros`, { userId });
  }

  removeMemberFromGroup(groupId: string, userId: string): Observable<Grupo> {
    return this.apiService.delete(`grupos/${groupId}/miembros/${userId}`);
  }

  // Solicitudes
  getSolicitudesPendientes(): Observable<Solicitud[]> {
    return this.apiService.get<Solicitud[]>('solicitudes/pendientes');
  }

  getSolicitudesByUser(): Observable<Solicitud[]> {
    return this.apiService.get<Solicitud[]>('solicitudes/mis-solicitudes');
  }

  crearSolicitud(solicitudData: { itemId: string; propietarioId: string }): Observable<Solicitud> {
    return this.apiService.post<Solicitud>('solicitudes', solicitudData);
  }

  responderSolicitud(solicitudId: string, respuesta: { estado: 'Aceptada' | 'Rechazada'; motivoRechazo?: string }): Observable<Solicitud> {
    return this.apiService.put<Solicitud>(`solicitudes/${solicitudId}/respuesta`, respuesta);
  }
}
