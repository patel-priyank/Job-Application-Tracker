import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Accordion,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  ColorSwatch,
  Grid,
  Group,
  Image,
  Loader,
  Progress,
  SegmentedControl,
  Stack,
  Tabs,
  Text
} from '@mantine/core';

import { LineChart } from '@mantine/charts';

import { IconCalendarEvent, IconCalendarMonth, IconCalendarWeek, IconCircles } from '@tabler/icons-react';

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

const Statistics = () => {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statistics, setStatistics] = useState<{
    statusCounts: StatisticItem[];
    dailyActivity: StatisticItem[];
    weeklyActivity: StatisticItem[];
    monthlyActivity: StatisticItem[];
  }>({
    statusCounts: [],
    dailyActivity: [],
    weeklyActivity: [],
    monthlyActivity: []
  });

  const [activeTab, setActiveTab] = useState<string>('daily');

  const STATUS_ACTIVITY_TIME_PERIODS = [
    {
      value: 'daily',
      label: 'Daily',
      subLabel: 'This week',
      icon: IconCalendarEvent,
      data: statistics.dailyActivity
    },
    {
      value: 'weekly',
      label: 'Weekly',
      subLabel: 'Last 6 weeks',
      icon: IconCalendarWeek,
      data: statistics.weeklyActivity
    },
    {
      value: 'monthly',
      label: 'Monthly',
      subLabel: 'Last 6 months',
      icon: IconCalendarMonth,
      data: statistics.monthlyActivity
    }
  ];

  useEffect(() => {
    getStatistics();
  }, []);

  const getStatistics = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError(false);

    const response = await fetch('/api/statistics', {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);
      setError(true);

      return;
    }

    const orderedStatuses = Object.values(APPLICATION_STATUS).map(s => s.label);

    setStatistics({
      statusCounts: data.statusCounts.sort((a: { label: string }, b: { label: string }) => {
        return orderedStatuses.indexOf(a.label) - orderedStatuses.indexOf(b.label);
      }),
      dailyActivity: data.dailyActivity.map((item: Record<string, string | number>) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const itemDateStr = item.label as string;
        const itemDate = new Date(itemDateStr + ' ' + today.getFullYear());
        itemDate.setHours(0, 0, 0, 0);

        if (itemDate <= today) {
          orderedStatuses.forEach(status => {
            if (!item[status]) {
              item[status] = 0;
            }
          });
        }

        return item;
      }),
      weeklyActivity: data.weeklyActivity.map((item: Record<string, string | number>) => {
        orderedStatuses.forEach(status => {
          if (!item[status]) {
            item[status] = 0;
          }
        });

        return item;
      }),
      monthlyActivity: data.monthlyActivity.map((item: Record<string, string | number>) => {
        orderedStatuses.forEach(status => {
          if (!item[status]) {
            item[status] = 0;
          }
        });

        return item;
      })
    });

    setLoading(false);
  };

  return (
    <>
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
        <Center h={`calc(100dvh - ${HEADER_HEIGHT}px - 90px)`}>
          <Loader />
        </Center>
      )}

      {user && user.applicationsCount > 0 && !loading && error && (
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

      {user && user.applicationsCount > 0 && !loading && !error && (
        <>
          <Accordion variant="separated" radius="lg" mb="lg" defaultValue="overview">
            <Accordion.Item value="overview">
              <Accordion.Control>
                <Group wrap="nowrap">
                  <Avatar color="blue" radius="xl" size="md">
                    <IconCircles size={20} stroke={1.5} />
                  </Avatar>
                  <Box>
                    <Text>Overview</Text>
                    <Text size="sm" c="dimmed">
                      Current status of {user.applicationsCount} application{user.applicationsCount !== 1 && 's'}
                    </Text>
                  </Box>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Grid justify="center">
                  {Object.values(APPLICATION_STATUS).map(status => {
                    const count = statistics.statusCounts.find(s => s.label === status.label)?.value ?? 0;

                    return (
                      <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }} key={status.label}>
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
                              size="sm"
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
            <Grid.Col span={12}>
              <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                <Stack>
                  <Box>
                    <Text>Status Activity</Text>
                    <Text size="sm" c="dimmed">
                      Number of status updates per time period, includes both new applications and existing ones that
                      moved to a different status.
                    </Text>
                  </Box>

                  <Tabs variant="default" value={activeTab} keepMounted={false}>
                    <Box style={{ overflowX: 'auto' }}>
                      <SegmentedControl
                        value={activeTab}
                        onChange={setActiveTab}
                        data={STATUS_ACTIVITY_TIME_PERIODS.map(timePeriod => ({
                          value: timePeriod.value,
                          label: (
                            <Group gap="sm" wrap="nowrap">
                              <Avatar radius="xl" size="sm">
                                <timePeriod.icon size={16} stroke={1.5} />
                              </Avatar>
                              <Box style={{ textAlign: 'start' }}>
                                <Text size="sm">{timePeriod.label}</Text>
                                <Text size="xs" c="dimmed">
                                  {timePeriod.subLabel}
                                </Text>
                              </Box>
                            </Group>
                          )
                        }))}
                      />
                    </Box>

                    {STATUS_ACTIVITY_TIME_PERIODS.map(timePeriod => (
                      <Tabs.Panel value={timePeriod.value} pt="xl" key={timePeriod.value}>
                        <LineChart
                          h={480}
                          data={timePeriod.data}
                          dataKey="label"
                          curveType="linear"
                          series={Object.values(APPLICATION_STATUS).map(status => ({
                            name: status.label,
                            color: status.color
                          }))}
                          tooltipAnimationDuration={250}
                          tickLine="y"
                          gridAxis="x"
                          xAxisProps={{
                            angle: -90,
                            height: 100,
                            tick: {
                              textAnchor: 'end',
                              fill: 'var(--mantine-color-dimmed)',
                              fontSize: 'var(--mantine-font-size-xs)'
                            }
                          }}
                        />
                      </Tabs.Panel>
                    ))}
                  </Tabs>
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
