import { Button, Group, Modal, Stack, Text } from '@mantine/core';

const EditEmailsUsed = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Edit Emails Used" overlayProps={{ blur: 2 }} centered>
      <Stack gap="sm">
        <Text size="sm">This functionality is still in development.</Text>

        <Group mt="sm">
          <Button data-autofocus variant="outline" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditEmailsUsed;
