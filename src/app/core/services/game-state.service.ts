import { Injectable, signal, inject } from '@angular/core';
import { PusherService } from './pusher.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private pusherService = inject(PusherService);
  private gameService = inject(GameService);

  // Estado Reativo (Signals)
  public session = signal<any>(null);
  public round = signal<number>(0);
  public currentQuestion = signal<any>(null);
  public participants = signal<any[]>([]);
  public ranking = signal<any[]>([]);
  public isGameOver = signal<boolean>(false);

  /**
   * Conecta no canal privado da sessão e mapeia os eventos para os Signals
   */
  public connectToSession(sessionId: number, resetState = true) {
    if (resetState) {
      this.session.set(null);
      this.participants.set([]);
      this.isGameOver.set(false);
    }

    const channel = this.pusherService.subscribeToChannel(`private-game-session-${sessionId}`);

    // Jogo Iniciado
    channel.bind('game.session.started', (data: any) => {
      this.session.set(data.session);
      this.round.set(data.round);
      this.currentQuestion.set(data.question);
      this.isGameOver.set(false);
      if (Array.isArray(data.participants)) {
        this.participants.set(data.participants);
      }
    });

    // Nova Rodada e Nova Questão
    channel.bind('game.round.started', (data: any) => {
      this.round.set(data.round);
    });

    channel.bind('game.question.generated', (data: any) => {
      this.currentQuestion.set(data.question);
    });

    // Atualização de Participante (Respostas, perda de vidas, etc)
    channel.bind('game.participant.updated', (data: any) => this.upsertParticipant(data.participant));
    channel.bind('game.participant.eliminated', (data: any) => this.upsertParticipant(data.participant));

    // Rodada Finalizada (Timeout ou todos responderam)
    channel.bind('game.round.finished', (data: any) => {
      this.currentQuestion.set(null);
      const summary = data.roundSummary;
      if (summary?.participants && Array.isArray(summary.participants)) {
        summary.participants.forEach((p: any) => this.upsertParticipant(p));
      }
    });

    // Fim de Jogo
    channel.bind('game.session.finished', (data: any) => {
      this.session.set(data.session);
      this.ranking.set(data.ranking);
      this.currentQuestion.set(null);
      this.isGameOver.set(true);
    });
  }

  public disconnect(sessionId: number) {
    this.pusherService.unsubscribe(`private-game-session-${sessionId}`);
  }

  private upsertParticipant(participant: any) {
    this.participants.update(list => {
      const index = list.findIndex(p => p.id === participant.id);
      if (index > -1) {
        const newList = [...list];
        newList[index] = participant;
        return newList;
      }
      return [...list, participant];
    });
  }
}