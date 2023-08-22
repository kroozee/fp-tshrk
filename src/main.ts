import { flatMap, map, tap } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';
import { io } from 'socket.io-client';
import { createApi } from './api';
import { startShark } from './brain';
import { baseUrl } from './config';

const main = pipe(
    () => io(baseUrl),
    tap(socket => () => {
        console.log('connecting...');
        socket.on('connect', () => console.log('connected!!!!'));
        socket.on('error', (e) => console.log('e!!!!', e));
        socket.connect();
    }),
    map(createApi),
    tap(({ shark }) => shark.takeControl),
    flatMap(startShark)
);

main();
