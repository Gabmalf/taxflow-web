import { Component } from '@angular/core';
import { Regulation } from '../../core/models/models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regulations',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './regulations.component.html',
  styleUrl: './regulations.component.css'
})
export class RegulationsComponent {
  regulations: Regulation[] = [
    {
      id: '1',
      title: 'Renta de Cuarta Categoría',
      category: 'Ingresos',
      summary: 'Son los ingresos obtenidos por el ejercicio independiente de una profesión, arte, ciencia u oficio.',
      updatedAt: '2026-03-01',
      content: 'Aplica para trabajadores independientes que emiten recibos por honorarios y que estos ingresos se consideran para el cálculo anual del impuesto a la renta.'
    },
    {
      id: '2',
      title: 'Deducción de 7 UIT',
      category: 'Deducciones',
      summary: 'Todos los trabajadores con rentas de trabajo pueden descontar 7 UIT de su renta bruta anual según las reglas tributarias aplicables.',
      updatedAt: '2026-03-01',
      content: 'Esta deducción reduce la base imponible anual y se utiliza antes de aplicar la escala progresiva del impuesto.'
    },
    {
      id: '3',
      title: 'Gastos Deducibles Adicionales 3 UIT',
      category: 'Deducciones',
      summary: 'Permite reducir el impuesto a pagar o generar saldo a favor mediante gastos sustentados.',
      updatedAt: '2026-03-01',
      content: 'Ciertos gastos sustentados con comprobantes válidos pueden ser considerados como deducción adicional hasta un límite referencial de 3 UIT.'
    },
    {
      id: '4',
      title: 'Obligación de Presentar Declaración Anual',
      category: 'Declaración',
      summary: 'Aplica cuando el contribuyente tiene saldo por regularizar, saldo a favor, ingresos que superan determinados topes u otras condiciones tributarias.',
      updatedAt: '2026-03-01',
      content: 'La declaración anual se realiza mediante los canales oficiales de SUNAT y TAXFLOW solo muestra orientación referencial.'
    },
    {
      id: '5',
      title: 'Cronograma de Vencimientos SUNAT',
      category: 'Cronograma',
      summary: 'Las fechas de vencimiento dependen del último dígito del RUC y del periodo tributario.',
      updatedAt: '2026-03-01',
      content: 'El usuario debe revisar sus fechas límite según el último dígito del RUC registrado.'
    }
  ];

  selectedRegulation: Regulation | null = null;

  selectRegulation(reg: Regulation) {
    this.selectedRegulation = reg;
  }
}
