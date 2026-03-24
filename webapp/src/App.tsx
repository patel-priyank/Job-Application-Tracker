import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Analytics } from '@vercel/analytics/react';
import { jwtDecode } from 'jwt-decode';

import {
  ActionIcon,
  Affix,
  Anchor,
  AppShell,
  Avatar,
  Button,
  Card,
  Center,
  Container,
  createTheme,
  Divider,
  Drawer,
  Flex,
  Group,
  Image,
  Loader,
  MantineProvider,
  Modal,
  NavLink,
  SegmentedControl,
  Stack,
  Text,
  Transition,
  useMantineColorScheme
} from '@mantine/core';

import { useDisclosure, useViewportSize, useWindowEvent, useWindowScroll } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';

import {
  IconBrandGithub,
  IconChartBar,
  IconCircleArrowUp,
  IconDevices,
  IconFiles,
  IconMoon,
  IconPaint,
  IconSettings,
  IconSun,
  IconUser
} from '@tabler/icons-react';

import { ApplicationContextProvider } from './contexts/ApplicationContext';
import { AuthContextProvider } from './contexts/AuthContext';

import { useApplicationContext } from './hooks/useApplicationContext';
import { useAuthContext } from './hooks/useAuthContext';

import PageCenter from './components/PageCenter.component';

import Account from './pages/Account.page';
import Applications from './pages/Applications.page';
import Home from './pages/Home.page';
import Statistics from './pages/Statistics.page';

import { APPLICATION_STATUS, FOOTER_HEIGHT, HEADER_HEIGHT } from './utils/constants';
import { fetchApplications } from './utils/functions';

import { isMaxSm } from './utils/breakpoints';

import '@mantine/core/styles.css';

import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import './App.css';

import navLinkClasses from './styles/NavLink.module.css';

const theme = createTheme({
  cursorType: 'pointer',
  fontFamily: 'Geist, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji',
  fontFamilyMonospace: 'Geist Mono, ui-monospace, monospace, Apple Color Emoji, Segoe UI Emoji',
  headings: {
    fontFamily: 'Geist, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji'
  }
});

const NavItems = ({ isDesktop }: { isDesktop: boolean }) => {
  const location = useLocation();

  const navItems = [
    {
      label: 'Applications',
      link: '/applications',
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
          bdrs="md"
          w={isDesktop ? 'max-content' : '100%'}
          classNames={isDesktop ? undefined : navLinkClasses}
        />
      ))}
    </>
  );
};

const ScrollToTopButton = () => {
  const { height } = useViewportSize();

  const [scroll, scrollTo] = useWindowScroll();

  return (
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
  );
};

const Public = ({ children }: { children: React.ReactNode }) => {
  const { user, ready } = useAuthContext();
  if (!ready) return null;
  return user ? <Navigate to="/applications" replace /> : children;
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, ready } = useAuthContext();
  if (!ready) return null;
  return user ? children : <Navigate to="/" replace />;
};

const AppContent = () => {
  const { order, page, pageSize, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { ready, user, dispatch: authDispatch } = useAuthContext();

  const maxSmBreakpoint = isMaxSm();

  const [signedOutOpened, { open: openSignedOut, close: closeSignedOut }] = useDisclosure(false);
  const [settingsDrawerOpened, { open: openSettingsDrawer, close: closeSettingsDrawer }] = useDisclosure(false);

  const [signedOutMessage, setSignedOutMessage] = useState('');

  const location = useLocation();

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

    const data = await response.json();

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
        setSignedOutMessage('You have been signed out because your password was changed on another device.');
      } else {
        setSignedOutMessage('You have been signed out because your session could not be verified.');
      }

      openSignedOut();

      return null;
    }

    return data;
  };

  useWindowEvent('blur', checkSessionValidity);

  const { colorScheme, setColorScheme } = useMantineColorScheme();

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

        setSignedOutMessage('You have been signed out because your session expired.');

        openSignedOut();

        return;
      }

      const validatedUser = await checkSessionValidity();

      if (!validatedUser) {
        return;
      }

      applicationDispatch({
        type: 'SET_FILTERS',
        payload: {
          statusFilter: Object.values(APPLICATION_STATUS).map(status => status.label),
          emailUsedFilter: validatedUser.suggestedEmails
        }
      });

      await fetchApplications(
        JSON.parse(user).token,
        applicationDispatch,
        Object.values(APPLICATION_STATUS).map(status => status.label),
        validatedUser.suggestedEmails,
        sort,
        order,
        pageSize,
        page
      );

      localStorage.setItem('user', JSON.stringify(validatedUser));

      authDispatch({
        type: 'SET_USER',
        payload: validatedUser
      });
    }, 1500);
  }, [authDispatch]);

  return (
    <AppShell padding="md" header={{ height: HEADER_HEIGHT }} footer={{ height: FOOTER_HEIGHT }}>
      <Notifications limit={1} position="top-right" style={{ marginTop: HEADER_HEIGHT }} />

      <AppShell.Header className="glass">
        <Group h="100%" px="md" wrap="nowrap">
          <Text component="h2" size="lg" truncate fw="bold">
            {location.pathname === '/' && 'Job Application Tracker'}
            {location.pathname === '/applications' && 'Applications'}
            {location.pathname === '/statistics' && 'Statistics'}
            {location.pathname === '/account' && 'Account'}
          </Text>

          <Group ml="auto" gap="xs" wrap="nowrap">
            {user && (
              <Group gap={4} wrap="nowrap" visibleFrom="sm">
                <NavItems isDesktop={true} />
              </Group>
            )}

            <ActionIcon variant="default" onClick={openSettingsDrawer}>
              <IconSettings size={16} stroke={1.5} />
            </ActionIcon>

            <Drawer
              position="right"
              opened={settingsDrawerOpened}
              onClose={closeSettingsDrawer}
              title="Settings"
              overlayProps={{ blur: 2 }}
              zIndex={450}
            >
              <Stack gap="xl" mb="xl">
                <Card shadow="xs" radius="md" withBorder>
                  <Stack gap="lg">
                    <Group>
                      <Avatar color="gray" radius="xl" size="md">
                        <IconPaint size={20} stroke={1.5} />
                      </Avatar>

                      <Text flex={1} truncate>
                        Theme
                      </Text>
                    </Group>

                    <SegmentedControl
                      size="xl"
                      value={colorScheme}
                      onChange={(themeValue: any) => {
                        if ('startViewTransition' in document) {
                          document.documentElement.classList.add('theme-switch');

                          const transition = (document as any).startViewTransition(() => {
                            setColorScheme(themeValue);
                          });

                          transition.finished.finally(() => {
                            document.documentElement.classList.remove('theme-switch');
                          });
                        } else {
                          setColorScheme(themeValue);
                        }
                      }}
                      data={[
                        {
                          value: 'light',
                          label: (
                            <Center>
                              <IconSun size={20} stroke={1.5} />
                            </Center>
                          )
                        },
                        {
                          value: 'auto',
                          label: (
                            <Center>
                              <IconDevices size={20} stroke={1.5} />
                            </Center>
                          )
                        },
                        {
                          value: 'dark',
                          label: (
                            <Center>
                              <IconMoon size={20} stroke={1.5} />
                            </Center>
                          )
                        }
                      ]}
                    />
                  </Stack>
                </Card>

                <Button
                  variant="default"
                  leftSection={<IconBrandGithub size={20} stroke={1.5} />}
                  component="a"
                  href="https://github.com/patel-priyank/Job-Application-Tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ alignSelf: 'center' }}
                >
                  Source code
                </Button>

                <Stack align="center">
                  <Text ta="center" c="dimmed" style={{ textWrap: 'balance' }}>
                    If this tracker took the chaos out of your job search, buy me a coffee — it keeps the project going
                    and helps me build more tools like it!
                  </Text>

                  <Flex>
                    <a
                      href="https://www.buymeacoffee.com/priyankp"
                      target="_blank"
                      className="outline"
                      style={{
                        borderRadius: '7px'
                      }}
                    >
                      <Image
                        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                        alt="Buy Me A Coffee"
                        w={160}
                        fit="contain"
                      />
                    </a>
                  </Flex>
                </Stack>

                <Divider my="md" />

                <Stack align="center" gap="xs">
                  <Image src="/favicon.svg" alt="" h={64} w={64} fit="contain" />

                  <Text fw="bold" ta="center">
                    Job Application Tracker
                  </Text>

                  <Text size="sm" ta="center" c="dimmed" style={{ textWrap: 'balance' }}>
                    All your job applications, synced across devices. Track your progress and view your statistics all
                    in one place.
                  </Text>
                </Stack>

                <Text size="xs" ta="center" c="dimmed">
                  Made with ❤️ by{' '}
                  <Anchor href="https://priyankpatel.me/" target="_blank" rel="noopener noreferrer" c="blue">
                    Priyank
                  </Anchor>
                </Text>
              </Stack>
            </Drawer>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main pb={74 + (maxSmBreakpoint ? FOOTER_HEIGHT : 0)}>
        <ScrollToTopButton />

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
              <Route
                path="/"
                element={
                  <Public>
                    <Home />
                  </Public>
                }
              />

              <Route
                path="/applications"
                element={
                  <RequireAuth>
                    <Applications />
                  </RequireAuth>
                }
              />

              <Route
                path="/statistics"
                element={
                  <RequireAuth>
                    <Statistics />
                  </RequireAuth>
                }
              />

              <Route
                path="/account"
                element={
                  <RequireAuth>
                    <Account />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        ) : (
          <PageCenter>
            <Flex>
              <Loader />
            </Flex>
          </PageCenter>
        )}
      </AppShell.Main>

      {user && (
        <AppShell.Footer hiddenFrom="sm" className="glass">
          <Group gap={4} wrap="nowrap" p={4} h="100%">
            <NavItems isDesktop={false} />
          </Group>
        </AppShell.Footer>
      )}
    </AppShell>
  );
};

const App = () => {
  return (
    <>
      <Analytics />

      <MantineProvider theme={theme} defaultColorScheme="auto">
        <AuthContextProvider>
          <ApplicationContextProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ApplicationContextProvider>
        </AuthContextProvider>
      </MantineProvider>
    </>
  );
};

export default App;
