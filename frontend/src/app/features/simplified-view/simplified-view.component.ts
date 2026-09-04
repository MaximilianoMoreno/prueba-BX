import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService, Item } from '../../core/services/item.service';
import { GroupService, Group } from '../../core/services/group.service';
import { SolicitudService, Solicitud } from '../../core/services/solicitud.service';
import { AuthService } from '../../core/services/auth.service';
import { ItemCardComponent } from '../item-card/item-card.component';

@Component({
  selector: 'app-simplified-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header móvil -->
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold text-gray-900">¿Quién tiene?</h1>
            <button
              (click)="logout()"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <!-- Filtros -->
      <div class="bg-white border-b border-gray-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="space-y-3">
            <!-- Buscador -->
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar herramientas o insumos..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <!-- Filtro por categoría -->
            <select
              [(ngModel)]="categoriaFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              @for (cat of categorias; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>

            <!-- Filtro por grupo -->
            <select
              [(ngModel)]="grupoFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los grupos</option>
              @for (grupo of grupos; track grupo) {
                <option [value]="grupo._id">{{ grupo.nombre }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de items -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        @if (loading) {
          <div class="flex justify-center items-center py-12">
            <svg class="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        } @else if (filteredItems.length === 0) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron items</h3>
            <p class="mt-1 text-sm text-gray-500">
              @if (searchTerm || categoriaFilter || grupoFilter) {
                Intenta ajustar los filtros de búsqueda.
              } @else {
                Aún no hay items disponibles en tu red.
              }
            </p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (item of filteredItems; track item._id) {
              <app-item-card
                [item]="item"
                [propietarioNombre]="getPropietarioNombre(item.propietario)"
                [showActionButton]="true"
                (pedidoRealizado)="onPedidoRealizado()"
              />
            }
          </div>
        }

        <!-- Estadísticas rápidas -->
        <div class="mt-8 bg-white rounded-lg shadow p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Resumen</h2>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-600">{{ itemsDisponibles }}</div>
              <div class="text-xs text-gray-500">Disponibles</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ totalItems }}</div>
              <div class="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ grupos.length }}</div>
              <div class="text-xs text-gray-500">Grupos</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class SimplifiedViewComponent implements OnInit {
  items: Item[] = [];
  grupos: Group[] = [];
  loading: boolean = true;
  
  // Filtros
  searchTerm: string = '';
  categoriaFilter: string = '';
  grupoFilter: string = '';
  
  // Mapa de usuarios para mostrar nombres
  usuariosMap: Map<string, string> = new Map();

  constructor(
    private itemService: ItemService,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Cargar grupos del usuario
    this.groupService.getMyGroups().subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        
        // Cargar items de todos los grupos
        if (grupos.length > 0) {
          const grupoIds = grupos.map(g => g._id);
          this.loadItemsFromGroups(grupoIds);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
        this.loading = false;
      }
    });
  }

  loadItemsFromGroups(grupoIds: string[]): void {
    const requests = grupoIds.map(id => this.itemService.getItemsByGroup(id));
    
    Promise.all(requests.map(req => req.toPromise()))
      .then((results: Item[][]) => {
        const allItems = results.flat();
        this.items = allItems.filter(item => item.estado !== 'Agotado');
        
        // Extraer IDs únicos de propietarios
        const propietarioIds = [...new Set(allItems.map(item => item.propietario))];
        
        // Aquí podrías cargar los nombres de los propietarios si tienes un endpoint de usuarios
        // Por ahora usamos un placeholder
        
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error al cargar items:', error);
        this.loading = false;
      });
  }

  get filteredItems(): Item[] {
    return this.items.filter(item => {
      // Filtro por texto
      const matchSearch = !this.searchTerm || 
        item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchCategoria = !this.categoriaFilter || item.categoria === this.categoriaFilter;
      
      // Filtro por grupo
      const matchGrupo = !this.grupoFilter || item.grupo === this.grupoFilter;
      
      return matchSearch && matchCategoria && matchGrupo;
    });
  }

  get categorias(): string[] {
    return [...new Set(this.items.map(item => item.categoria))];
  }

  get itemsDisponibles(): number {
    return this.items.filter(item => item.estado === 'Disponible').length;
  }

  get totalItems(): number {
    return this.items.length;
  }

  getPropietarioNombre(propietarioId: string): string {
    return this.usuariosMap.get(propietarioId) || 'Usuario';
  }

  onPedidoRealizado(): void {
    // Recargar datos después de hacer un pedido
    setTimeout(() => this.loadData(), 1000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
