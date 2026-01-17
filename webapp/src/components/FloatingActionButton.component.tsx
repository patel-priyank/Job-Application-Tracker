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
      <Button hiddenFrom="sm" radius="xl" size="md" className="fab-shadow" onClick={onClick}>
        <Icon size={20} stroke={1.5} />
      </Button>

      <Button
        visibleFrom="sm"
        leftSection={<Icon size={20} stroke={1.5} />}
        radius="xl"
        size="md"
        className="fab-shadow"
        onClick={onClick}
      >
        {label}
      </Button>
    </Affix>
  );
};

export default FloatingActionButton;
