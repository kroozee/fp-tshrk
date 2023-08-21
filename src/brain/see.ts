import $ from 'fp-ts-rxjs/Observable';
import A from 'fp-ts/Array';
import IO from 'fp-ts/IO';
import O from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Angle, ArenaSettings, BeatUpdate, NarrowScanExecutedEvent, ScannedShark, WideScanExecutedEvent } from '../api';
import { sharkSettings } from '../config';
import { doNothing, narrowScanCenter } from './shared';
import { EnemyShark, ManeuverName, SharkKnowledge, SharkSee, Situation } from './types';

export type ScanResult = NarrowScanExecutedEvent | WideScanExecutedEvent;

const createEnemyShark = (scannedShark: ScannedShark): EnemyShark => ({
    position: [scannedShark.centerX, scannedShark.centerY],
    velocity: scannedShark.velocity,
    healthStatus: scannedShark.healthStatus,
});

const getScannedSharks = flow(
    (update: BeatUpdate) => update.events,
    A.findFirst(event =>
        'event' in event
        && (event.event === 'narrowScanExecutedEvent'
        || event.event === 'wideScanExecutedEvent')),
    O.map(event => event as ScanResult),
    O.map(result => result.sharks.map(createEnemyShark)),
    O.getOrElse(() => [] as EnemyShark[]),
);

const createSituation = ([update, arenaSettings]: [BeatUpdate, ArenaSettings]): O.Option<Situation> =>
    pipe(
        O.some(update),
        O.flatMap(update => update.isAlive === 'yes'
            ? O.some(update)
            : O.none),
        O.map(update => ({
            currentManeuver: O.none,
            position: [update.positionX, update.positionY],
            velocity: {
                direction: update.facing as Angle,
                speed: (update.portFinSpeedActual + update.starboardFinSpeedActual) / 2
            },
            health: update.health,
            energy: update.energy,
            torpedoes: update.torpedoCount,
            recentlyScannedEnemies: getScannedSharks(update),
            arenaSettings,
        }))
    );

type Scan = (knowledge: SharkKnowledge) => IO.IO<void>;
const unimplemented: Scan = () => doNothing;

const scanRules: Record<ManeuverName, Scan> = {
    camp: narrowScanCenter,
    evade: unimplemented,
    stealthEvade: unimplemented,
    laserAttack: unimplemented,
    torpedoAttack: unimplemented,
    finishHim: unimplemented,
};

const getScanForSituation = (knowledge: SharkKnowledge) =>
    scanRules[knowledge.currentManeuver](knowledge);

const scan = flow(
    O.some<SharkKnowledge>,
    O.filter(({ situation }: SharkKnowledge) => situation.energy > sharkSettings.minimumEnergyToScan),
    O.map(getScanForSituation),
    O.getOrElse(() => doNothing)
);

export const sharkSee: SharkSee = (knowledge) => {
    const see = pipe(
        [knowledge.game.updates, knowledge.game.arenaSettings],
        combineLatest,
        $.filterMap(createSituation),
    );

    return see.pipe(
        tap(situation => scan({ ...knowledge, situation })())
    );
};