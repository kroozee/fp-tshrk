import O from 'fp-ts/Option';
import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { getTorpedoableEnemy } from '../shared';
import { EnemyShark, SharkDo, SharkKnowledge } from '../types';
import { doNothing, laserEnemy, torpedoEnemy } from './shared';

const iWantEveryGunWeHaveToFireOnThatMan = (enemy: EnemyShark) =>
    pipe(
        laserEnemy(enemy),
        R.flatMap(() => torpedoEnemy(enemy))
    );

export const finishHim: SharkDo =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            situation,
            getTorpedoableEnemy,
            O.map(iWantEveryGunWeHaveToFireOnThatMan),
            O.getOrElse(() => doNothing),
        ))
    );