import * as A from 'fp-ts/Array';
import O from 'fp-ts/Option';
import Ord from 'fp-ts/Ord';
import { pipe } from 'fp-ts/function';
import N from 'fp-ts/number';
import { SharkHealthStatus } from '../api';
import { sharkSettings } from '../config';
import { getDistanceBetweenPoints } from '../utility/math';
import { EnemyShark, Situation } from './types';

export const sharkHealthSeverity: Record<SharkHealthStatus, number> = {
    healthy: 0,
    crippled: 1,
    immobilized: 2,
};

const getByClosestOrd = (situation: Situation) =>
    pipe(
        N.Ord,
        Ord.contramap((enemy: EnemyShark) => getDistanceBetweenPoints(situation.position)(enemy.position)),
    );

export const getClosestEnemy = (situation: Situation) =>
    pipe(
        situation.recentlyScannedEnemies,
        pipe(
            situation,
            getByClosestOrd,
            A.sort
        ),
        A.head,
    );

export const getTorpedoableEnemy = (situation: Situation) =>
    pipe(
        situation,
        getClosestEnemy,
        O.filter(closest => getDistanceBetweenPoints(situation.position)(closest.position) <= sharkSettings.maxTorpedoDistance),
    );

const byNearestToDeath =
    pipe(
        N.Ord,
        Ord.contramap((enemy: EnemyShark) => sharkHealthSeverity[enemy.healthStatus]),
        Ord.reverse,
    );

export const getEnemyNearestToDeath = (situation: Situation) =>
    pipe(
        situation.recentlyScannedEnemies,
        A.sort(byNearestToDeath),
        A.head,
    );