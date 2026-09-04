import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface Item {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  esInsumo: boolean;
  stock?: number;
  prioridadReposicion?: 'baja' | 'media' | 'alta';
  almacenable: boolean;
  estado: 'Disponible' | 'Pendiente de Aprobación' | 'En Uso' | 'Agotado';
  propietario: string;
  grupo: string;
  imagen?: string;
}

export interface CreateItemRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
  esInsumo: boolean;
  stock?: number;
  prioridadReposicion?: 'baja' | 'media' | 'alta';
  almacenable: boolean;
  grupo: string;
  imagen?: string;
}

export interface UpdateItemRequest {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  esInsumo?: boolean;
  stock?: number;
  prioridadReposicion?: 'baja' | 'media' | 'alta';
  almacenable?: boolean;
  estado?: 'Disponible' | 'Pendiente de Aprobación' | 'En Uso' | 'Agotado';
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly API_URL: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.API_URL = this.apiConfig.getApiUrl();
  }

  getItemsByGroup(groupId: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.API_URL}/items/grupo/${groupId}`);
  }

  getItemById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.API_URL}/items/${id}`);
  }

  getMyItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.API_URL}/items/mis-items`);
  }

  createItem(itemData: CreateItemRequest): Observable<Item> {
    return this.http.post<Item>(`${this.API_URL}/items`, itemData, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  updateItem(id: string, itemData: UpdateItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.API_URL}/items/${id}`, itemData, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/items/${id}`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  updateEstado(id: string, estado: Item['estado']): Observable<Item> {
    return this.http.patch<Item>(`${this.API_URL}/items/${id}/estado`, { estado }, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }
}
