import layout from '../../layout.json';

import { useMediaQuery } from '@mantine/hooks';

export const isMaxXs = () => useMediaQuery(`(max-width: ${layout.breakpoints.max.xs})`);
export const isMinXs = () => useMediaQuery(`(min-width: ${layout.breakpoints.min.xs})`);
export const isMaxSm = () => useMediaQuery(`(max-width: ${layout.breakpoints.max.sm})`);
export const isMinSm = () => useMediaQuery(`(min-width: ${layout.breakpoints.min.sm})`);
export const isMaxMd = () => useMediaQuery(`(max-width: ${layout.breakpoints.max.md})`);
export const isMinMd = () => useMediaQuery(`(min-width: ${layout.breakpoints.min.md})`);
export const isMaxLg = () => useMediaQuery(`(max-width: ${layout.breakpoints.max.lg})`);
export const isMinLg = () => useMediaQuery(`(min-width: ${layout.breakpoints.min.lg})`);
export const isMaxXl = () => useMediaQuery(`(max-width: ${layout.breakpoints.max.xl})`);
export const isMinXl = () => useMediaQuery(`(min-width: ${layout.breakpoints.min.xl})`);
