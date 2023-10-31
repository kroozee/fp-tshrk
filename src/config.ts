import { Angle, ArenaId, SharkId } from "./api/gameplay";

export const baseUrl = (process.env.HOST || "http://scia-sdateambld:3000");
export const arenaId = (process.env.GAME_ID || "9RY-RYY-YYYE") as ArenaId;
export const sharkId = (process.env.PLAYER_ID || "ea4515e1-f942-4134-8079-a8fbf42cac27") as SharkId;

export const sharkSettings = {
    forwardSpeed: 6,
    turnSpeed: 1,
    distanceDeadband: 50,
    turnDeadbandRadians: 0.10 as Angle,
    maxScanFrequencyBeats: 15,
    maxMemoryBeats: 50,
    minEnergyToScan: 20,
    maxTorpedoDistance: 300,
    maneuverPriorities: {
        finishHim: 4,
        torpedoAttack: 3,
        laserAttack: 2,
        stealthCamp: 1,
        camp: 0,
    },
} as const;