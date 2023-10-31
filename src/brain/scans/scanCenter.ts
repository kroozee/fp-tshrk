import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { getAngleToPoint } from '../../utility/math';
import { SharkDo, SharkKnowledge } from '../types';

export const scanCenter: SharkDo =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMapIO(({ shark, situation }) => pipe(
            situation.position,
            getAngleToPoint([situation.arenaSettings.dimensions.width / 2, situation.arenaSettings.dimensions.height / 2]),
            shark.performNarrowScan)),
    );
