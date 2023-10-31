import O from 'fp-ts/Option';
import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { getEnemyNearestToDeath } from '../shared';
import { SharkDo, SharkKnowledge } from '../types';
import { doNothing, laserEnemy } from './shared';

export const laserAttack: SharkDo =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            getEnemyNearestToDeath(situation),
            O.match(() => doNothing, laserEnemy)
        ))
    );