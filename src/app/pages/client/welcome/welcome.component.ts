import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ServerService } from '../../../services/server.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [ApiService],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit {
  joinErrorMessage: string = '';
  roomName: string = '';
  roomCode: string = '';
  errorMessage: string = '';
  myRooms: any[] = []; // Listado de salas creadas por el usuario

  constructor(
    private apiService: ApiService,
    private router: Router,
    private serverService: ServerService
  ) {}

  ngOnInit() {
    this.loadMyRooms();
  }

  logout() {
    this.apiService.logout();
  }

  createRoom() {
    const createRoomDto = { name: this.roomName };

    this.apiService.createRoom(createRoomDto).subscribe({
      next: (room) => {
        this.router.navigate([`/room/${room.code}`]);
      },
      error: (err) => {
        console.error('Error al crear la sala:', err);
        this.errorMessage = 'No se pudo crear la sala. Inténtalo de nuevo.';
      },
    });
  }

  joinRoom() {
    if (!this.roomCode) {
      this.joinErrorMessage = 'Por favor, ingresa un código de sala';
      return;
    }

    this.apiService.joinRoom(this.roomCode).subscribe({
      next: (response) => {
        this.router.navigate([`/room/${this.roomCode}`]);
      },
      error: (err) => {
        console.error('Error al unirse a la sala:', err);
        this.joinErrorMessage = 'No se pudo unir a la sala. Verifica el código e inténtalo de nuevo.';
      }
    });
  }

  // NUEVO: Método para cargar salas propias
  loadMyRooms() {
    this.apiService.getMyRooms().subscribe({
      next: (rooms) => {
        // Filtrar duplicados si llegaran a existir
        this.myRooms = rooms.filter(
          (room, index, self) =>
            index === self.findIndex(r => r.id === room.id)
        );
      },
      error: (err) => {
        console.error('Error al cargar mis salas:', err);
      }
    });
  }
  

  // NUEVO: Editar sala (ir a la sala como propietario)
  editRoom(code: string) {
    this.router.navigate([`/room/${code}`]);
  }

  // NUEVO: Eliminar sala
  deleteRoom(room: any) {
    if (confirm(`¿Seguro que deseas eliminar la sala "${room.name}"?`)) {
      this.apiService.deleteRoom(room.id).subscribe({
        next: () => {
          this.loadMyRooms(); // Refrescar la lista
        },
        error: (err) => {
          console.error('Error al eliminar sala:', err);
        }
      });
    }
  }
}
