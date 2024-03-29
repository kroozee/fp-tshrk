import { flatMap, map, of, tap } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';
import { io } from 'socket.io-client';
import { createApi } from './api';
import { startShark } from './brain';
import { arenaId, baseUrl, sharkId } from './config';

const main = pipe(
    of(io(baseUrl)),
    tap(socket => () => {
        console.log('connecting...', { baseUrl, arenaId, sharkId });
        socket.on('connect', () => console.log('connected!!!!'));
        socket.on('connect_error', (e) => console.log('e!!!!', e));
        socket.connect();
    }),
    map(createApi),
    tap(({ shark }) => shark.takeControl),
    flatMap(startShark)
);

main();
