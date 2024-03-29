import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { sharkSettings } from '../../config';
import { getDistanceBetweenPoints } from '../../utility/math';
import { SharkDo } from '../types';
import { camp } from './camp';
import { getClosestCorner } from './shared';

const stealthUntilCorner: SharkDo = (knowledge) =>
    pipe(
        getClosestCorner(knowledge.situation),
        getDistanceBetweenPoints(knowledge.situation.position),
        distance => distance > sharkSettings.distanceDeadband
            ? knowledge.shark.setSharkMode('stealth')
            : knowledge.shark.setSharkMode('attack')
    );

export const stealthCamp: SharkDo =
    pipe(
        stealthUntilCorner,
        R.flatMap(() => camp),
    );