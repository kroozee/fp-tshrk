import O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { doNothing } from '../../utility/io';
import { getEnemyNearestToDeath } from '../shared';
import { SharkDo } from '../types';
import { laserEnemy } from './shared';

export const laserAttack: SharkDo = (knowledge) =>
    pipe(
        getEnemyNearestToDeath(knowledge.situation),
        O.map(laserEnemy(knowledge)),
        O.getOrElse(() => doNothing),
    );