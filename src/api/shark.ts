import { IO } from 'fp-ts/IO';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { Angle, ArenaId, ClientToServerEvents, CommandUpdate, ServerToClientEvents, SharkId, SharkMode } from './gameplay';

export type Shark = {
    takeControl: IO<void>,
    setFinSpeed: (port: number, starboard: number) => IO<void>,
    setSharkMode: (mode: SharkMode) => IO<void>,
    performWideScan: IO<void>,
    performNarrowScan: (direction: Angle) => IO<void>,
    fireTorpedo: (direction: Angle) => IO<void>,
    fireLaser: IO<void>,
};

export type CreateShark = (socket: Socket<ServerToClientEvents, ClientToServerEvents>, arenaId: ArenaId, playerId: SharkId) => Shark;

const ignore = (...params: unknown[]) => {};
export const createShark: CreateShark = (socket, arenaId, playerId) => ({
    takeControl: () =>
        socket.emit(
            'takeControl',
            arenaId,
            playerId,
            ignore),
    setFinSpeed: (portSpeed: number, starboardSpeed: number) => () =>
        socket.emit(
            'setFinSpeed',
            arenaId,
            playerId,
            portSpeed, 
            starboardSpeed,
            ignore),
    setSharkMode: (mode: SharkMode) =>  () =>
        socket.emit(
            'setSharkMode',
            arenaId,
            playerId,
            mode,
            ignore),
    performWideScan: () =>
        socket.emit(
            'performWideScan',
            arenaId,
            playerId,
            ignore),
    performNarrowScan: (angle: number) => () =>
        socket.emit(
            'performNarrowScan',
            arenaId,
            playerId,
            angle,
            ignore),
    fireTorpedo: (angle: number) => () =>
        socket.emit(
            'fireTorpedo',
            arenaId,
            playerId,
            angle,
            ignore),
    fireLaser: () =>
        socket.emit(
            'fireLaser',
            arenaId,
            playerId,
            ignore),
});

const createSharkOld = (socket: any, arenaId: any, playerId: any) => ({
    takeControl: () => {
        const updates = new Subject<CommandUpdate>();
        socket.emit('takeControl', arenaId, playerId, updates.next);
        return updates;
    },
    setFinSpeed: (portSpeed: number, starboardSpeed: number) => {
        const updates = new Subject<CommandUpdate>();
        socket.emit(
            'setFinSpeed',
            arenaId,
            playerId,
            portSpeed, 
            starboardSpeed,
            updates.next);
            return updates;
    },
    setSharkMode: (mode: SharkMode) => {
        const updates = new Subject<CommandUpdate>();
        socket.emit(
            'setSharkMode',
            arenaId,
            playerId,
            mode,
            updates.next);
            return updates;
    },
    performWideScan: () => {
        const updates = new Subject<CommandUpdate>();
        socket.emit(
            'performWideScan',
            arenaId,
            playerId,
            updates.next);
            return updates;
    },
    performNarrowScan: (angle: number) => {
        const updates = new Subject<CommandUpdate>();
        socket.emit(
            'performNarrowScan',
            arenaId,
            playerId,
            angle,
            updates.next);
            return updates;
    },
    fireTorpedo: (angle: number) => {
        const updates = new Subject<CommandUpdate>();
        socket.emit(
            'fireTorpedo',
            arenaId,
            playerId,
            angle,
            updates.next);
            return updates;
    },
    fireLaser: () => {
        const updates = new Subject<CommandUpdate>();
        socket.emit(
            'fireLaser',
            arenaId,
            playerId,
            updates.next);
            return updates;
    },
});