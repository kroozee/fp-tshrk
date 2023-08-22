import IO from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';
import { doNothing } from '../../utility/io';
import { SharkDo } from '../types';
import { getClosestCorner, goToPoint, turnTowardsCenter } from './shared';

export const camp: SharkDo = ({ shark, situation }) =>
    pipe(
        getClosestCorner(situation),
        goToPoint(shark)(situation),
        IO.flatMap(state => state === 'made it'
            ? turnTowardsCenter(shark)(situation)
            : doNothing)
    );