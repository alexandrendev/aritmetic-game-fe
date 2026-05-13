import { Injectable, inject } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { API_BASE_URL } from '../auth/auth.storage';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private pusher: Pusher;
  private apiUrl = inject(API_BASE_URL);

  constructor() {
    // Inicializa o Pusher apenas com Key e Cluster (NUNCA com o secret)
    this.pusher = new Pusher('8c093a5fd88fb7eb8e41', {
      cluster: 'sa1',
      // Endpoint de autenticação do backend para canais private-*
      authEndpoint: `${this.apiUrl}/api/pusher/auth`, 
      auth: {
        headers: {
          // Pega o token salvo para o Host (Guests podem não ter, ajuste a lógica se necessário no backend)
          Authorization: `Bearer ${localStorage.getItem('math-game-access-token')}`
        }
      }
    });

    // Habilita logs no console apenas em desenvolvimento para facilitar o debug
    Pusher.logToConsole = true;
  }

  /**
   * Inscreve em um canal do Pusher
   */
  public subscribeToChannel(channelName: string): Channel {
    return this.pusher.subscribe(channelName);
  }

  /**
   * Desinscreve de um canal do Pusher
   */
  public unsubscribe(channelName: string): void {
    this.pusher.unsubscribe(channelName);
  }
}