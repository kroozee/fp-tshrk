import { maneuvers } from './maneuvers';
import { SharkDo } from './types';

export const sharkDo: SharkDo = (knowledge) =>
    maneuvers[knowledge.currentManeuver](knowledge);