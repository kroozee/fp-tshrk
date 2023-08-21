import { doNothing } from '../shared';
import { ManeuverName, SharkDo } from '../types';
import { camp } from './camp';

const unimplemented: SharkDo = () => doNothing;

export const maneuvers: Record<ManeuverName, SharkDo> = {
    camp,
    evade: unimplemented,
    stealthEvade: unimplemented,
    laserAttack: unimplemented,
    torpedoAttack: unimplemented,
    finishHim: unimplemented,
};