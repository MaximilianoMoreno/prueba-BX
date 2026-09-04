import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface Solicitud {
  _id: string;
  item: string;
  solicitante: string;
  propietario: string;
  grupo: string;
  estado: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Completada';
  fechaSolicitud: string;
  fechaRespuesta?: string;
  notas?: string;
}

export interface CreateSolicitudRequest {
  item: string;
  solicitante: string;
  propietario: string;
  grupo: string;
  notas?: string;
}

export interface SolicitudResponse {
  solicitud: Solicitud;
  whatsappUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private readonly API_URL: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.API_URL = this.apiConfig.getApiUrl();
  }

  /**
   * Crea una nueva solicitud de préstamo y devuelve la URL de WhatsApp
   */
  crearSolicitud(data: CreateSolicitudRequest): Observable<SolicitudResponse> {
    return this.http.post<SolicitudResponse>(`${this.API_URL}/solicitudes`, data, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  /**
   * Obtiene las solicitudes pendientes de un usuario (para el Dashboard del propietario)
   */
  getSolicitudesPendientes(propietarioId: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.API_URL}/solicitudes/propietario/${propietarioId}/pendientes`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  /**
   * Obtiene todas las solicitudes de un usuario (como solicitante o propietario)
   */
  getMisSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.API_URL}/solicitudes/mis-solicitudes`, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  /**
   * Acepta una solicitud - cambia estado a 'Aceptada' y actualiza el item
   */
  aceptarSolicitud(id: string): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.API_URL}/solicitudes/${id}/aceptar`, {}, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  /**
   * Rechaza una solicitud - cambia estado a 'Rechazada' y libera el item
   */
  rechazarSolicitud(id: string): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.API_URL}/solicitudes/${id}/rechazar`, {}, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }

  /**
   * Completa una solicitud - cuando se devuelve el item
   */
  completarSolicitud(id: string): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.API_URL}/solicitudes/${id}/completar`, {}, {
      headers: this.apiConfig.getAuthHeaders()
    });
  }
}
