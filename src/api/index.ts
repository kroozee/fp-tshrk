import { Socket } from 'socket.io-client';
import { arenaId, sharkId } from '../config';
import { Game, createGame } from './game';
import { ClientToServerEvents, ServerToClientEvents } from './gameplay';
import { Shark, createShark } from './shark';

export * from './arena';
export * from './gameplay';

export type Api = {
    game: Game,
    shark: Shark,
};

export const createApi = (socket: Socket<ServerToClientEvents, ClientToServerEvents>): Api => ({
    game: createGame(socket),
    shark: createShark(socket, arenaId, sharkId)
});