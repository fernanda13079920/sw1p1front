import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerService } from '../../services/server.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.css'
})
export class NavegationComponent implements OnInit {
  roomCode: string = ''; // Código de la sala que obtenemos de la URL
  roomName: string = ''; // Nombre de la sala que obtenemos del backend
  errorMessage: string = ''; // Para manejar errores
  usersInRoom: any[] = []; // Almacena los usuarios que se unen
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private serverService: ServerService,
    private router: Router,
    private http: HttpClient
  ) { }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('code') || '';
  }
  // Método para salir de la sala
  leaveRoom() {
    this.serverService.leaveRoom(this.roomCode);

    // Escuchar el evento cuando el usuario ha salido correctamente
    this.serverService.onLeftRoom().subscribe({
      next: () => {
        console.log(`Saliste de la sala ${this.roomCode}`);
        this.router.navigate(['/client']); // Redirigir
      },
      error: (err) => {
        console.error('Error al salir de la sala:', err);
        this.errorMessage = 'No se pudo salir de la sala.';
      },
    });
  }

  downloadAngularProject() {
    if (!this.roomCode) return;
  
    const url = `http://localhost:3000/api/export/angular/${this.roomCode}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `proyecto-${this.roomCode}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  
  scanAndDrawOcrDesign() {
    const url = `http://localhost:3000/api/ocr/scan/${this.roomCode}`;
    window.open(url, '_blank'); // o realiza una petición POST con HttpClient
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.roomCode) return;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomCode', this.roomCode);
  
    this.http.post(`http://localhost:3000/api/ocr/analyze`, formData).subscribe({
      next: (res: any) => {
        console.log('OCR terminado:', res);
        alert('Diseño generado desde imagen');
  
        // 🚀 Aquí recargamos automáticamente los nuevos componentes:
        this.serverService.joinRoom(this.roomCode); 
        // Esto vuelve a pedir el canvas actualizado
      },
      error: (err) => {
        console.error('Error al subir la imagen OCR:', err);
        alert('Hubo un error al analizar la imagen');
      },
    });
  }
}