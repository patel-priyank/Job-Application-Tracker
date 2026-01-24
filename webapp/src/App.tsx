import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { jwtDecode } from 'jwt-decode';

import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Center,
  Container,
  Group,
  Loader,
  MantineProvider,
  Modal,
  NavLink,
  Stack,
  Text,
  Tooltip,
  Transition,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core';
import { useDisclosure, useViewportSize, useWindowEvent, useWindowScroll } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';

import {
  IconBrandGithub,
  IconChartBar,
  IconCircleArrowUp,
  IconFiles,
  IconMoon,
  IconSun,
  IconUser
} from '@tabler/icons-react';

import { ApplicationContextProvider } from './contexts/ApplicationContext';
import { AuthContextProvider } from './contexts/AuthContext';

import { useApplicationContext } from './hooks/useApplicationContext';
import { useAuthContext } from './hooks/useAuthContext';

import Account from './pages/Account.page';
import Applications from './pages/Applications.page';
import Statistics from './pages/Statistics.page';

import { HEADER_HEIGHT } from './utils/constants';
import { fetchApplications } from './utils/functions';

import '@mantine/core/styles.css';

import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import './App.scss';

const AppContent = () => {
  const { order, page, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { ready, dispatch: authDispatch } = useAuthContext();

  const [opened, { toggle, close }] = useDisclosure();
  const [signedOutOpened, { open: openSignedOut, close: closeSignedOut }] = useDisclosure(false);

  const [signedOutMessage, setSignedOutMessage] = useState('');

  const location = useLocation();

  const [scroll, scrollTo] = useWindowScroll();
  const { height } = useViewportSize();

  const checkSessionValidity = async () => {
    const user = localStorage.getItem('user');

    if (!user) {
      return;
    }

    const response = await fetch('/api/users/renew-token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JSON.parse(user).token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem('user');

      applicationDispatch({
        type: 'SET_APPLICATIONS',
        payload: []
      });

      authDispatch({
        type: 'SET_USER',
        payload: null
      });

      if (response.status === 401) {
        setSignedOutMessage("You've been signed out because your password was changed on another device.");
      } else {
        setSignedOutMessage("You've been signed out because your session could not be verified.");
      }

      openSignedOut();
    }
  };

  useWindowEvent('focus', checkSessionValidity);
  useWindowEvent('blur', checkSessionValidity);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  useEffect(() => {
    setTimeout(async () => {
      const user = localStorage.getItem('user');

      if (!user) {
        authDispatch({
          type: 'SET_USER',
          payload: null
        });

        return;
      }

      const decodedToken = jwtDecode(JSON.parse(user).token);

      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem('user');

        authDispatch({
          type: 'SET_USER',
          payload: null
        });

        setSignedOutMessage("You've been signed out because your session expired.");

        openSignedOut();

        return;
      }

      const response = await fetch('/api/users/renew-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${JSON.parse(user).token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('user');

        authDispatch({
          type: 'SET_USER',
          payload: null
        });

        if (response.status === 401) {
          setSignedOutMessage("You've been signed out because your password was changed on another device.");
        } else {
          setSignedOutMessage("You've been signed out because your session could not be verified.");
        }

        openSignedOut();

        return;
      }

      await fetchApplications(sort, order, page, JSON.parse(user).token, applicationDispatch);

      localStorage.setItem('user', JSON.stringify(data));

      authDispatch({
        type: 'SET_USER',
        payload: data
      });
    }, 1500);
  }, [authDispatch]);

  return (
    <AppShell
      padding="md"
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" wrap="nowrap">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

          <Text component="h1" size="lg" truncate="end" fw="bold">
            Job Application Tracker
          </Text>

          <Group ml="auto" gap="xs" wrap="nowrap">
            <Transition transition="slide-down" mounted={scroll.y > height * 0.25}>
              {transitionStyles => (
                <>
                  <Button
                    variant="light"
                    style={transitionStyles}
                    size="xs"
                    onClick={() => scrollTo({ y: 0 })}
                    hiddenFrom="sm"
                  >
                    <IconCircleArrowUp size={16} stroke={1.5} />
                  </Button>

                  <Button
                    variant="light"
                    style={transitionStyles}
                    size="xs"
                    onClick={() => scrollTo({ y: 0 })}
                    visibleFrom="sm"
                    leftSection={<IconCircleArrowUp size={16} stroke={1.5} />}
                  >
                    Scroll to top
                  </Button>
                </>
              )}
            </Transition>

            <Tooltip label={computedColorScheme === 'light' ? 'Dark mode' : 'Light mode'}>
              <ActionIcon
                variant="default"
                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
              >
                {computedColorScheme === 'light' ? (
                  <IconMoon size={16} stroke={1.5} />
                ) : (
                  <IconSun size={16} stroke={1.5} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <NavLink
          component={Link}
          to="/"
          label="Applications"
          leftSection={<IconFiles size={20} stroke={1.5} />}
          active={location.pathname === '/'}
          onClick={close}
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
        <NavLink
          component={Link}
          to="/statistics"
          label="Statistics"
          leftSection={<IconChartBar size={20} stroke={1.5} />}
          active={location.pathname === '/statistics'}
          onClick={close}
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
        <NavLink
          component={Link}
          to="/account"
          label="Account"
          leftSection={<IconUser size={20} stroke={1.5} />}
          active={location.pathname === '/account'}
          onClick={close}
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
        <NavLink
          mt="auto"
          href="https://github.com/patel-priyank/Job-Application-Tracker"
          target="_blank"
          rel="noopener noreferrer"
          label="Source Code"
          leftSection={<IconBrandGithub size={20} stroke={1.5} />}
          onClick={close}
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
      </AppShell.Navbar>

      <AppShell.Main pb={ready ? 74 : undefined}>
        <Modal opened={signedOutOpened} onClose={closeSignedOut} title="Signed Out" overlayProps={{ blur: 2 }} centered>
          <Stack gap="sm">
            <Text size="sm">{signedOutMessage}</Text>

            <Group mt="sm">
              <Button data-autofocus variant="outline" onClick={closeSignedOut}>
                Okay
              </Button>
            </Group>
          </Stack>
        </Modal>

        {ready ? (
          <Container size="xl" p={0}>
            <Routes>
              <Route path="/" element={<Applications />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        ) : (
          <Center h={`calc(100dvh - ${HEADER_HEIGHT}px - 32px)`}>
            <Loader />
          </Center>
        )}
      </AppShell.Main>
    </AppShell>
  );
};

const App = () => {
  return (
    <MantineProvider>
      <Notifications limit={1} />

      <AuthContextProvider>
        <ApplicationContextProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ApplicationContextProvider>
      </AuthContextProvider>
    </MantineProvider>
  );
};

export default App;
