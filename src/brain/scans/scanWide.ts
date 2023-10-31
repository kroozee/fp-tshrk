import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { SharkDo, SharkKnowledge } from '../types';

export const scanWide: SharkDo =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMapIO(({ shark }) => shark.performWideScan),
    );
