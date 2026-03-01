import { Affix, Button } from '@mantine/core';

import { isMaxSm } from '../utils/breakpoints';
import { FOOTER_HEIGHT } from '../utils/constants';

const FloatingActionButton = ({
  icon: Icon,
  label,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => {
  const maxSmBreakpoint = isMaxSm();

  return (
    <Affix position={{ bottom: 16 + (maxSmBreakpoint ? FOOTER_HEIGHT : 0), right: 16 }} zIndex={95}>
      <Button
        leftSection={<Icon size={20} stroke={1.5} />}
        radius="xl"
        size="md"
        className="floating-button"
        onClick={onClick}
      >
        {label}
      </Button>
    </Affix>
  );
};

export default FloatingActionButton;
