import { Injectable, inject } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { API_BASE_URL, ACCESS_TOKEN_KEY } from '../auth/auth.storage';
import { environment } from '../../../environments/environment';

const GUEST_SESSION_ID_KEY = 'guest-session-id';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private pusher: Pusher;
  private readonly apiUrl = inject(API_BASE_URL);

  constructor() {
    const apiUrl = this.apiUrl;

    this.pusher = new Pusher(environment.pusherKey, {
      cluster: environment.pusherCluster,
      // authorizer é chamado a cada tentativa de auth — lê o token no momento certo,
      // não uma vez no construtor
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          const token = localStorage.getItem(ACCESS_TOKEN_KEY);

          const guestSessionId = localStorage.getItem(GUEST_SESSION_ID_KEY);
          const extraBody = token
            ? ''
            : guestSessionId
              ? `&guest_session_id=${encodeURIComponent(guestSessionId)}`
              : '';

          fetch(`${apiUrl}/api/pusher/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channel.name)}${extraBody}`,
          })
            .then((res) => {
              if (!res.ok) throw new Error(`Pusher auth failed: ${res.status}`);
              return res.json();
            })
            .then((data) => callback(null, data))
            .catch((err) => callback(err, { auth: '' }));
        },
      }),
    });

    Pusher.logToConsole = true;
  }

  public subscribeToChannel(channelName: string): Channel {
    return this.pusher.subscribe(channelName);
  }

  public unsubscribe(channelName: string): void {
    this.pusher.unsubscribe(channelName);
  }
}
