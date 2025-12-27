import { Button, Group, Modal, Stack, Text } from '@mantine/core';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { showNotification } from '../utils/functions';

const SignOut = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { dispatch: applicationDispatch } = useApplicationContext();
  const { dispatch: authDispatch } = useAuthContext();

  const handleSignOut = () => {
    localStorage.removeItem('user');

    applicationDispatch({
      type: 'SET_APPLICATIONS',
      payload: []
    });

    authDispatch({
      type: 'SET_USER',
      payload: null
    });

    showNotification('Until next time!', 'You have signed out of your account.', false);

    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Sign Out" overlayProps={{ blur: 2 }} centered>
      <Stack gap="sm">
        <Text size="sm">Are you sure you want to sign out? You'll need to sign in again to access your account.</Text>

        <Group mt="sm">
          <Button data-autofocus onClick={handleSignOut}>
            Sign out
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SignOut;
