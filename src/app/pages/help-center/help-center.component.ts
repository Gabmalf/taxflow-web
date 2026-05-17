import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.css'
})
export class HelpCenterComponent {
  private http = inject(HttpClient);
  
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

    const payload = {
      asunto: this.formData.asunto,
      categoria: this.formData.categoria,
      mensaje: this.formData.mensaje
    };

    this.http.post('https://le7uyeu46a.execute-api.us-east-1.amazonaws.com/consultas', payload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Tu consulta ha sido guardada en la base de datos. Te responderemos en breve.';
          this.formData = { asunto: '', categoria: 'Deducciones', mensaje: '' };
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Hubo un error al guardar la consulta. Por favor, asegúrate de haber desplegado la Lambda consultas_lambda.py.';
          console.error(err);
        }
      });
  }
}
