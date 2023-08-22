import O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { doNothing } from '../../utility/io';
import { getTorpedoableEnemy } from '../shared';
import { SharkDo } from '../types';
import { torpedoEnemy } from './shared';

export const torpedoAttack: SharkDo = (knowledge) =>
    pipe(
        getTorpedoableEnemy(knowledge.situation),
        O.map(torpedoEnemy(knowledge)),
        O.getOrElse(() => doNothing),
    );