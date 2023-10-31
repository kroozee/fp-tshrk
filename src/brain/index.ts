import { ReaderObservable } from 'fp-ts-rxjs/ReaderObservable';
import A from 'fp-ts/Array';
import IO from 'fp-ts/IO';
import O from 'fp-ts/Option';
import R from 'fp-ts/ReaderIO';
import { flow, pipe } from 'fp-ts/function';
import { Observable } from 'rxjs';
import { expand, map, pairwise, take, tap } from 'rxjs/operators';
import { Api } from '../api';
import { sharkSettings } from '../config';
import { getDistanceBetweenPoints } from '../utility/math';
import { sharkDo } from './do';
import { scan } from './scans';
import { sharkSee } from './see';
import { sharkThink } from './think';
import { BabySharkKnowledge, EnemyShark, SharkDo, SharkKnowledge, Situation, defaultManeuver } from './types';

type SharkBrain = ReaderObservable<BabySharkKnowledge, IO.IO<void>>;

const remember = (previous: BabySharkKnowledge | SharkKnowledge) =>
    (newSituation: Situation): Situation =>
    'situation' in previous
        ? {
            ...newSituation,
            memory: pipe(
                newSituation.memory,
                O.orElse(() => previous.situation.memory),
                O.filter(memory => (newSituation.beat - memory.beat) < sharkSettings.maxMemoryBeats))
            }
        : newSituation;

const sharkFeedbackLoop = (previous: BabySharkKnowledge | SharkKnowledge): Observable<SharkKnowledge> =>
    pipe(
        previous,
        sharkSee,
        map(remember(previous)),
        map(situation => ({
            situation,
            currentManeuver: sharkThink(situation),
        })),
        map(newKnowledge => ({
            ...previous,
            ...newKnowledge
        })),
        take(1)
    );

const sharkDoAndScan: SharkDo = 
    pipe(
        sharkDo,
        R.flatMap(() => scan)
    );

export const sharkBrain5000: SharkBrain =
    flow(
        sharkFeedbackLoop,
        expand(sharkFeedbackLoop),
        pairwise(),
        tap(([fst, snd]) => {
            if (fst.currentManeuver !== snd.currentManeuver) {
                console.log('shark changed its mind!', { do: snd.currentManeuver });
            }
        }),
        map(([, snd]) => snd),
        tap(k => console.log({
            maneuver: k.currentManeuver,
            enemies: pipe(
                k.situation.memory,
                O.map(m => m.enemies),
                O.getOrElse<EnemyShark[]>(() => []),
                A.map(e => e.position),
                A.map(getDistanceBetweenPoints(k.situation.position))
            )
        })),
        map((knowledge, index) => index % sharkSettings.maxScanFrequencyBeats === 0
            ? sharkDoAndScan(knowledge)
            : sharkDo(knowledge))
    );

export const startShark = (api: Api): IO.IO<void> => () =>
    sharkBrain5000({ ...api, currentManeuver: defaultManeuver })
        .subscribe(io => io());