import NEA from 'fp-ts/NonEmptyArray';
import O from 'fp-ts/Option';
import Ord from 'fp-ts/Ord';
import R, { ReaderIO } from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import N from 'fp-ts/number';
import { ArenaSettings } from '../../api';
import { sharkSettings } from '../../config';
import { doNothing as doNothingIO } from '../../utility/io';
import { getAngleDifference, getAngleToPoint, getDistanceBetweenPoints, getNewPosition } from '../../utility/math';
import { EnemyShark, SharkKnowledge, Situation } from '../types';

export const doNothing = R.fromIO<void, SharkKnowledge>(doNothingIO);

export const stop: ReaderIO<SharkKnowledge, void> = ({ shark }) =>
    shark.setFinSpeed(0, 0);

export const goForward: ReaderIO<SharkKnowledge, void> = ({ shark }) =>
    shark.setFinSpeed(sharkSettings.forwardSpeed, sharkSettings.forwardSpeed);

export const turn = (direction: 'port' | 'starboard'): R.ReaderIO<SharkKnowledge, void> => ({ shark, situation }) =>
    pipe(
        O.some(direction),
        O.filter(direction => !(direction === 'port'
            && situation.portFinSpeed === -sharkSettings.turnSpeed
            && situation.starboardFinSpeed === sharkSettings.turnSpeed)),
        O.filter(direction => !(direction === 'starboard'
            && situation.portFinSpeed === sharkSettings.turnSpeed
            && situation.starboardFinSpeed === -sharkSettings.turnSpeed)),
        O.map(direction => direction === 'port'
            ? pipe(shark.setFinSpeed(-sharkSettings.turnSpeed, sharkSettings.turnSpeed))
            : pipe(shark.setFinSpeed(sharkSettings.turnSpeed, -sharkSettings.turnSpeed))),
        O.getOrElse(() => doNothingIO),
    );

type SharkTurnState =
    | 'turning'
    | 'facing';

type SharkMoveState =
    | 'turning'
    | 'going'
    | 'made it';

const stopTurning: R.ReaderIO<SharkKnowledge, void> =
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            situation,
            O.fromPredicate(s => s.portFinSpeed !== s.starboardFinSpeed),
            O.map(() => stop),
            O.getOrElse(() => doNothing),
        )),
    );

export const turnTowardsPoint = (point: [number, number]): R.ReaderIO<SharkKnowledge, SharkTurnState> =>
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            situation.position,
            getAngleToPoint(point),
            getAngleDifference(situation.facing),
            O.fromPredicate(difference => Math.abs(difference) > sharkSettings.turnDeadbandRadians),
            O.match(
                () => pipe(stopTurning, R.map(() => 'facing' as SharkTurnState)),
                difference => pipe(
                    difference < 0
                        ? turn('port')
                        : turn('starboard'),
                    R.map(() => 'turning' as SharkTurnState)
                )),
        ))
    );

export const turnTowardsCenter: R.ReaderIO<SharkKnowledge, void> = (knowledge) => 
    pipe(
        knowledge,
        turnTowardsPoint([
            knowledge.situation.arenaSettings.dimensions.width / 2,
            knowledge.situation.arenaSettings.dimensions.height / 2]),
    );

const moveTowardsPoint = (point: [number, number]): R.ReaderIO<SharkKnowledge, SharkMoveState> =>
    pipe(
        turnTowardsPoint(point),
        R.flatMap(turnState => turnState === 'facing'
            ? goForward
            : doNothing),
        R.map(() => 'going'),
    );

export const goToPoint = (point: [number, number]): R.ReaderIO<SharkKnowledge, SharkMoveState> =>
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(({ situation }) => pipe(
            situation.position,
            getDistanceBetweenPoints(point),
            O.fromPredicate(distance => Math.abs(distance) > sharkSettings.distanceDeadband),
            O.match(
                () => pipe(
                    situation.velocity.speed === 0
                        ? doNothing
                        : stop,
                    R.map(() => 'made it')),
                () => moveTowardsPoint(point))
        ))
    );

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

const getLeadingTargetPoint = (enemy: EnemyShark) => (situation: Situation): [number, number] =>
    pipe(
        situation.memory,
        O.map(memory => memory.beat),
        O.map(beatSeen => getNewPosition(
            enemy.position,
            enemy.velocity.direction,
            enemy.velocity.speed * (situation.beat + 1 - beatSeen))),
        O.getOrElse(() => enemy.position)
    );

export const laserEnemy = (enemy: EnemyShark): R.ReaderIO<SharkKnowledge, void> =>
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMap(knowledge => pipe(
            knowledge.situation,
            getLeadingTargetPoint(enemy),
            point => turnTowardsPoint(point),
        )),
        R.flatMap(state => state === 'facing'
            ? ({ shark }: SharkKnowledge) => shark.fireLaser
            : doNothing)
    );

export const torpedoEnemy = (enemy: EnemyShark): R.ReaderIO<SharkKnowledge, void> =>
    pipe(
        R.ask<SharkKnowledge>(),
        R.flatMapIO(({ situation, shark }) => pipe(
            situation,
            getLeadingTargetPoint(enemy),
            target => getAngleToPoint(target)(situation.position),
            shark.fireTorpedo
        ))
    );