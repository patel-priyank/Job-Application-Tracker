import { Center, Container } from '@mantine/core';

import { HEADER_HEIGHT } from '../utils/constants';

const PageCenter = ({ pageReady, children }: { pageReady: boolean; children: React.ReactNode }) => {
  return (
    <Center h={`calc(100dvh - ${HEADER_HEIGHT}px - ${pageReady ? 90 : 32}px)`}>
      <Container size="sm" p={0}>
        {children}
      </Container>
    </Center>
  );
};

export default PageCenter;
