import { flatMap, map, tap } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';
import { io } from 'socket.io-client';
import { createApi } from './api';
import { startShark } from './brain';
import { baseUrl } from './config';

const main = pipe(
    () => io(baseUrl),
    tap(socket => () => {
        socket.on('connect', () => console.log('connected!!!!'));
        socket.connect();
    }),
    map(createApi),
    tap(({ shark }) => shark.takeControl),
    flatMap(startShark)
);

main();
