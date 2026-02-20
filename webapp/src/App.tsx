import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { jwtDecode } from 'jwt-decode';

import {
  ActionIcon,
  Affix,
  AppShell,
  Burger,
  Button,
  Center,
  Container,
  createTheme,
  FocusTrap,
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

import { APPLICATION_STATUS, HEADER_HEIGHT } from './utils/constants';
import { fetchApplications } from './utils/functions';

import '@mantine/core/styles.css';

import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import './App.css';

const theme = createTheme({
  cursorType: 'pointer',
  fontFamily:
    'Google Sans Flex, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
  fontFamilyMonospace:
    'Google Sans Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
  headings: {
    fontFamily:
      'Google Sans Flex, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji'
  }
});

const NavItems = ({ opened, close, isDesktop }: { opened: boolean; close: () => void; isDesktop: boolean }) => {
  const location = useLocation();

  const navItems = [
    {
      label: 'Applications',
      link: '/',
      icon: <IconFiles size={20} stroke={1.5} />
    },
    {
      label: 'Statistics',
      link: '/statistics',
      icon: <IconChartBar size={20} stroke={1.5} />
    },
    {
      label: 'Account',
      link: '/account',
      icon: <IconUser size={20} stroke={1.5} />
    }
  ];

  return (
    <>
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          component={Link}
          to={item.link}
          label={item.label}
          leftSection={item.icon}
          active={location.pathname === item.link}
          onClick={close}
          style={{ borderRadius: 'var(--mantine-radius-md)', width: isDesktop ? 'max-content' : '100%' }}
          tabIndex={isDesktop || opened ? undefined : -1}
        />
      ))}
    </>
  );
};

const AppContent = () => {
  const { order, page, pageSize, sort, dispatch: applicationDispatch } = useApplicationContext();
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
        payload: {
          applications: [],
          totalPages: 0
        }
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

      await fetchApplications(
        JSON.parse(user).token,
        applicationDispatch,
        Object.values(APPLICATION_STATUS).map(status => status.label),
        data.suggestedEmails,
        sort,
        order,
        pageSize,
        page
      );

      localStorage.setItem('user', JSON.stringify(data));

      authDispatch({
        type: 'SET_USER',
        payload: data
      });

      applicationDispatch({
        type: 'SET_FILTERS',
        payload: {
          statusFilter: Object.values(APPLICATION_STATUS).map(status => status.label),
          emailUsedFilter: data.suggestedEmails
        }
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
        collapsed: { desktop: true, mobile: !opened }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" wrap="nowrap">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

          <Text component="h1" size="lg" truncate="end" fw="bold">
            {location.pathname === '/' && 'Applications'}
            {location.pathname === '/statistics' && 'Statistics'}
            {location.pathname === '/account' && 'Account'}
          </Text>

          <Group ml="auto" gap="xs" wrap="nowrap">
            <Group gap={0} visibleFrom="sm" wrap="nowrap">
              <NavItems opened={opened} close={close} isDesktop={true} />
            </Group>

            <Tooltip label="Source code">
              <ActionIcon
                variant="default"
                component={Link}
                to="https://github.com/patel-priyank/Job-Application-Tracker"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandGithub size={16} stroke={1.5} />
              </ActionIcon>
            </Tooltip>

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

      <FocusTrap active={opened}>
        <AppShell.Navbar p="xs" hiddenFrom="sm">
          <NavItems opened={opened} close={close} isDesktop={false} />
        </AppShell.Navbar>
      </FocusTrap>

      <AppShell.Main pb={ready ? 74 : undefined}>
        <Transition transition="fade-down" mounted={scroll.y > height * 0.25}>
          {transitionStyles => (
            <Affix position={{ top: HEADER_HEIGHT + 16, left: 0, right: 0 }} zIndex={95} w="fit-content" mx="auto">
              <Button
                variant="default"
                radius="md"
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
                className="floating-button"
                leftSection={<IconCircleArrowUp size={16} stroke={1.5} />}
              >
                Scroll to top
              </Button>
            </Affix>
          )}
        </Transition>

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
    <MantineProvider theme={theme}>
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
