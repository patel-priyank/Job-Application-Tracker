import { Button, Image, Stack, Text, Title, UnstyledButton } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import PageCenter from '../components/PageCenter.component';
import SignIn from '../components/SignIn.component';
import SignUp from '../components/SignUp.component';

const Home = () => {
  const [signInOpened, { open: openSignIn, close: closeSignIn }] = useDisclosure(false);
  const [signUpOpened, { open: openSignUp, close: closeSignUp }] = useDisclosure(false);

  return (
    <>
      <SignIn opened={signInOpened} onClose={closeSignIn} />
      <SignUp opened={signUpOpened} onClose={closeSignUp} />

      <PageCenter pageReady={true}>
        <Stack align="center" gap="xl">
          <Image src="./favicon.svg" alt="" h={80} w={80} fit="contain" />

          <Title order={1} ta="center">
            Job Application Tracker
          </Title>

          <Text size="lg" ta="center" style={{ textWrap: 'balance' }}>
            All your job applications, synced across devices. Track your progress and view your statistics all in one
            place.
          </Text>

          <Button size="md" onClick={openSignUp}>
            Get started
          </Button>

          <Text>
            Already have an account?{' '}
            <UnstyledButton c="blue" onClick={openSignIn}>
              Sign in
            </UnstyledButton>
          </Text>
        </Stack>
      </PageCenter>
    </>
  );
};

export default Home;
