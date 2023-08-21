import * as IO from 'fp-ts/lib/IO';
import NEA from 'fp-ts/lib/NonEmptyArray';
import Option from 'fp-ts/lib/Option';
import * as Ord from 'fp-ts/lib/Ord';
import { pipe } from 'fp-ts/lib/function';
import * as N from 'fp-ts/lib/number';
import { Shark } from '../../api/shark';
import { sharkSettings } from '../../config';
import { getAngleDifference, getAngleToPoint, getDistanceBetweenPoints } from '../../utility/math';
import { goForward, stop, turn } from '../shared';
import { SharkDo, Situation } from '../types';

const byClosest = ({ position }: Situation) =>
    pipe(
        N.Ord,
        Ord.contramap(getDistanceBetweenPoints(position))
    );

const getClosestPoint = (situation: Situation) => (points: NEA.NonEmptyArray<[number, number]>) =>
    pipe(
        points,
        NEA.sort(byClosest(situation)),
        NEA.head
    );

const stopWhenCloseEnough = (shark: Shark) => (situation: Situation) => (point: [number, number]): Option.Option<IO.IO<void>> =>
    pipe(
        situation.position,
        getDistanceBetweenPoints(point),
        Option.fromPredicate(distance => distance <= sharkSettings.distanceDeadband),
        Option.map(() => stop(shark))
    );

const moveTowardsPoint = (shark: Shark) => (situation: Situation) => (point: [number, number]): IO.IO<void> =>
    pipe(
        situation.position,
        getAngleToPoint(point),
        getAngleDifference(situation.velocity.direction),
        difference => difference <= sharkSettings.turnDeadbandRadians
            ? goForward(shark)
            : difference < 0
                ? turn(shark)('port')
                : turn(shark)('starboard')
    );

const goToPoint = (shark: Shark) => (situation: Situation) => (point: [number, number]): IO.IO<void> =>
    pipe(
        point,
        stopWhenCloseEnough(shark)(situation),
        Option.getOrElse(() => moveTowardsPoint(shark)(situation)(point))
    );

export const camp: SharkDo = ({ shark, situation }) => () => {
    const { arenaSettings: { dimensions } } = situation;
    const corners: NEA.NonEmptyArray<[number, number]> = [
        [0, 0], // bottom left
        [0, dimensions.height],
        [dimensions.width, 0],
        [dimensions.width, dimensions.height],
    ];

    return pipe(
        corners,
        getClosestPoint(situation),
        goToPoint(shark)(situation)
    );
};