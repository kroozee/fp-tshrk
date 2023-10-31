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

const getEnemies = (situation: Situation) =>
    pipe(
        situation.memory,
        O.map(memory => memory.enemies),
        O.getOrElse(() => [] as EnemyShark[])
    );

const sortEnemiesByClosest = (situation: Situation) =>
    pipe(
        N.Ord,
        Ord.contramap((enemy: EnemyShark) => getDistanceBetweenPoints(situation.position)(enemy.position)),
        A.sort
    );

export const getClosestEnemy = (situation: Situation) =>
    pipe(
        situation,
        getEnemies,
        sortEnemiesByClosest(situation),
        A.head,
    );

export const getTorpedoableEnemy = (situation: Situation) =>
    pipe(
        situation,
        getClosestEnemy,
        O.filter(closest => getDistanceBetweenPoints(situation.position)(closest.position) <= sharkSettings.maxTorpedoDistance),
    );

const sortEnemiesByNearestToDeath =
    pipe(
        N.Ord,
        Ord.contramap((enemy: EnemyShark) => sharkHealthSeverity[enemy.healthStatus]),
        Ord.reverse,
        A.sort,
    );

export const getEnemyNearestToDeath = (situation: Situation) =>
    pipe(
        situation,
        getEnemies,
        sortEnemiesByNearestToDeath,
        A.head,
    );