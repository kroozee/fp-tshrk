import * as A from 'fp-ts/Array';
import O from 'fp-ts/Option';
import Ord from 'fp-ts/Ord';
import NEA from 'fp-ts/ReadonlyNonEmptyArray';
import { flow, pipe } from 'fp-ts/function';
import N from 'fp-ts/number';
import { SharkHealthStatus } from '../api';
import { sharkSettings } from '../config';
import { EnemyShark, ManeuverName, SharkThink, Situation, defaultManeuver } from './types';

const enemyNearestToDeath = (enemies: EnemyShark[]): O.Option<EnemyShark> => {
    const findEnemy = (healthStatus: SharkHealthStatus) => pipe(
        enemies.find(enemy => enemy.healthStatus === healthStatus),
        O.fromNullable);

    return pipe(
        findEnemy('immobilized'),
        O.alt(() => findEnemy('crippled')),
        O.alt(() => findEnemy('healthy'))
    );
};

const enemyNearestToDeathIsNot = (status: SharkHealthStatus) => (situation: Situation) =>
    pipe(
        enemyNearestToDeath(situation.recentlyScannedEnemies),
        O.match(() => false, shark => shark.healthStatus !== status)
    );

const maneuverConditions: Record<ManeuverName, (situation: Situation) => boolean> = {
    camp: () => true,

    evade: situation => situation.health < 200,

    stealthEvade: situation => situation.health < 300,

    laserAttack: flow(
        O.fromPredicate(situation => situation.energy < 25),
        O.map(enemyNearestToDeathIsNot('healthy')),
        O.getOrElse(() => false)
    ),

    torpedoAttack: flow(
        O.fromPredicate(situation => situation.torpedoes > 0),
        O.map(enemyNearestToDeathIsNot('healthy')),
        O.getOrElse(() => false)
    ),

    finishHim: flow(
        O.fromPredicate(situation => situation.torpedoes > 1),
        O.map(enemyNearestToDeathIsNot('immobilized')),
        O.getOrElse(() => false)
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
    Ord.contramap((maneuver: ManeuverName) => sharkSettings.maneuverPriorities[maneuver])
);

export const sharkThink: SharkThink = flow(
    getPossibleManuevers,
    NEA.sort(byPriority),
    NEA.head,
);