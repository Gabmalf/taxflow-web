import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-declaration-guide',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './declaration-guide.component.html',
  styleUrl: './declaration-guide.component.css'
})
export class DeclarationGuideComponent {
  steps = [
    { num: 1, title: 'Verificar datos personales y RUC', desc: 'Asegúrate de que tu información en Mi Perfil sea correcta.', link: '/profile', external: false },
    { num: 2, title: 'Registrar ingresos', desc: 'Ingresa todos tus recibos por honorarios o boletas de pago del año.', link: '/incomes', external: false },
    { num: 3, title: 'Registrar gastos deducibles', desc: 'Sube tus facturas, boletas y recibos de los gastos válidos.', link: '/expenses', external: false },
    { num: 4, title: 'Revisar comprobantes', desc: 'Verifica que los RUC de proveedores sean válidos y correspondan a gastos deducibles.', link: '/expenses', external: false },
    { num: 5, title: 'Ejecutar simulación tributaria', desc: 'Calcula tu impuesto estimado usando nuestro simulador.', link: '/tax-simulator', external: false },
    { num: 6, title: 'Revisar calendario SUNAT', desc: 'Conoce tu fecha límite para declarar según el último dígito de tu RUC.', link: '/tax-calendar', external: false },
    { num: 7, title: 'Consultar normativa tributaria', desc: 'Revisa las reglas y condiciones de la SUNAT.', link: '/regulations', external: false }
  ];
}
