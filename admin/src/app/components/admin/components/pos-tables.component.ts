import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '@shared/services/data.service';
import { Table, Product, Settings } from '@shared/models/models';
import { PosOrderModalComponent } from './pos-order-modal.component';

@Component({
  selector: 'app-pos-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, PosOrderModalComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">Plano de Mesas (POS)</h2>
          <p class="text-neutral-500 text-sm mt-1">Gestiona las mesas y toma pedidos</p>
        </div>
        <button (click)="openAddTablePrompt()" class="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm">
          Añadir Mesa
        </button>
      </div>

      <!-- Grid de Mesas -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div *ngFor="let table of tables" 
             (click)="selectTable(table)"
             class="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all"
             [ngClass]="{
               'border-green-500': table.status === 'free',
               'border-red-500': table.status === 'occupied',
               'border-orange-500': table.status === 'pending_payment'
             }">
          
          <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               [ngClass]="{
                 'bg-green-100 text-green-600': table.status === 'free',
                 'bg-red-100 text-red-600': table.status === 'occupied',
                 'bg-orange-100 text-orange-600': table.status === 'pending_payment'
               }">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6m-16.5 0v12m16.5-12v12m-16.5 0A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18m-16.5 0h16.5" />
            </svg>
          </div>
          
          <h3 class="text-lg font-bold text-neutral-900">{{ table.name }}</h3>
          
          <span class="mt-2 text-xs font-semibold px-2 py-1 rounded-full uppercase"
                [ngClass]="{
                  'bg-green-100 text-green-700': table.status === 'free',
                  'bg-red-100 text-red-700': table.status === 'occupied',
                  'bg-orange-100 text-orange-700': table.status === 'pending_payment'
                }">
            {{ getStatusText(table.status) }}
          </span>
          
          <button (click)="deleteTable($event, table.id)" class="absolute top-2 right-2 text-neutral-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div *ngIf="tables.length === 0" class="col-span-full py-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200 border-dashed">
          No hay mesas configuradas. Haz clic en "Añadir Mesa" para comenzar.
        </div>
      </div>

      <!-- POS Order Modal -->
      <app-pos-order-modal 
        *ngIf="selectedTableForOrder"
        [table]="selectedTableForOrder"
        [products]="products"
        [settings]="settings"
        (close)="onModalClose($event)">
      </app-pos-order-modal>
    </div>
  `
})
export class PosTablesComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() settings!: Settings;
  
  tables: Table[] = [];
  selectedTableForOrder: Table | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.dataService.getTables().subscribe({
      next: (data) => this.tables = data,
      error: (err) => console.error('Error cargando mesas', err)
    });
  }

  getStatusText(status: string) {
    if (status === 'free') return 'Libre';
    if (status === 'occupied') return 'Ocupada';
    if (status === 'pending_payment') return 'Por pagar';
    return status;
  }

  openAddTablePrompt() {
    const name = prompt('Ingresa el nombre de la mesa (Ej: Mesa 1, Barra 2):');
    if (name && name.trim()) {
      this.dataService.createTable(name.trim()).subscribe({
        next: () => this.loadTables(),
        error: () => alert('Error al crear la mesa')
      });
    }
  }

  deleteTable(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('¿Eliminar esta mesa?')) {
      this.dataService.deleteTable(id).subscribe({
        next: () => this.loadTables(),
        error: () => alert('Error al eliminar')
      });
    }
  }

  selectTable(table: Table) {
    this.selectedTableForOrder = table;
  }

  onModalClose(changed: boolean) {
    this.selectedTableForOrder = null;
    if (changed) {
      this.loadTables(); // Refresh tables to show updated status
    }
  }
}
