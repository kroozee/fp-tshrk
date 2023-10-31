import $ from 'fp-ts-rxjs/Observable';
import A from 'fp-ts/Array';
import O from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import { combineLatest } from 'rxjs';
import { Angle, ArenaSettings, BeatUpdate, NarrowScanExecutedEvent, ScannedShark, WideScanExecutedEvent } from '../api';
import { EnemyShark, Memory, SharkSee, Situation } from './types';

export type ScanResult = NarrowScanExecutedEvent | WideScanExecutedEvent;

const createEnemyShark = (scannedShark: ScannedShark): EnemyShark => ({
    position: [scannedShark.centerX, scannedShark.centerY],
    velocity: {
        speed: scannedShark.speed,
        direction: scannedShark.direction 
    },
    healthStatus: scannedShark.healthStatus,
});

const getScanResult = (update: BeatUpdate) => 
    pipe(
        update.events,
        A.findFirst(event =>
            'event' in event
            && (event.event === 'narrowScanExecutedEvent'
            || event.event === 'wideScanExecutedEvent')),
        O.map(event => event as ScanResult),
    );


const getScannedSharks = flow(
    getScanResult,
    O.map(result => result.sharks),
    O.map(A.map(createEnemyShark))
);

const createMemory = (update: BeatUpdate): O.Option<Memory> =>
    pipe(
        O.some((scanResult: ScanResult) => (enemies: EnemyShark[]): Memory => ({
            beat: update.gameTime,
            lastScanType: scanResult.event === 'narrowScanExecutedEvent' ? 'narrow' : 'wide',
            enemies,
        })),
        O.ap(getScanResult(update)),
        O.ap(getScannedSharks(update)),
    );

const createSituation = ([update, arenaSettings]: [BeatUpdate, ArenaSettings]): O.Option<Situation> =>
    pipe(
        O.some(update),
        O.flatMap(update => update.isAlive === 'yes'
            ? O.some(update)
            : O.none),
        O.map(update => ({
            beat: update.gameTime,
            position: [update.positionX, update.positionY],
            facing: update.facing as Angle,
            velocity: {
                direction: update.facing as Angle,
                speed: (update.portFinSpeedActual + update.starboardFinSpeedActual) / 2
            },
            portFinSpeed: update.portFinSpeedActual,
            starboardFinSpeed: update.starboardFinSpeedActual,
            health: update.health,
            energy: update.energy,
            torpedoes: update.torpedoCount,
            memory: createMemory(update),
            arenaSettings,
        }))
    );

export const sharkSee: SharkSee = (knowledge) =>
    pipe(
        [knowledge.game.updates, knowledge.game.arenaSettings],
        combineLatest,
        $.filterMap(createSituation),
    );