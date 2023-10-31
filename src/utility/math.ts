import { Angle } from '../api';

export const getDistanceBetweenPoints = (source: [number, number]) => (target: [number, number]) => {
    const dx = target[0] - source[0];
    const dy = target[1] - source[1];
    return Math.sqrt(dx * dx + dy * dy);
};

const normalizeAngle = (angle: Angle): Angle => {
    const fullCircle = Math.PI * 2;
    const normalized = angle % fullCircle;
    return normalized < 0
        ? normalized + fullCircle as Angle
        : normalized as Angle;
};

export const getAngleToPoint = (target: [number, number]) => (source: [number, number]): Angle => {
    const dx = target[0] - source[0];
    const dy = target[1] - source[1];
    return normalizeAngle(Math.atan2(dx, dy) as Angle);
};

export const getAngleDifference = (source: Angle) => (target: Angle) => { 
    const diff = normalizeAngle(target) - normalizeAngle(source);
    return diff > Math.PI
        ? diff - Math.PI * 2
        : diff < -Math.PI
            ? diff + Math.PI * 2
            : diff;
};

export const getNewPosition = (
    oldPosition: [number, number],
    directionAngle: number,
    distance: number): [number, number] => {
    const deltaY = Math.sin(Math.PI * 0.5 - directionAngle) * distance;
    const deltaX = Math.cos(Math.PI * 0.5 - directionAngle) * distance;
    return [
        oldPosition[0] + deltaX,
        oldPosition[1] + deltaY,
    ];
};