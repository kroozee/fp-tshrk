import * as A from 'fp-ts/Array';
import O from 'fp-ts/Option';
import Ord from 'fp-ts/Ord';
import NEA from 'fp-ts/ReadonlyNonEmptyArray';
import { flow, pipe } from 'fp-ts/function';
import N from 'fp-ts/number';
import { SharkHealthStatus } from '../api';
import { sharkSettings } from '../config';
import { getEnemyNearestToDeath, getTorpedoableEnemy, sharkHealthSeverity } from './shared';
import { EnemyShark, ManeuverName, SharkThink, Situation, defaultManeuver } from './types';

const enemyIsAtLeast = (status: SharkHealthStatus) =>
    O.filter((shark: EnemyShark) => sharkHealthSeverity[shark.healthStatus] >= sharkHealthSeverity[status])

const enemyNearestToDeathIsAtLeast = (status: SharkHealthStatus) => (situation: Situation) =>
    pipe(
        getEnemyNearestToDeath(situation),
        enemyIsAtLeast(status)
    );

const torpedoableEnemyIsAtLeast = (status: SharkHealthStatus) => (situation: Situation) =>
    pipe(
        getTorpedoableEnemy(situation),
        enemyIsAtLeast(status)
    );

const maneuverConditions: Record<ManeuverName, (situation: Situation) => boolean> = {
    camp: () => true,

    stealthCamp: situation => situation.health < 300,

    laserAttack: flow(
        O.fromPredicate(situation => situation.energy >= 25),
        O.flatMap(enemyNearestToDeathIsAtLeast('healthy')),
        O.match(() => false, () => true)
    ),

    torpedoAttack: flow(
        O.fromPredicate(situation => situation.torpedoes > 0),
        O.flatMap(torpedoableEnemyIsAtLeast('crippled')),
        O.match(() => false, () => true)
    ),

    finishHim: flow(
        O.fromPredicate(situation => situation.torpedoes > 1),
        O.flatMap(torpedoableEnemyIsAtLeast('healthy')),
        O.match(() => false, () => true)
    ),
};

const getPossibleManuevers = (situation: Situation): NEA.ReadonlyNonEmptyArray<ManeuverName> =>
    pipe(
        Object.entries(maneuverConditions),
        A.filterMap(([maneuver, should]) => pipe(
            maneuver,
            O.fromPredicate(() => should(situation)),
            O.map(maneuver => maneuver as ManeuverName)
        )),
        NEA.fromArray,
        O.getOrElse(() => NEA.replicate(defaultManeuver)(1)),
    );

const byPriority = pipe(
    N.Ord,
    Ord.contramap((maneuver: ManeuverName) => sharkSettings.maneuverPriorities[maneuver]),
    Ord.reverse
);

export const sharkThink: SharkThink = flow(
    getPossibleManuevers,
    NEA.sort(byPriority),
    NEA.head,
);