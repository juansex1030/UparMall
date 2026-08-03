import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { DataService } from '@shared/services/data.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  providers: [CurrencyPipe],
  template: `
    <div class="analytics-container">
      <div class="analytics-header">
        <div class="h-main">
          <i class="fas fa-chart-line"></i>
          <div>
            <h3>Flujo de Caja y Métricas</h3>
            <p>Trazabilidad de ventas {{ getPeriodText() }}</p>
          </div>
        </div>
        <div class="header-actions" style="display: flex; gap: 15px; align-items: center;">
          <select class="period-select" (change)="onPeriodChange($event)">
            <option value="30d" [selected]="selectedPeriod === '30d'">Últimos 30 días</option>
            <option value="12m" [selected]="selectedPeriod === '12m'">Últimos 12 meses</option>
            <option value="all" [selected]="selectedPeriod === 'all'">Histórico completo</option>
          </select>
          <button class="btn-refresh" (click)="loadStats()" [disabled]="isLoading">
            <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- CARDS DE RESUMEN -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon"><i class="fas fa-wallet"></i></div>
          <div class="stat-info">
            <span class="label">Ingresos Totales</span>
            <h2 class="value">{{ stats?.totalRevenue | currency:'USD':'symbol':'1.0-0' }}</h2>
          </div>
        </div>
        
        <div class="stat-card purple">
          <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
          <div class="stat-info">
            <span class="label">Pedidos Totales</span>
            <h2 class="value">{{ stats?.totalOrders }}</h2>
          </div>
        </div>

        <div class="stat-card emerald">
          <div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>
          <div class="stat-info">
            <span class="label">Ticket Promedio</span>
            <h2 class="value">{{ stats?.averageTicket | currency:'USD':'symbol':'1.0-0' }}</h2>
          </div>
        </div>
      </div>

      <!-- GRÁFICA DE VENTAS -->
      <div class="chart-section">
        <div class="chart-header">
          <h4>{{ selectedPeriod === '30d' ? 'Ventas Diarias ($)' : 'Ventas Mensuales ($)' }}</h4>
          <span class="chart-hint">Ingresos generados por {{ selectedPeriod === '30d' ? 'día' : 'mes' }}</span>
        </div>
        <div class="chart-container">
          <canvas #salesChart></canvas>
        </div>
      </div>

      <!-- NUEVA SECCIÓN: INSIGHTS (PRODUCTOS Y RETENCIÓN) -->
      <div class="insights-grid">
        <!-- TOP PRODUCTOS -->
        <div class="insight-card">
          <div class="insight-header">
            <h4><i class="fas fa-trophy color-orange"></i> Productos Estrella</h4>
            <span class="hint">Los 5 más vendidos</span>
          </div>
          <div class="top-list">
            <div *ngFor="let p of stats?.topProducts; let i = index" class="top-item">
              <div class="item-rank">{{ i + 1 }}</div>
              <div class="item-name">{{ p.name }}</div>
              <div class="item-qty">{{ p.qty }} <small>vendidos</small></div>
            </div>
            <div *ngIf="!stats?.topProducts?.length" class="empty-mini">Sin ventas aún</div>
          </div>
        </div>

        <!-- FIDELIZACIÓN -->
        <div class="insight-card">
          <div class="insight-header">
            <h4><i class="fas fa-users color-indigo"></i> Fidelización</h4>
            <span class="hint">Retención de clientes</span>
          </div>
          <div class="retention-content">
            <div class="retention-main">
              <div class="retention-circle">
                <span class="pct">{{ stats?.retention?.percentage }}%</span>
                <span class="pct-label">Retención</span>
              </div>
              <div class="retention-legend">
                <div class="leg-item">
                  <span class="dot rec"></span>
                  <span class="leg-txt">Recurrentes: <b>{{ stats?.retention?.recurring }}</b></span>
                </div>
                <div class="leg-item">
                  <span class="dot new"></span>
                  <span class="leg-txt">Nuevos: <b>{{ stats?.retention?.new }}</b></span>
                </div>
              </div>
            </div>
            <p class="retention-msg">
              {{ stats?.retention?.percentage > 20 ? '¡Excelente! Tienes una base de clientes fiel.' : 'Sigue trabajando en tu servicio para fidelizar más clientes.' }}
            </p>
          </div>
        </div>
      </div>

      <div class="analytics-footer">
        <div class="alert-info">
          <i class="fas fa-info-circle"></i>
          <span>Los datos se basan en la fecha de creación de los pedidos.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container { /* Full container animation removed in favor of staggers */ }

    .analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .h-main { display: flex; align-items: center; gap: 15px; }
    .h-main i { font-size: 2rem; color: #6366f1; }
    .h-main h3 { margin: 0; font-size: 1.5rem; font-weight: 900; color: #0f172a; }
    .h-main p { margin: 2px 0 0; color: #64748b; font-size: 0.9rem; font-weight: 600; }

    .btn-refresh { 
      padding: 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; 
      font-weight: 800; color: #0f172a; cursor: pointer; display: flex; align-items: center; gap: 10px; 
      transition: background 160ms cubic-bezier(0.23, 1, 0.32, 1), transform 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms ease, border-color 160ms ease;
    }
    .btn-refresh:hover { background: #f8fafc; border-color: #6366f1; color: #6366f1; }
    .btn-refresh:active { transform: scale(0.96); }

    .period-select {
      padding: 10px 40px 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; 
      font-weight: 800; color: #0f172a; cursor: pointer; 
      transition: background 160ms cubic-bezier(0.23, 1, 0.32, 1), transform 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms ease, border-color 160ms ease;
      appearance: none; -webkit-appearance: none; outline: none; font-family: inherit; font-size: 0.9rem;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 15px center; background-size: 12px;
    }
    .period-select:hover, .period-select:focus { 
      background-color: #f8fafc; border-color: #6366f1; color: #6366f1; 
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { 
      background: white; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; 
      display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
      cursor: pointer;
      opacity: 0; transform: translateY(15px);
      animation: cardEnter 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }
    .stat-card:nth-child(1) { animation-delay: 50ms; }
    .stat-card:nth-child(2) { animation-delay: 100ms; }
    .stat-card:nth-child(3) { animation-delay: 150ms; }
    .stat-card:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .stat-card:active { transform: scale(0.97); }
    
    @keyframes cardEnter { to { opacity: 1; transform: translateY(0); } }
    
    .stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .blue .stat-icon { background: #eff6ff; color: #3b82f6; }
    .purple .stat-icon { background: #f5f3ff; color: #8b5cf6; }
    .emerald .stat-icon { background: #f0fdf4; color: #10b981; }

    .stat-info { display: flex; flex-direction: column; }
    .stat-info .label { font-size: 0.75rem; font-weight: 950; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
    .stat-info .value { margin: 2px 0 0; font-size: 1.6rem; font-weight: 950; color: #0f172a; letter-spacing: -0.5px; }

    .chart-section { 
      background: white; padding: 30px; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 30px; 
      opacity: 0; transform: translateY(15px);
      animation: cardEnter 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
      animation-delay: 200ms;
    }
    .chart-header { margin-bottom: 25px; }
    .chart-header h4 { margin: 0; font-size: 1.1rem; font-weight: 900; color: #0f172a; }
    .chart-hint { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
    .chart-container { position: relative; height: 350px; width: 100%; }

    /* INSIGHTS GRID */
    .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .insight-card { 
      background: white; padding: 25px; border-radius: 24px; border: 1px solid #f1f5f9; 
      opacity: 0; transform: translateY(15px);
      animation: cardEnter 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }
    .insight-card:nth-child(1) { animation-delay: 250ms; }
    .insight-card:nth-child(2) { animation-delay: 300ms; }
    .insight-header { margin-bottom: 20px; }
    .insight-header h4 { margin: 0; font-size: 1rem; font-weight: 900; color: #0f172a; display: flex; align-items: center; gap: 10px; }
    .color-orange { color: #f59e0b; }
    .color-indigo { color: #6366f1; }
    .hint { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }

    .top-list { display: flex; flex-direction: column; gap: 12px; }
    .top-item { display: flex; align-items: center; gap: 15px; padding: 10px; border-radius: 12px; background: #f8fafc; transition: 0.2s; }
    .top-item:hover { background: #f1f5f9; }
    .item-rank { width: 28px; height: 28px; background: #0f172a; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; }
    .item-name { flex: 1; font-weight: 800; font-size: 0.9rem; color: #334155; }
    .item-qty { font-weight: 900; color: #0f172a; font-size: 0.95rem; }
    .item-qty small { font-size: 0.7rem; color: #64748b; font-weight: 600; }

    .retention-content { display: flex; flex-direction: column; gap: 20px; }
    .retention-main { display: flex; align-items: center; gap: 30px; }
    .retention-circle { 
      width: 100px; height: 100px; border-radius: 50%; border: 8px solid #f1f5f9; 
      border-top-color: #6366f1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .retention-circle .pct { font-size: 1.4rem; font-weight: 950; color: #0f172a; }
    .retention-circle .pct-label { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; color: #64748b; }
    
    .retention-legend { display: flex; flex-direction: column; gap: 8px; }
    .leg-item { display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.rec { background: #6366f1; }
    .dot.new { background: #f1f5f9; border: 1px solid #e2e8f0; }
    .leg-txt { font-size: 0.85rem; color: #475569; font-weight: 600; }
    .leg-txt b { color: #0f172a; font-weight: 900; }
    .retention-msg { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 700; line-height: 1.4; font-style: italic; }

    .empty-mini { text-align: center; padding: 20px; color: #cbd5e1; font-size: 0.8rem; font-weight: 800; border: 2px dashed #f1f5f9; border-radius: 12px; }

    .analytics-footer { margin-top: 30px; }
    .alert-info { 
      background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px 20px; border-radius: 12px; 
      display: flex; align-items: center; gap: 12px; font-size: 0.85rem; color: #64748b; font-weight: 600;
    }
    .alert-info i { color: #6366f1; font-size: 1.1rem; }

    @media (max-width: 900px) {
      .insights-grid { grid-template-columns: 1fr; }
      .retention-main { flex-direction: column; align-items: flex-start; gap: 20px; }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .chart-container { height: 250px; }
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('salesChart') salesChartCanvas!: ElementRef;
  selectedPeriod: '30d' | '12m' | 'all' = '30d';
  stats: any = null;
  isLoading = true;
  chart: any = null;

  constructor(
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    if (this.stats) {
      this.renderChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  getPeriodText() {
    switch (this.selectedPeriod) {
      case '30d': return 'de los últimos 30 días';
      case '12m': return 'de los últimos 12 meses';
      case 'all': return 'del histórico completo';
      default: return '';
    }
  }

  onPeriodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedPeriod = select.value as any;
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.dataService.getOrderStats(this.selectedPeriod).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        setTimeout(() => this.renderChart(), 0);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.isLoading = false;
      }
    });
  }

  renderChart() {
    if (!isPlatformBrowser(this.platformId) || !this.salesChartCanvas || !this.stats) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
    const dailySales = this.stats.dailySales || [];
    
    if (dailySales.length === 0) {
      console.warn('No hay datos de ventas para graficar');
      return;
    }

    const labels = dailySales.map((s: any) => {
      if (!s.date) return '';
      
      const parts = s.date.split('-');
      if (this.selectedPeriod === '30d' && parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      } else if (parts.length >= 2) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      }
      return s.date;
    });
    const values = dailySales.map((s: any) => s.total || 0);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas ($)',
          data: values,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y || 0;
                return `Ventas: $${val.toLocaleString('es-CO')}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (value) => '$' + value.toLocaleString('es-CO'),
              font: { weight: 'bold' }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { weight: 'bold' } }
          }
        }
      }
    });
  }
}
