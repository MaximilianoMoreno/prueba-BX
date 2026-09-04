import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface Group {
  _id: string;
  nombre: string;
  descripcion?: string;
  creador: string;
  miembros: string[];
  fechaCreacion: string;
}

export interface CreateGroupRequest {
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly API_URL: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.API_URL = this.apiConfig.getApiUrl();
  }

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.API_URL}/groups/mis-grupos`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  getGroupById(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.API_URL}/groups/${id}`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  createGroup(groupData: CreateGroupRequest): Observable<Group> {
    return this.http.post<Group>(`${this.API_URL}/groups`, groupData, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  addMember(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.API_URL}/groups/${groupId}/miembros`, { userId }, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  removeMember(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(`${this.API_URL}/groups/${groupId}/miembros/${userId}`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/groups/${id}`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }
}
