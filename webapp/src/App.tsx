import { useEffect } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { jwtDecode } from 'jwt-decode';

import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Group,
  MantineProvider,
  NavLink,
  Text,
  Tooltip,
  Transition,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core';
import { useDisclosure, useViewportSize, useWindowScroll } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';

import { IconChartBar, IconFiles, IconMoon, IconSun, IconUser } from '@tabler/icons-react';

import { ApplicationContextProvider } from './contexts/ApplicationContext';
import { AuthContextProvider } from './contexts/AuthContext';

import { useApplicationContext } from './hooks/useApplicationContext';
import { useAuthContext } from './hooks/useAuthContext';

import Account from './pages/Account.page';
import Applications from './pages/Applications.page';
import Loading from './pages/Loading.page';
import Statistics from './pages/Statistics.page';

import { fetchApplications } from './utils/functions';

import '@mantine/core/styles.css';

import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import './App.scss';

const AppContent = () => {
  const { dispatch: applicationDispatch } = useApplicationContext();
  const { ready, dispatch: authDispatch } = useAuthContext();

  const [opened, { toggle, close }] = useDisclosure();

  const location = useLocation();

  const [scroll, scrollTo] = useWindowScroll();
  const { height } = useViewportSize();

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  useEffect(() => {
    setTimeout(async () => {
      const user = localStorage.getItem('user');

      if (user) {
        const decodedToken = jwtDecode(JSON.parse(user).token);

        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
          localStorage.removeItem('user');

          authDispatch({
            type: 'SET_USER',
            payload: null
          });

          return;
        }

        const response = await fetch('/api/users/renew-token', {
          headers: {
            Authorization: `Bearer ${JSON.parse(user).token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          await fetchApplications(user, applicationDispatch);

          localStorage.setItem('user', JSON.stringify(data));

          authDispatch({
            type: 'SET_USER',
            payload: data
          });
        }

        return;
      }

      authDispatch({
        type: 'SET_USER',
        payload: null
      });
    }, 1500);
  }, [authDispatch]);

  return ready ? (
    <AppShell
      padding="md"
      header={{ height: 60 }}
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
                <Button style={transitionStyles} size="compact-sm" onClick={() => scrollTo({ y: 0 })}>
                  Scroll to top
                </Button>
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
        />
        <NavLink
          component={Link}
          to="/statistics"
          label="Statistics"
          leftSection={<IconChartBar size={20} stroke={1.5} />}
          active={location.pathname === '/statistics'}
          onClick={close}
        />
        <NavLink
          component={Link}
          to="/account"
          label="Account"
          leftSection={<IconUser size={20} stroke={1.5} />}
          active={location.pathname === '/account'}
          onClick={close}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ paddingBottom: '74px' }}>
        <Routes>
          <Route path="/" element={<Applications />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  ) : (
    <Loading />
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
