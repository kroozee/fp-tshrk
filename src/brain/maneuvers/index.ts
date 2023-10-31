import { ManeuverName, SharkDo } from '../types';
import { camp } from './camp';
import { finishHim } from './finishHim';
import { laserAttack } from './laserAttack';
import { stealthCamp } from './stealthCamp';
import { torpedoAttack } from './torpedoAttack';

export const maneuvers: Record<ManeuverName, SharkDo> = {
    camp,
    stealthCamp,
    laserAttack,
    torpedoAttack,
    finishHim,
};