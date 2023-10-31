import O from 'fp-ts/Option';
import { flow } from 'fp-ts/function';
import { sharkSettings } from '../../config';
import { doNothing } from '../../utility/io';
import { ManeuverName, SharkDo, SharkKnowledge } from '../types';
import { alternate } from './alternate';
import { scanCenter } from './scanCenter';

const scans: Record<ManeuverName, SharkDo> = {
    camp: alternate,
    stealthCamp: scanCenter,
    laserAttack: scanCenter,
    torpedoAttack: scanCenter,
    finishHim: scanCenter,
};

const getScan = (knowledge: SharkKnowledge) =>
    scans[knowledge.currentManeuver](knowledge);

export const scan: SharkDo = flow(
    O.some<SharkKnowledge>,
    O.filter(({ situation }: SharkKnowledge) => situation.energy > sharkSettings.minEnergyToScan),
    O.map(getScan),
    O.getOrElse(() => doNothing)
);
