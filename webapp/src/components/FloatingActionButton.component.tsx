import { Affix, Button } from '@mantine/core';

const FloatingActionButton = ({
  icon: Icon,
  label,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => {
  return (
    <Affix position={{ bottom: 16, right: 16 }} zIndex={100}>
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
