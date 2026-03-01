import { useMediaQuery } from '@mantine/hooks';

export const isMaxXs = () => useMediaQuery('(max-width: 35.99375em)');
export const isMinXs = () => useMediaQuery('(min-width: 36em)');
export const isMaxSm = () => useMediaQuery('(max-width: 47.99375em)');
export const isMinSm = () => useMediaQuery('(min-width: 48em)');
export const isMaxMd = () => useMediaQuery('(max-width: 61.99375em)');
export const isMinMd = () => useMediaQuery('(min-width: 62em)');
export const isMaxLg = () => useMediaQuery('(max-width: 74.99375em)');
export const isMinLg = () => useMediaQuery('(min-width: 75em)');
export const isMaxXl = () => useMediaQuery('(max-width: 87.99375em)');
export const isMinXl = () => useMediaQuery('(min-width: 88em)');
