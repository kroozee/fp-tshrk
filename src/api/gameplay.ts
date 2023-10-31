import { Brand } from '../utility/types';

export type ArenaId = Brand<string, 'ArenaId'>;
export type SharkId = Brand<string, 'SharkId'>;
export type CommandId = Brand<string, 'CommandId'>;

export type Angle = Brand<number, 'Radians'>;

type BasicShark = {
    id: SharkId
    name: string
}

type DamageSource = 'laser' | 'torpedo' | 'wall'

export type ScannedShark = {
    sharkId: SharkId
    name: string
    centerX: number
    centerY: number
    velocity: Velocity
    speed: number
    direction: Angle
    healthStatus: SharkHealthStatus
}

type ScannedTorpedo = {
    positionX: number
    positionY: number
    direction: number
    message: string
}

export type SharkMode = 'attack' | 'repair' | 'stealth';
export type SharkHealthStatus = 'healthy' | 'crippled' | 'immobilized'

export type Velocity = {
    speed: number
    direction: Angle
};

export type CommandUpdate = {
    commandId: CommandId,
    status: 'failed' | 'succeeded' | 'in-progress',
    message: string | null
};

type AliveBeatUpdate = {
    sharkId: SharkId
    gameTime: number
    isAlive: 'yes'
    mode: SharkMode
    positionX: number
    positionY: number
    facing: number
    energy: number
    health: number
    torpedoCount: number
    portFinSpeedActual: number
    starboardFinSpeedActual: number
    scores: SharkScoreUpdate[]
    events: BeatEvent[]
};

type DeadBeatUpdate = {
    sharkId: SharkId
    gameTime: number
    isAlive: 'no'
    respawnAt: number
    events: BeatEvent[]
};

export type BeatUpdate =
    | AliveBeatUpdate
    | DeadBeatUpdate;

export type BeatEvent =
    | SharkScoreUpdate
    | DeadBeatUpdate
    | DamageTakenEvent
    | LaserFiredEvent
    | NarrowScanExecutedEvent
    | ProximityAlarmEvent
    | ScanDetectedEvent
    | SharkDestroyedEvent
    | SharkRespawnedEvent
    | TorpedoDetonatedEvent
    | TorpedoLostEvent
    | WideScanExecutedEvent;

export type SharkScoreUpdate = {
    sharkId: SharkId
    sharkName: string
    points: number
    thisLifeKillCount: number
    killCount: number
    diedCount: number
}

export type DamageTakenEvent = {
    event: 'damageTakenEvent'
    health: number
    energy: number
    source: DamageSource
}

export type LaserFiredEvent = {
    event: 'laserFiredEvent'
    firingsharkId: SharkId
    commandId: CommandId
    direction: number
    startingPointX: number
    startingPointY: number
    endingPointX: number
    endingPointY: number
    sharkHit: BasicShark | null
}

export type NarrowScanExecutedEvent = {
    event: 'narrowScanExecutedEvent'
    commandId: CommandId
    scanFromX: number
    scanFromY: number
    direction: number
    sharks: ScannedShark[]
    torpedoes: ScannedTorpedo[]
}

export type ProximityAlarmEvent = {
    event: 'proximityAlarmEvent'
}

export type ScanDetectedEvent = {
    event: 'scanDetectedEvent'
    sourcePositionX: number
    sourcePositionY: number
}

export type SharkDestroyedEvent = {
    event: 'sharkDestroyedEvent'
    shark: BasicShark
}

export type SharkRespawnedEvent = {
    event: 'sharkRespawnedEvent'
    shark: BasicShark
}

export type TorpedoDetonatedEvent = {
    event: 'torpedoDetonatedEvent'
    commandId: CommandId
    firingSharkId: string
    sharksHit: BasicShark[]
    detonationPointX: number
    detonationPointY: number
    pointsScored: number
}

export type TorpedoLostEvent = {
    event: 'torpedoLostEvent',
    commandId: CommandId,
    lastKnownPositionX: number
    lastKnownPositionY: number
}

export type WideScanExecutedEvent = {
    event: 'wideScanExecutedEvent'
    commandId: CommandId
    scanningsharkId: SharkId
    centerPointX: number
    centerPointY: number
    sharks: ScannedShark[]
    torpedoes: ScannedTorpedo[]
}

export type ClientToServerEvents = {
    doStuff: (
        callback: (result: CommandUpdate) => void) => void,    
    takeControl: (
        arenaId: string,
        playerId: string,
        callback: (result: CommandUpdate) => void) => void,
    setFinSpeed: (
        arenaId: string,
        playerId: string,
        portSpeed: number,
        starboardSpeed: number,
        callback: (result: CommandUpdate) => void) => void
    setSharkMode: (
        arenaId: string,
        playerId: string,
        mode: SharkMode,
        callback: (result: CommandUpdate) => void) => void,
    performWideScan: (
        arenaId: string,
        playerId: string,
        callback: (result: CommandUpdate) => void) => void,
    performNarrowScan: (
        arenaId: string,
        playerId: string,
        direction: number,
        callback: (result: CommandUpdate) => void) => void,
    fireTorpedo: (
        arenaId: string,
        playerId: string,
        direction: number,
        callback: (result: CommandUpdate) => void) => void,
    fireLaser: (
        arenaId: string,
        playerId: string,
        callback: (result: CommandUpdate) => void) => void
}

export type ServerToClientEvents = {
    commandUpdate: (commandUpdate: CommandUpdate) => void,
    beatUpdate: (beatUpdate: BeatUpdate | DeadBeatUpdate) => void
}