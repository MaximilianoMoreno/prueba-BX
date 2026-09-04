import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService, Item, CreateItemRequest, UpdateItemRequest } from '../../core/services/item.service';
import { GroupService, Group } from '../../core/services/group.service';
import { SolicitudService, Solicitud } from '../../core/services/solicitud.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navbar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Dashboard - ¿Quién tiene?</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/simplified" class="text-sm text-blue-600 hover:text-blue-800">
                Vista Simplificada
              </a>
              <button (click)="logout()" class="text-sm text-gray-600 hover:text-gray-900">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="activeTab = 'items'"
              [class.border-blue-500]="activeTab === 'items'"
              [class.text-blue-600]="activeTab === 'items'"
              class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-gray-300]="activeTab !== 'items'"
              [class.text-gray-500]="activeTab !== 'items'"
            >
              Mis Items
            </button>
            <button
              (click)="activeTab = 'solicitudes'"
              [class.border-blue-500]="activeTab === 'solicitudes'"
              [class.text-blue-600]="activeTab === 'solicitudes'"
              class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors relative"
              [class.border-gray-300]="activeTab !== 'solicitudes'"
              [class.text-gray-500]="activeTab !== 'solicitudes'"
            >
              Solicitudes Pendientes
              @if (solicitudesPendientes.length > 0) {
                <span class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {{ solicitudesPendientes.length }}
                </span>
              }
            </button>
          </nav>
        </div>

        <!-- Tab: Mis Items -->
        @if (activeTab === 'items') {
          <div>
            <!-- Botón agregar item -->
            <div class="mb-6">
              <button
                (click)="showNewItemForm = !showNewItemForm"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar Nuevo Item
              </button>
            </div>

            <!-- Formulario nuevo item -->
            @if (showNewItemForm) {
              <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h2 class="text-lg font-semibold mb-4">Nuevo Item</h2>
                <form (ngSubmit)="createItem()" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input [(ngModel)]="newItem.nombre" name="nombre" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select [(ngModel)]="newItem.categoria" name="categoria" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="Herramientas">Herramientas</option>
                        <option value="Madera">Madera</option>
                        <option value="Metal">Metal</option>
                        <option value="Autos">Autos</option>
                        <option value="Insumos">Insumos</option>
                        <option value="Construcción">Construcción</option>
                        <option value="Jardín">Jardín</option>
                        <option value="Electricidad">Electricidad</option>
                        <option value="Plomería">Plomería</option>
                      </select>
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea [(ngModel)]="newItem.descripcion" name="descripcion" rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                      <select [(ngModel)]="newItem.grupo" name="grupo" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        @for (grupo of grupos; track grupo._id) {
                          <option [value]="grupo._id">{{ grupo.nombre }}</option>
                        }
                      </select>
                    </div>
                    <div class="flex items-center gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" [(ngModel)]="newItem.esInsumo" name="esInsumo"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <span class="ml-2 text-sm text-gray-700">Es Insumo</span>
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" [(ngModel)]="newItem.almacenable" name="almacenable"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <span class="ml-2 text-sm text-gray-700">Almacenable</span>
                      </label>
                    </div>
                    @if (newItem.esInsumo) {
                      <>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                          <input type="number" [(ngModel)]="newItem.stock" name="stock" min="0"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad Reposición</label>
                          <select [(ngModel)]="newItem.prioridadReposicion" name="prioridadReposicion"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                          </select>
                        </div>
                      </>
                    }
                  </div>
                  <div class="flex gap-2">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Guardar
                    </button>
                    <button type="button" (click)="showNewItemForm = false"
                      class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            }

            <!-- Lista de items -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (item of misItems; track item._id) {
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.nombre }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.categoria }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': item.estado === 'Disponible',
                            'bg-yellow-100 text-yellow-800': item.estado === 'Pendiente de Aprobación',
                            'bg-red-100 text-red-800': item.estado === 'En Uso',
                            'bg-gray-100 text-gray-800': item.estado === 'Agotado'
                          }">
                          {{ item.estado }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ item.esInsumo ? 'Insumo' : 'Herramienta' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button (click)="editarItem(item)" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button (click)="eliminarItem(item._id)" class="text-red-600 hover:text-red-900">Eliminar</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Tab: Solicitudes Pendientes -->
        @if (activeTab === 'solicitudes') {
          <div>
            @if (solicitudesPendientes.length === 0) {
              <div class="bg-white rounded-lg shadow p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay solicitudes pendientes</h3>
                <p class="mt-1 text-sm text-gray-500">Cuando alguien quiera pedirte algo prestado, aparecerá aquí.</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (solicitud of solicitudesPendientes; track solicitud._id) {
                  <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">Solicitud de préstamo</h3>
                        <p class="text-sm text-gray-600 mt-1">
                          Item ID: {{ solicitud.item }} | Solicitante: {{ solicitud.solicitante }}
                        </p>
                        @if (solicitud.notas) {
                          <p class="text-sm text-gray-500 mt-2 italic">"{{ solicitud.notas }}"</p>
                        }
                        <p class="text-xs text-gray-400 mt-2">
                          Fecha: {{ solicitud.fechaSolicitud | date:'dd/MM/yyyy HH:mm' }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <button
                          (click)="aceptarSolicitud(solicitud._id)"
                          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          Aceptar
                        </button>
                        <button
                          (click)="rechazarSolicitud(solicitud._id)"
                          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'items';
  showNewItemForm: boolean = false;
  
  misItems: Item[] = [];
  grupos: Group[] = [];
  solicitudesPendientes: Solicitud[] = [];
  loading: boolean = true;

  newItem: CreateItemRequest = {
    nombre: '',
    descripcion: '',
    categoria: '',
    esInsumo: false,
    almacenable: true,
    grupo: ''
  };

  currentUser: any = null;

  constructor(
    private itemService: ItemService,
    private groupService: GroupService,
    private solicitudService: SolicitudService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadData();
  }

  loadData(): void {
    // Cargar grupos
    this.groupService.getMyGroups().subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        // Cargar mis items
        this.itemService.getMyItems().subscribe({
          next: (items) => {
            this.misItems = items;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al cargar items:', error);
            this.loading = false;
          }
        });
        
        // Cargar solicitudes pendientes
        this.solicitudService.getSolicitudesPendientes(this.currentUser._id).subscribe({
          next: (solicitudes) => {
            this.solicitudesPendientes = solicitudes;
          },
          error: (error) => {
            console.error('Error al cargar solicitudes:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
        this.loading = false;
      }
    });
  }

  createItem(): void {
    if (!this.newItem.nombre || !this.newItem.categoria || !this.newItem.grupo) {
      alert('Completa los campos requeridos');
      return;
    }

    this.itemService.createItem(this.newItem).subscribe({
      next: (item) => {
        this.misItems.push(item);
        this.showNewItemForm = false;
        this.newItem = {
          nombre: '',
          descripcion: '',
          categoria: '',
          esInsumo: false,
          almacenable: true,
          grupo: ''
        };
        alert('Item creado exitosamente');
      },
      error: (error) => {
        console.error('Error al crear item:', error);
        alert('Error al crear el item');
      }
    });
  }

  editarItem(item: Item): void {
    // Implementar edición (puede ser un modal o formulario inline)
    alert('Funcionalidad de edición - a implementar');
  }

  eliminarItem(id: string): void {
    if (confirm('¿Estás seguro de eliminar este item?')) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.misItems = this.misItems.filter(item => item._id !== id);
          alert('Item eliminado');
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el item');
        }
      });
    }
  }

  aceptarSolicitud(id: string): void {
    this.solicitudService.aceptarSolicitud(id).subscribe({
      next: () => {
        this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s._id !== id);
        this.loadData(); // Recargar para actualizar estados
        alert('Solicitud aceptada');
      },
      error: (error) => {
        console.error('Error al aceptar:', error);
        alert('Error al aceptar la solicitud');
      }
    });
  }

  rechazarSolicitud(id: string): void {
    this.solicitudService.rechazarSolicitud(id).subscribe({
      next: () => {
        this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s._id !== id);
        this.loadData();
        alert('Solicitud rechazada');
      },
      error: (error) => {
        console.error('Error al rechazar:', error);
        alert('Error al rechazar la solicitud');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
