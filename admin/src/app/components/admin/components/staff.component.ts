import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '@shared/services/data.service';
import { Staff } from '@shared/models/models';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">Personal</h2>
          <p class="text-neutral-500 text-sm mt-1">Gestiona los meseros y cocineros de tu restaurante</p>
        </div>
        <button (click)="openAddForm()" class="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm">
          Añadir Empleado
        </button>
      </div>

      <div *ngIf="showForm" class="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 max-w-2xl">
        <h3 class="text-lg font-semibold mb-4">Nuevo Empleado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
            <input type="text" [(ngModel)]="currentStaff.name" class="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none" placeholder="Ej: Juan Pérez">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Rol</label>
            <select [(ngModel)]="currentStaff.role" class="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none">
              <option value="WAITER">Mesero</option>
              <option value="KITCHEN">Cocina</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">PIN de Acceso (4 dígitos)</label>
            <input type="text" maxlength="4" [(ngModel)]="currentStaff.pin_code" class="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all outline-none" placeholder="Ej: 1234">
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button (click)="closeForm()" class="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-xl transition-colors">Cancelar</button>
          <button (click)="saveStaff()" [disabled]="!isValid() || isSaving" class="px-4 py-2 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-neutral-200/60 bg-neutral-50/50">
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200/60">
            <tr *ngFor="let person of staffList" class="hover:bg-neutral-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-neutral-900">{{ person.name }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      [ngClass]="{'bg-blue-100 text-blue-800': person.role === 'WAITER', 'bg-orange-100 text-orange-800': person.role === 'KITCHEN', 'bg-purple-100 text-purple-800': person.role === 'ADMIN'}">
                  {{ person.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button (click)="deleteStaff(person.id)" class="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="staffList.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-neutral-500">
                No hay empleados registrados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StaffComponent implements OnInit {
  staffList: Staff[] = [];
  showForm = false;
  isSaving = false;
  currentStaff: Partial<Staff> = { name: '', role: 'WAITER', pin_code: '' };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.dataService.getStaff().subscribe({
      next: (data) => this.staffList = data,
      error: (err) => console.error('Error cargando personal', err)
    });
  }

  openAddForm() {
    this.currentStaff = { name: '', role: 'WAITER', pin_code: '' };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  isValid() {
    return !!(this.currentStaff.name && this.currentStaff.role && this.currentStaff.pin_code && this.currentStaff.pin_code.length === 4);
  }

  saveStaff() {
    if (!this.isValid()) return;
    this.isSaving = true;
    this.dataService.createStaff(this.currentStaff).subscribe({
      next: () => {
        this.loadStaff();
        this.closeForm();
        this.isSaving = false;
      },
      error: () => {
        alert('Error al guardar');
        this.isSaving = false;
      }
    });
  }

  deleteStaff(id: string) {
    if (confirm('¿Eliminar este empleado?')) {
      this.dataService.deleteStaff(id).subscribe({
        next: () => this.loadStaff(),
        error: () => alert('Error al eliminar')
      });
    }
  }
}
