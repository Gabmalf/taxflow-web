import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultationService } from '../../core/services/consultation.service';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.css'
})
export class HelpCenterComponent {
  private consultationService = inject(ConsultationService);
  
  formData = {
    asunto: '',
    categoria: 'Deducciones',
    mensaje: ''
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  submitQuery() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.consultationService.submitConsultation(this.formData)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message || 'Tu consulta ha sido guardada correctamente. Te responderemos en breve.';
          this.formData = { asunto: '', categoria: 'Deducciones', mensaje: '' };
        },
        error: (err) => {
          this.isLoading = false;
          const serverMsg = err.error?.message;
          this.errorMessage = serverMsg 
            ? `Error: ${serverMsg}` 
            : 'Hubo un error al enviar la consulta. Verifica tu conexión e intenta de nuevo.';
          console.error('Error en consulta:', err);
        }
      });
  }
}
