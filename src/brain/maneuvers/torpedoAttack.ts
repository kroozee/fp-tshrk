import O from 'fp-ts/Option';
import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { getTorpedoableEnemy } from '../shared';
import { SharkDo, SharkKnowledge } from '../types';
import { doNothing, torpedoEnemy } from './shared';

export const torpedoAttack: SharkDo =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            getTorpedoableEnemy(situation),
            O.match(() => doNothing, torpedoEnemy)
        ))
    );