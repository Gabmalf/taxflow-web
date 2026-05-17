import { Component, OnInit, inject } from '@angular/core';
import { Regulation } from '../../core/models/models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegulationService } from '../../core/services/regulation.service';

@Component({
  selector: 'app-regulations',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './regulations.component.html',
  styleUrl: './regulations.component.css'
})
export class RegulationsComponent implements OnInit {
  private regulationService = inject(RegulationService);
  
  regulations: Regulation[] = [];
  selectedRegulation: Regulation | null = null;

  ngOnInit() {
    this.regulationService.getRegulations().subscribe({
      next: (data) => {
        const backendRegs = data.map(item => {
          const titleLower = item.titulo.toLowerCase();
          let cat = 'Normativa';
          let fullContent = item.contenido || '';

          if (titleLower.includes('cronograma')) {
            cat = 'Cronograma';
            fullContent = `Resolución de Superintendencia que aprueba el cronograma para la declaración y pago de obligaciones tributarias mensuales.

Cronograma General según Último Dígito del RUC:
- Dígito 0: Día 14 del mes siguiente
- Dígito 1: Día 15 del mes siguiente
- Dígitos 2 y 3: Día 16 del mes siguiente
- Dígitos 4 y 5: Día 17 del mes siguiente
- Dígitos 6 y 7: Día 18 del mes siguiente
- Dígitos 8 y 9: Día 19 del mes siguiente

Restricciones y Excepciones:
- Los contribuyentes considerados como "Buenos Contribuyentes" cuentan con fechas especiales de pago al final del cronograma.
- Si la fecha límite coincide con un fin de semana o día feriado, el vencimiento se traslada al siguiente día hábil.`;
          } else if (titleLower.includes('uit')) {
            fullContent = `Aprobación del nuevo valor de la Unidad Impositiva Tributaria (UIT) por el Ministerio de Economía y Finanzas (MEF).

Monto Aplicable:
- El valor oficial para el ejercicio 2026 es de S/ 5,500.

Reglas y Restricciones:
- Deducción legal obligatoria (7 UIT): S/ 38,500 para rentas de cuarta y quinta categoría.
- Deducción adicional de gastos sustentados (hasta 3 UIT): S/ 16,500.
- El valor de la UIT se utiliza de manera retroactiva desde el 1 de enero para el cálculo de multas, sanciones e infracciones tributarias.`;
          }

          return {
            id: item.id.toString(),
            title: item.titulo,
            category: cat,
            summary: fullContent.substring(0, 110) + '...',
            updatedAt: item.fecha_publicacion || '2026-01-01',
            content: fullContent
          };
        });

        const extraRegs: Regulation[] = [
          {
            id: 'extra-4ta',
            title: 'Retención de Cuarta Categoría (Independientes)',
            category: 'Normativa',
            summary: 'Disposiciones sobre la retención del 8% y la suspensión de retenciones para trabajadores independientes...',
            updatedAt: '2026-01-15',
            content: `Normativa aplicable para las rentas de trabajo independiente (Cuarta Categoría).

Monto Aplicable y Retenciones:
- Se aplica una retención automática del 8% sobre todo recibo por honorarios que se emita por un monto superior a S/ 1,500.00 en un solo pago.

Suspensión de Retenciones:
- Se puede solicitar la suspensión de cuarta categoría si los ingresos anuales proyectados no superan el límite referencial establecido por SUNAT (aprox. S/ 45,063).
- Una vez autorizada la suspensión, el contribuyente no sufrirá la retención del 8% aunque emita recibos mayores a S/ 1,500.`
          },
          {
            id: 'extra-5ta',
            title: 'Retención de Quinta Categoría (Dependientes)',
            category: 'Normativa',
            summary: 'Reglas para el cálculo y retención mensual aplicable a trabajadores formales en planilla...',
            updatedAt: '2026-01-15',
            content: `Normativa aplicable para las rentas de trabajo dependiente (Quinta Categoría).

Obligaciones del Empleador:
- El empleador es el agente retenedor. Es el responsable exclusivo de calcular y descontar el impuesto de la remuneración mensual del trabajador.

Cálculo y Metodología:
- Se proyectan los ingresos anuales del trabajador (sueldos, gratificaciones, utilidades, bonos).
- Se realiza la deducción de las 7 UIT.
- Al monto resultante se le aplican los tramos progresivos del Impuesto a la Renta (8%, 14%, 17%, 20% y 30%).
- El impuesto anual estimado se divide entre los meses restantes del año para obtener la cuota de retención mensual.`
          }
        ];

        this.regulations = [...backendRegs, ...extraRegs];
      },
      error: (err) => console.error('Error fetching regulations', err)
    });
  }

  selectRegulation(reg: Regulation) {
    this.selectedRegulation = reg;
  }
}
