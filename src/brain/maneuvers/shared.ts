import IO from 'fp-ts/IO';
import NEA from 'fp-ts/NonEmptyArray';
import O from 'fp-ts/Option';
import Ord from 'fp-ts/Ord';
import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import N from 'fp-ts/number';
import { ArenaSettings } from '../../api';
import { Shark } from '../../api/shark';
import { sharkSettings } from '../../config';
import { doNothing } from '../../utility/io';
import { getAngleDifference, getAngleToPoint, getDistanceBetweenPoints } from '../../utility/math';
import { EnemyShark, SharkKnowledge, Situation } from '../types';

export const getArenaCorners = ({ dimensions }: ArenaSettings): NEA.NonEmptyArray<[number, number]> =>
    [
        [0, 0], // bottom left
        [0, dimensions.height],
        [dimensions.width, 0],
        [dimensions.width, dimensions.height],
    ];

const byClosest = ({ position }: Situation) =>
    pipe(
        N.Ord,
        Ord.contramap(getDistanceBetweenPoints(position))
    );

export const getClosestPoint = (situation: Situation) => (points: NEA.NonEmptyArray<[number, number]>) =>
    pipe(
        points,
        NEA.sort(byClosest(situation)),
        NEA.head
    );

export const getClosestCorner = (situation: Situation) => 
    pipe(
        getArenaCorners(situation.arenaSettings),
        getClosestPoint(situation)
    );

type SharkTurnState =
    | 'turning'
    | 'facing';

type SharkMoveState =
    | 'turning'
    | 'going'
    | 'made it';

const stopWhenCloseEnough = (shark: Shark) => (situation: Situation) => (point: [number, number]): O.Option<IO.IO<SharkMoveState>> =>
    pipe(
        situation.position,
        getDistanceBetweenPoints(point),
        O.fromPredicate(distance => distance <= sharkSettings.distanceDeadband),
        O.map(() => pipe(
            stop(shark),
            IO.map(() => 'made it' as const)
        ))
    );

export const turnTowardsPoint = (shark: Shark) => (situation: Situation) => (point: [number, number]): IO.IO<SharkTurnState> =>
    pipe(
        situation.position,
        getAngleToPoint(point),
        getAngleDifference(situation.velocity.direction),
        O.fromPredicate(difference => difference > sharkSettings.turnDeadbandRadians),
        O.match(
            () => IO.of('facing' as SharkTurnState),
            difference => pipe(
                difference < 0
                    ? turn(shark)('port')
                    : turn(shark)('starboard'),
                IO.map(() => 'turning')
            ))
    );

export const turnTowardsCenter = (shark: Shark) => (situation: Situation) =>
    turnTowardsPoint(shark)(situation)([situation.arenaSettings.dimensions.width / 2, situation.arenaSettings.dimensions.height / 2]);

const moveTowardsPoint = (shark: Shark) => (situation: Situation) => (point: [number, number]): IO.IO<SharkMoveState> =>
    pipe(
        point,
        turnTowardsPoint(shark)(situation),
        IO.flatMap(turnState => turnState === 'facing'
            ? goForward(shark)
            : doNothing),
        IO.map(() => 'still going' as SharkMoveState),
    );

export const goToPoint = (shark: Shark) => (situation: Situation) => (point: [number, number]): IO.IO<SharkMoveState> =>
    pipe(
        point,
        stopWhenCloseEnough(shark)(situation),
        O.getOrElse(() => moveTowardsPoint(shark)(situation)(point))
    );

export const goForward = (shark: Shark): IO.IO<void> =>
    () => shark.setFinSpeed(sharkSettings.forwardSpeed, sharkSettings.forwardSpeed);

export const stop = (shark: Shark): IO.IO<void> =>
    () => shark.setFinSpeed(0, 0);

export const turn = (shark: Shark) => (direction: 'port' | 'starboard'): IO.IO<void> =>
    direction === 'port'
        ? () => shark.setFinSpeed(-sharkSettings.turnSpeed, sharkSettings.turnSpeed)
        : () => shark.setFinSpeed(sharkSettings.turnSpeed, -sharkSettings.turnSpeed);

export const laserEnemy = ({ shark, situation }: SharkKnowledge): R.ReaderIO<EnemyShark, void> => (enemy) =>
    pipe(
        turnTowardsPoint(shark)(situation)(enemy.position),
        IO.flatMap(state => state === 'facing'
            ? shark.fireLaser
            : doNothing)
    );

export const torpedoEnemy = ({ shark, situation }: SharkKnowledge): R.ReaderIO<EnemyShark, void> => (enemy) =>
    pipe(
        situation.position,
        getAngleToPoint(enemy.position), // TODO: lead shot?
        shark.fireTorpedo,
    );