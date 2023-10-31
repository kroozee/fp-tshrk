import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { SharkDo, SharkKnowledge } from '../types';
import { doNothing, getClosestCorner, goToPoint, turnTowardsCenter } from './shared';

export const camp: SharkDo =
    pipe(
        R.Do,
        R.ask<SharkKnowledge>,
        R.bind('moveState', ({ situation }) => pipe(
            getClosestCorner(situation),
            goToPoint
        )),
        R.tap(({ moveState }) => moveState === 'made it'
            ? turnTowardsCenter
            : doNothing)
    );