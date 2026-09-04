import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../core/services/item.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <!-- Header con categoría y estado -->
      <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <span class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          {{ item.categoria }}
        </span>
        @if (item.esInsumo) {
          <span class="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
            Insumo
          </span>
        }
      </div>

      <!-- Contenido principal -->
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ item.nombre }}</h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ item.descripcion }}</p>

        <!-- Información de stock para insumos -->
        @if (item.esInsumo && item.stock !== undefined) {
          <div class="mb-3 p-2 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">Stock disponible:</span>
              <span class="font-bold" [class.text-red-600]="item.stock === 0" [class.text-green-600]="item.stock > 0">
                {{ item.stock }} unidades
              </span>
            </div>
            @if (item.prioridadReposicion) {
              <div class="mt-1 text-xs text-gray-500">
                Prioridad reposición: 
                <span [class]="{
                  'text-green-600': item.prioridadReposicion === 'baja',
                  'text-yellow-600': item.prioridadReposicion === 'media',
                  'text-red-600': item.prioridadReposicion === 'alta'
                }">
                  {{ item.prioridadReposicion | titlecase }}
                </span>
              </div>
            }
          </div>
        }

        <!-- Estado del item -->
        <div class="mb-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            [ngClass]="{
              'bg-green-100 text-green-800': item.estado === 'Disponible',
              'bg-yellow-100 text-yellow-800': item.estado === 'Pendiente de Aprobación',
              'bg-red-100 text-red-800': item.estado === 'En Uso',
              'bg-gray-100 text-gray-800': item.estado === 'Agotado'
            }">
            @switch (item.estado) {
              @case ('Disponible') {
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('En Uso') {
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
              }
            }
            {{ item.estado }}
          </span>
        </div>

        <!-- Propietario -->
        <div class="text-xs text-gray-500 mb-4">
          Propietario: <span class="font-medium text-gray-700">{{ propietarioNombre }}</span>
        </div>

        <!-- Botón de acción -->
        @if (showActionButton) {
          <button
            (click)="onPedirClick()"
            [disabled]="!isAvailable || loading"
            class="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
            [class.bg-green-600]="isAvailable && !loading"
            [class.hover:bg-green-700]="isAvailable && !loading"
            [class.bg-gray-400]="!isAvailable || loading"
            [class.cursor-not-allowed]="!isAvailable || loading"
          >
            @if (loading) {
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else if (isAvailable) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Pedir
            } @else {
              No disponible
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ItemCardComponent {
  @Input() item!: Item;
  @Input() propietarioNombre: string = 'Desconocido';
  @Input() showActionButton: boolean = true;
  
  @Output() pedidoRealizado = new EventEmitter<void>();

  loading: boolean = false;

  constructor(
    private solicitudService: SolicitudService,
    private authService: AuthService
  ) {}

  get isAvailable(): boolean {
    return this.item.estado === 'Disponible';
  }

  onPedirClick(): void {
    if (!this.isAvailable) return;

    this.loading = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.loading = false;
      alert('Debes iniciar sesión para pedir un item');
      return;
    }

    const solicitudData = {
      item: this.item._id,
      solicitante: currentUser._id,
      propietario: this.item.propietario,
      grupo: this.item.grupo,
      notas: `Hola! Quisiera pedir prestado: ${this.item.nombre}`
    };

    this.solicitudService.crearSolicitud(solicitudData).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Abrir WhatsApp
        window.open(response.whatsappUrl, '_blank');
        
        // Emitir evento para que el componente padre actualice la lista
        this.pedidoRealizado.emit();
        
        alert('¡Solicitud enviada! Se abrió WhatsApp para contactar al propietario.');
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear solicitud:', error);
        alert('Error al enviar la solicitud. Intenta nuevamente.');
      }
    });
  }
}
