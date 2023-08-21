import { Observable, from } from 'rxjs';
import { retry } from 'rxjs/operators';
import { Socket } from 'socket.io-client';
import { arenaId, baseUrl } from '../config';
import { ArenaSettings } from './arena';
import { BeatUpdate, ClientToServerEvents, ServerToClientEvents } from './gameplay';

export type Game = {
    arenaSettings: Observable<ArenaSettings>,
    updates: Observable<BeatUpdate>,
};

type CreateGame = (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => Game;

const getArenaSettings = async () => {
    const result = await fetch(`${baseUrl}/arena/${arenaId}/settings`);
    const body = await result.json();
    return body as ArenaSettings;
}

export const createGame: CreateGame = (socket) => ({
    arenaSettings: from(getArenaSettings()).pipe(retry()),
    updates: new Observable<BeatUpdate>(subscribe => {
        socket.on('beatUpdate', subscribe.next);
        return () => {
            console.log('unsubscribing from beat updates.');
            socket.off('beatUpdate', subscribe.next);
        };
    }),
});