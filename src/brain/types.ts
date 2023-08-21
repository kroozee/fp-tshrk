import { ReaderObservable } from 'fp-ts-rxjs/ReaderObservable';
import { IO } from 'fp-ts/IO';
import { Observable } from 'rxjs';
import { Api, ArenaSettings, SharkHealthStatus, Velocity } from '../api';

export type ManeuverName =
    | 'camp'
    | 'evade'
    | 'stealthEvade'
    | 'laserAttack'
    | 'torpedoAttack'
    | 'finishHim';

export const defaultManeuver = 'camp' as ManeuverName;

export type EnemyShark = {
    position: [number, number]
    velocity: Velocity
    healthStatus: SharkHealthStatus
};

export type Situation = {
    position: [number, number]
    velocity: Velocity
    health: number
    energy: number
    torpedoes: number
    recentlyScannedEnemies: EnemyShark[]
    arenaSettings: ArenaSettings
};

export type SharkKnowledge = {
    currentManeuver: ManeuverName,
    situation: Situation,
} & Api;

/** The shark doesn't know the situation when it's a newborn. */
export type BabySharkKnowledge = Omit<SharkKnowledge, 'situation'>;

export type SharkSee = (knowledge: SharkKnowledge | BabySharkKnowledge) => Observable<Situation>;
export type SharkThink = (situation: Situation) => ManeuverName;
export type SharkDo = (knowledge: SharkKnowledge) => IO<void>;

export type SharkBrain =  ReaderObservable<BabySharkKnowledge, IO<void>>;