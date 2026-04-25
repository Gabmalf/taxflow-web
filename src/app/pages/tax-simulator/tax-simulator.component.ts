import { Component, inject, OnInit } from '@angular/core';
import { TaxSimulationResult } from '../../core/models/models';
import { TaxCalculatorService } from '../../core/services/tax-calculator.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tax-simulator',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tax-simulator.component.html',
  styleUrl: './tax-simulator.component.css'
})
export class TaxSimulatorComponent implements OnInit {
  result!: TaxSimulationResult;
  private taxService = inject(TaxCalculatorService);

  uit = this.taxService.UIT;

  ngOnInit() {
    this.runSimulation();
  }

  runSimulation() {
    this.result = this.taxService.simulate();
  }
}
