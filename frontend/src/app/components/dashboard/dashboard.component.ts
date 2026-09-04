import { Component, OnInit } from '@angular/core';
import { ItemsService, Item, Solicitud } from '../../core/services/items.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  misItems: Item[] = [];
  solicitudesPendientes: Solicitud[] = [];
  loading = false;
  error = '';

  constructor(
    private itemsService: ItemsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMisItems();
    this.loadSolicitudesPendientes();
  }

  loadMisItems(): void {
    this.loading = true;
    this.itemsService.getAllMyItems().subscribe({
      next: (items) => {
        this.misItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar mis items:', error);
        this.error = 'No se pudieron cargar tus items';
        this.loading = false;
      }
    });
  }

  loadSolicitudesPendientes(): void {
    this.itemsService.getSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        this.solicitudesPendientes = solicitudes;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes pendientes:', error);
      }
    });
  }

  aceptarSolicitud(solicitudId: string): void {
    this.itemsService.responderSolicitud(solicitudId, { estado: 'Aceptada' }).subscribe({
      next: () => {
        // Recargar solicitudes y items
        this.loadSolicitudesPendientes();
        this.loadMisItems();
      },
      error: (error) => {
        console.error('Error al aceptar solicitud:', error);
        alert('Hubo un error al aceptar la solicitud');
      }
    });
  }

  rechazarSolicitud(solicitudId: string, motivo?: string): void {
    const motivoRechazo = motivo || 'Sin motivo especificado';
    this.itemsService.responderSolicitud(solicitudId, { 
      estado: 'Rechazada', 
      motivoRechazo 
    }).subscribe({
      next: () => {
        // Recargar solicitudes y items
        this.loadSolicitudesPendientes();
        this.loadMisItems();
      },
      error: (error) => {
        console.error('Error al rechazar solicitud:', error);
        alert('Hubo un error al rechazar la solicitud');
      }
    });
  }

  eliminarItem(itemId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este ítem?')) {
      this.itemsService.deleteItem(itemId).subscribe({
        next: () => {
          this.loadMisItems();
        },
        error: (error) => {
          console.error('Error al eliminar item:', error);
          alert('Hubo un error al eliminar el ítem');
        }
      });
    }
  }

  trackById(index: number, item: Item | Solicitud): string {
    return item._id;
  }
}
