import O from 'fp-ts/Option';
import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { SharkDo, SharkKnowledge } from '../types';
import { scanCenter } from './scanCenter';
import { scanWide } from './scanWide';

export const alternate: SharkDo =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            situation.memory,
            O.filter(memory => memory.lastScanType === 'wide'),
            O.map(() => scanWide),
            O.getOrElse(() => scanCenter)))
    );