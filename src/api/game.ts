import { Observable, from } from 'rxjs';
import { retry, share, shareReplay, tap } from 'rxjs/operators';
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
    console.log('getting arena settings.')
    const result = await fetch(`${baseUrl}/arena/${arenaId}/settings`);
    const body = await result.json();
    return body as ArenaSettings;
}

export const createGame: CreateGame = (socket) => ({
    arenaSettings: from(getArenaSettings()).pipe(
        retry(),
        tap(arenaSettings => console.log({ arenaSettings })),
        shareReplay(1)),
    updates: new Observable<BeatUpdate>(subscribe => {
        console.log('subscribing to beat updates.');
        socket.on('beatUpdate', u => subscribe.next(u));
        return () => {
            console.log('unsubscribing from beat updates.');
            socket.off('beatUpdate', u => subscribe.next(u));
        };
    }).pipe(tap(beatUpdate => console.log({ beatUpdate })), share()),
});