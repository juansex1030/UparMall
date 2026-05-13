import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './shared/services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  platformSettings: any = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getPlatformSettings().subscribe({
      next: (res) => this.platformSettings = res,
      error: (err) => console.error('Error fetching global settings', err)
    });
  }
}
