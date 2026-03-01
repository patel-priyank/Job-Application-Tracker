import { Center, Container } from '@mantine/core';

import { isMaxSm } from '../utils/breakpoints';
import { FOOTER_HEIGHT, HEADER_HEIGHT } from '../utils/constants';

const PageCenter = ({ children }: { children: React.ReactNode }) => {
  const maxSmBreakpoint = isMaxSm();

  return (
    <Center h={`calc(100dvh - ${HEADER_HEIGHT}px - 90px - ${maxSmBreakpoint ? FOOTER_HEIGHT : 0}px)`}>
      <Container size="sm" p={0}>
        {children}
      </Container>
    </Center>
  );
};

export default PageCenter;
