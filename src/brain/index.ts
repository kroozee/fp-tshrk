import { ReaderObservable } from 'fp-ts-rxjs/ReaderObservable';
import { flow, pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/lib/IO';
import { Observable } from 'rxjs';
import { expand, map, take, tap } from 'rxjs/operators';
import { Api } from '../api';
import { sharkDo } from './do';
import { sharkSee } from './see';
import { sharkThink } from './think';
import { BabySharkKnowledge, SharkKnowledge, defaultManeuver } from './types';

type SharkBrain =  ReaderObservable<BabySharkKnowledge, IO<void>>;

const sharkFeedbackLoop = (sharkKnowledge: BabySharkKnowledge): Observable<SharkKnowledge> =>
    pipe(
        sharkKnowledge,
        sharkSee,
        map(situation => ({
            situation: situation,
            currentManeuver: sharkThink(situation)
        })),
        map(newKnowledge => ({
            ...sharkKnowledge,
            ...newKnowledge
        })),
        take(1),
    );

export const sharkBrain5000: SharkBrain =
    flow(
        sharkFeedbackLoop,
        expand(sharkFeedbackLoop),
        tap(k => console.log('acting on new knowledge!', k)),
        map(sharkDo),
    );

export const startShark = (api: Api): IO<void> => () =>
    sharkBrain5000({ ...api, currentManeuver: defaultManeuver })
        .subscribe(io => io());