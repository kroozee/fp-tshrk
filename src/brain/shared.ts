import IO from 'fp-ts/lib/IO';
import { pipe } from 'fp-ts/lib/function';
import { Shark } from '../api/shark';
import { sharkSettings } from '../config';
import { getAngleToPoint } from '../utility/math';
import { SharkKnowledge } from './types';

export const doNothing: IO.IO<void> = () => {};

export const goForward = (shark: Shark): IO.IO<void> =>
    () => shark.setFinSpeed(sharkSettings.forwardSpeed, sharkSettings.forwardSpeed);

export const stop = (shark: Shark): IO.IO<void> =>
    () => shark.setFinSpeed(0, 0);

export const turn = (shark: Shark) => (direction: 'port' | 'starboard'): IO.IO<void> =>
    direction === 'port'
        ? () => shark.setFinSpeed(-sharkSettings.turnSpeed, sharkSettings.turnSpeed)
        : () => shark.setFinSpeed(sharkSettings.turnSpeed, -sharkSettings.turnSpeed);

export const narrowScanCenter = ({ shark, situation }: SharkKnowledge): IO.IO<void> =>
    pipe(
        situation,
        ({ arenaSettings, position }) => getAngleToPoint([arenaSettings.dimensions.width / 2, arenaSettings.dimensions.height / 2])(position),
        angle => () => shark.performNarrowScan(angle)
    );