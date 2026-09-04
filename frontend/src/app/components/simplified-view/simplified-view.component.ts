import { Component, OnInit } from '@angular/core';
import { ItemsService, Item, Grupo, Solicitud } from '../../core/services/items.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-simplified-view',
  templateUrl: './simplified-view.component.html',
  styleUrls: ['./simplified-view.component.css']
})
export class SimplifiedViewComponent implements OnInit {
  grupos: Grupo[] = [];
  items: Item[] = [];
  filteredItems: Item[] = [];
  selectedGroupId: string | null = null;
  loading = false;
  error = '';

  constructor(
    private itemsService: ItemsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGrupos();
    this.loadAllItems();
  }

  loadGrupos(): void {
    this.itemsService.getMyGroups().subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        if (grupos.length > 0) {
          this.selectedGroupId = grupos[0]._id;
          this.filterItemsByGroup(this.selectedGroupId);
        }
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
        this.error = 'No se pudieron cargar los grupos';
      }
    });
  }

  loadAllItems(): void {
    this.loading = true;
    this.itemsService.getAllMyItems().subscribe({
      next: (items) => {
        this.items = items;
        // Filtrar solo items disponibles y ocultar insumos agotados
        this.filteredItems = items.filter(item => 
          item.estado === 'Disponible' || 
          (item.esInsumo && item.stock !== undefined && item.stock > 0)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        this.error = 'No se pudieron cargar los items';
        this.loading = false;
      }
    });
  }

  filterItemsByGroup(groupId: string): void {
    this.selectedGroupId = groupId;
    this.loading = true;
    
    this.itemsService.getItemsByGroup(groupId).subscribe({
      next: (items) => {
        // Filtrar solo items disponibles y ocultar insumos agotados
        this.filteredItems = items.filter(item => 
          item.estado === 'Disponible' || 
          (item.esInsumo && item.stock !== undefined && item.stock > 0)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al filtrar items por grupo:', error);
        this.loading = false;
      }
    });
  }

  onRequestItem(item: Item): void {
    // Validar que el item esté disponible
    if (item.estado !== 'Disponible' && !(item.esInsumo && item.stock !== undefined && item.stock > 0)) {
      alert('Este ítem no está disponible actualmente');
      return;
    }

    // Obtener información del propietario (debería venir del backend)
    // Por ahora usamos un placeholder - en producción esto viene del item.propietarioId
    const propietarioTelefono = item.imagenUrl || '5491112345678'; // Placeholder
    
    // Generar el mensaje para WhatsApp
    const currentUser = this.authService.getCurrentUser();
    const mensaje = encodeURIComponent(
      `Hola! Soy ${currentUser?.nombre || 'un usuario'} de "¿Quién tiene? Yo tengo!".\n\n` +
      `Me gustaría pedir prestado: *${item.nombre}*\n` +
      `${item.descripcion ? `Descripción: ${item.descripcion}\n` : ''}` +
      `Categoría: ${item.categoria}\n\n` +
      `¿Podrías facilitarme el acceso? ¡Gracias!`
    );
    
    // Abrir WhatsApp con el número del propietario
    const whatsappUrl = `https://wa.me/${propietarioTelefono}?text=${mensaje}`;
    window.open(whatsappUrl, '_blank');

    // Registrar la solicitud en el backend simultáneamente
    this.registrarSolicitud(item);
  }

  private registrarSolicitud(item: Item): void {
    const solicitudData = {
      itemId: item._id,
      propietarioId: item.propietarioId
    };

    this.itemsService.crearSolicitud(solicitudData).subscribe({
      next: (solicitud) => {
        console.log('Solicitud registrada exitosamente:', solicitud);
        // Actualizar localmente el estado del item a "Pendiente de Aprobación"
        const itemIndex = this.items.findIndex(i => i._id === item._id);
        if (itemIndex !== -1) {
          this.items[itemIndex].estado = 'Pendiente de Aprobación';
          // Actualizar también los items filtrados
          const filteredIndex = this.filteredItems.findIndex(i => i._id === item._id);
          if (filteredIndex !== -1) {
            this.filteredItems[filteredIndex].estado = 'Pendiente de Aprobación';
          }
        }
      },
      error: (error) => {
        console.error('Error al registrar la solicitud:', error);
        // No mostramos alerta al usuario para no interrumpir el flujo de WhatsApp
        // pero registramos el error en consola
      }
    });
  }
}
