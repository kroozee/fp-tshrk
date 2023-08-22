import { ManeuverName, SharkDo } from '../types';
import { camp } from './camp';
import { laserAttack } from './laserAttack';
import { stealthCamp } from './stealthCamp';
import { torpedoAttack } from './torpedoAttack';

export const maneuvers: Record<ManeuverName, SharkDo> = {
    camp,
    stealthCamp: stealthCamp,
    laserAttack: laserAttack,
    torpedoAttack: torpedoAttack,
    finishHim: laserAttack,
};