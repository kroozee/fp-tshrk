import O from 'fp-ts/Option';
import R from 'fp-ts/ReaderIO';
import { pipe } from 'fp-ts/function';
import { doNothing } from '../../utility/io';
import { getTorpedoableEnemy } from '../shared';
import { SharkDo, SharkKnowledge } from '../types';
import { laserEnemy, torpedoEnemy } from './shared';

const iWantEveryGunThatWeHaveToFireOnThatMan = (knowledge: SharkKnowledge)  =>
    pipe(
        laserEnemy(knowledge),
        R.flatMap(() => torpedoEnemy(knowledge))
    );

export const finishHim: SharkDo = (knowledge) =>
    pipe(
        knowledge.situation,
        getTorpedoableEnemy,
        O.map(iWantEveryGunThatWeHaveToFireOnThatMan(knowledge)),
        O.getOrElse(() => doNothing),
    );