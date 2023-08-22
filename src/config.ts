import { Angle, ArenaId, SharkId } from "./api/gameplay";

export const baseUrl = process.env.HOST || "http://127.0.0.1:3000";
export const arenaId = (process.env.GAME_ID || "0000-004J") as ArenaId;
export const sharkId = (process.env.PLAYER_ID ||
  "0bf0fda7-53Sb4-42c4-ad77-6e82e0fc4513") as SharkId;

export const sharkSettings = {
    forwardSpeed: 6,
    turnSpeed: 4,
    distanceDeadband: 5,
    turnDeadbandRadians: 0.01 as Angle,
    maxScanFrequencyMilliseconds: 250,
    minEnergyToScan: 100, // TODO: good value
    maxTorpedoDistance: 300,
    maneuverPriorities: {
        finishHim: 4,
        torpedoAttack: 3,
        laserAttack: 2,
        stealthCamp: 1,
        camp: 0,
    },
};
