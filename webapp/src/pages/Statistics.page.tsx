import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Accordion,
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  ColorSwatch,
  Divider,
  Grid,
  Group,
  Image,
  Loader,
  Popover,
  Progress,
  Stack,
  Text
} from '@mantine/core';
import { BarChart } from '@mantine/charts';

import { IconInfoCircle, IconNumber123 } from '@tabler/icons-react';

import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS, HEADER_HEIGHT } from '../utils/constants';
import { showNotification } from '../utils/functions';

import createStatisticsImage from '../assets/create-statistics.png';
import statisticsErrorImage from '../assets/statistics-error.png';
import statisticsImage from '../assets/statistics.png';

interface StatisticItem {
  label: string;
  [key: string]: string | number;
}

interface StatisticsState {
  statusCounts: StatisticItem[];
  weeklyActivity: StatisticItem[];
  monthlyActivity: StatisticItem[];
}

const Statistics = () => {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsState>({
    statusCounts: [],
    weeklyActivity: [],
    monthlyActivity: []
  });

  useEffect(() => {
    getStatistics();
  }, []);

  const getStatistics = async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch('/api/statistics', {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);

      return;
    }

    const orderedStatuses = Object.values(APPLICATION_STATUS).map(s => s.label);

    setStatistics({
      statusCounts: data.statusCounts.sort((a: { label: string }, b: { label: string }) => {
        return orderedStatuses.indexOf(a.label) - orderedStatuses.indexOf(b.label);
      }),
      weeklyActivity: data.weeklyActivity,
      monthlyActivity: data.monthlyActivity
    });

    setLoading(false);
  };

  const isError =
    user && user.applicationsCount > 0 && !loading && Object.values(statistics).every(value => value.length === 0);

  const isValid =
    user && user.applicationsCount > 0 && !loading && Object.values(statistics).every(value => value.length !== 0);

  return (
    <>
      <Group>
        <Text component="h2" size="lg" fw="500">
          Statistics
        </Text>
      </Group>

      <Divider my="md" />

      {!user && (
        <Grid justify="center">
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image src={statisticsImage} alt="" h={{ base: 240, md: 360 }} p="md" style={{ objectFit: 'contain' }} />

              <Text my="md" c="dimmed" flex={1}>
                Sign up or sign in now to access your dashboard and view your statistics. It only takes a minute!
              </Text>

              <Group>
                <Button component={Link} to="/account">
                  Go to Account
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && user.applicationsCount === 0 && (
        <Grid justify="center">
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image
                src={createStatisticsImage}
                alt=""
                h={{ base: 240, md: 360 }}
                p="md"
                style={{ objectFit: 'contain' }}
              />

              <Text my="md" c="dimmed" flex={1}>
                Start by creating your first job application to unlock and view your statistics. It's just a few clicks
                away!
              </Text>

              <Group>
                <Button component={Link} to="/applications">
                  Go to Applications
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && user.applicationsCount > 0 && loading && (
        <Center h={`calc(100dvh - ${HEADER_HEIGHT}px - 151.8px)`}>
          <Loader />
        </Center>
      )}

      {isError && (
        <Grid justify="center">
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image
                src={statisticsErrorImage}
                alt=""
                h={{ base: 240, md: 360 }}
                p="md"
                style={{ objectFit: 'contain' }}
              />

              <Text my="md" c="dimmed" flex={1}>
                Something went wrong while fetching your statistics.
              </Text>

              <Group>
                <Button onClick={getStatistics}>Retry</Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {isValid && (
        <>
          <Accordion variant="separated" radius="lg" mb="lg" defaultValue="overview">
            <Accordion.Item value="overview">
              <Accordion.Control>
                <Group wrap="nowrap">
                  <Avatar color="green" radius="xl" size="md">
                    <IconNumber123 size={20} stroke={1.5} />
                  </Avatar>
                  <Box>
                    <Text>Overview</Text>
                    <Text size="sm" c="dimmed">
                      Tracking {user.applicationsCount} applications
                    </Text>
                  </Box>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Grid justify="center">
                  {Object.values(APPLICATION_STATUS).map(status => {
                    const count = statistics.statusCounts.find(s => s.label === status.label)?.value ?? 0;

                    return (
                      <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={status.label}>
                        <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                          <Stack gap="xs" align="center">
                            <Group gap="xs">
                              <ColorSwatch
                                color={`var(--mantine-color-${status.color}-filled)`}
                                size="var(--mantine-font-size-md)"
                              />
                              <Text>{status.label}</Text>
                            </Group>

                            <Text c="dimmed" size="xl" fw="500">
                              {count}
                            </Text>

                            <Progress
                              mt="xs"
                              w="75%"
                              size="xs"
                              value={(Number(count) / user.applicationsCount) * 100}
                              color={status.color}
                            />
                          </Stack>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="md" shadow="md" radius="lg" withBorder h="100%">
                <Stack gap="xl">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text>Weekly Activity</Text>
                      <Text size="sm" c="dimmed">
                        Last 4 weeks
                      </Text>
                    </Stack>

                    <Popover width={240} shadow="xs" withArrow offset={0}>
                      <Popover.Target>
                        <ActionIcon variant="subtle">
                          <IconInfoCircle size={16} stroke={1.5} />
                        </ActionIcon>
                      </Popover.Target>

                      <Popover.Dropdown>
                        <Text size="sm">
                          Number of status updates per week, includes both new applications and existing ones that moved
                          to a different status during the week.
                        </Text>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>

                  <BarChart
                    h={480}
                    data={statistics.weeklyActivity}
                    dataKey="label"
                    type="stacked"
                    series={Object.values(APPLICATION_STATUS).map(status => ({
                      name: status.label,
                      color: status.color
                    }))}
                    tooltipAnimationDuration={250}
                    tickLine="y"
                    gridAxis="x"
                    xAxisProps={{ angle: -90, textAnchor: 'end', height: 100 }}
                  />
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="md" shadow="md" radius="lg" withBorder h="100%">
                <Stack gap="xl">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text>Monthly Activity</Text>
                      <Text size="sm" c="dimmed">
                        Last 6 months
                      </Text>
                    </Stack>

                    <Popover width={240} shadow="xs" withArrow offset={0}>
                      <Popover.Target>
                        <ActionIcon variant="subtle">
                          <IconInfoCircle size={16} stroke={1.5} />
                        </ActionIcon>
                      </Popover.Target>

                      <Popover.Dropdown>
                        <Text size="sm">
                          Number of status updates per month, includes both new applications and existing ones that
                          moved to a different status during the month.
                        </Text>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>

                  <BarChart
                    h={480}
                    data={statistics.monthlyActivity}
                    dataKey="label"
                    type="stacked"
                    series={Object.values(APPLICATION_STATUS).map(status => ({
                      name: status.label,
                      color: status.color
                    }))}
                    tooltipAnimationDuration={250}
                    tickLine="y"
                    gridAxis="x"
                    xAxisProps={{ angle: -90, textAnchor: 'end', height: 100 }}
                  />
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </>
      )}
    </>
  );
};

export default Statistics;
