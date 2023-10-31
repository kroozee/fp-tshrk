import { ReaderObservable } from 'fp-ts-rxjs/ReaderObservable';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';
import { ReaderIO } from 'fp-ts/ReaderIO';
import { Observable } from 'rxjs';
import { Angle, Api, ArenaSettings, SharkHealthStatus, Velocity } from '../api';

export type ManeuverName =
    | 'camp'
    | 'stealthCamp'
    | 'laserAttack'
    | 'torpedoAttack'
    | 'finishHim';

export const defaultManeuver = 'camp' as ManeuverName;

export type EnemyShark = {
    position: [number, number]
    velocity: Velocity
    healthStatus: SharkHealthStatus
};

/**
 * Stuff from scans the shark should remember until the next scan.
 */
export type Memory = {
    beat: number
    lastScanType: 'narrow' | 'wide'
    enemies: EnemyShark[]
};

export type Situation = {
    beat: number
    position: [number, number]
    facing: Angle
    portFinSpeed: number
    starboardFinSpeed: number
    velocity: Velocity
    health: number
    energy: number
    torpedoes: number
    memory: Option<Memory>,
    arenaSettings: ArenaSettings
};

export type SharkKnowledge = {
    currentManeuver: ManeuverName,
    situation: Situation,
} & Api;

/** 
 * The shark doesn't know the situation when it's a newborn.
 */
export type BabySharkKnowledge = Omit<SharkKnowledge, 'situation'>;

export type SharkSee = (knowledge: SharkKnowledge | BabySharkKnowledge) => Observable<Situation>;
export type SharkThink = (situation: Situation) => ManeuverName;
export type SharkDo = ReaderIO<SharkKnowledge, void>;

export type SharkBrain =  ReaderObservable<BabySharkKnowledge, IO<void>>;