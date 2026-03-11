import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import dayjs from 'dayjs';
import { ReferenceArea } from 'recharts';

import {
  Accordion,
  Avatar,
  Box,
  Button,
  Card,
  ColorSwatch,
  Flex,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  Progress,
  SegmentedControl,
  Stack,
  Tabs,
  Text
} from '@mantine/core';

import { LineChart } from '@mantine/charts';

import { IconCircles } from '@tabler/icons-react';

import { useAuthContext } from '../hooks/useAuthContext';

import PageCenter from '../components/PageCenter.component';

import { APPLICATION_STATUS } from '../utils/constants';
import { showNotification } from '../utils/functions';

interface StatisticItem {
  label: string;
  [key: string]: string | number;
}

const ChartTooltip = ({ label, payload }: any) => {
  if (!payload) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="xl" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>

      {payload.map((item: any) => (
        <Text
          key={item.name}
          c={item.color}
          display="flex"
          style={{ gap: 'var(--mantine-spacing-xl)', justifyContent: 'space-between' }}
        >
          <Text span>{item.name}</Text>
          <Text span className="monospace">
            {item.value}
          </Text>
        </Text>
      ))}
    </Paper>
  );
};

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

  const STATUS_ACTIVITY_TIME_PERIODS = [
    {
      value: 'daily',
      label: 'Daily',
      subLabel: 'This week',
      data: statistics.dailyActivity
    },
    {
      value: 'weekly',
      label: 'Weekly',
      subLabel: 'Last 6 weeks',
      data: statistics.weeklyActivity
    },
    {
      value: 'monthly',
      label: 'Monthly',
      subLabel: 'Last 6 months',
      data: statistics.monthlyActivity
    }
  ];

  const [activeTab, setActiveTab] = useState(STATUS_ACTIVITY_TIME_PERIODS[0].value);

  useEffect(() => {
    getStatistics();
  }, []);

  const getStatistics = async () => {
    if (!user || user.applicationsCount === 0) {
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

  if (!user) {
    return null;
  }

  return (
    <>
      {user.applicationsCount === 0 && (
        <PageCenter>
          <Stack align="center" gap="xl">
            <Image
              src="./create-statistics.png"
              alt=""
              h={{ base: 240, md: 360 }}
              w={{ base: 240, md: 360 }}
              fit="contain"
            />

            <Text ta="center" style={{ textWrap: 'balance' }}>
              Start by creating your first application in the Applications page to view your statistics. It's just a few
              clicks away!
            </Text>

            <Button size="md" component={Link} to="/applications">
              Go to Applications
            </Button>
          </Stack>
        </PageCenter>
      )}

      {user.applicationsCount > 0 && loading && (
        <PageCenter>
          <Flex>
            <Loader />
          </Flex>
        </PageCenter>
      )}

      {user.applicationsCount > 0 && !loading && error && (
        <PageCenter>
          <Stack align="center" gap="xl">
            <Image
              src="./statistics-error.png"
              alt=""
              h={{ base: 240, md: 360 }}
              w={{ base: 240, md: 360 }}
              fit="contain"
            />

            <Text ta="center" style={{ textWrap: 'balance' }}>
              Something went wrong while fetching your statistics. You can retry using the button below, or refresh the
              page.
            </Text>

            <Button size="md" onClick={getStatistics}>
              Retry
            </Button>
          </Stack>
        </PageCenter>
      )}

      {user.applicationsCount > 0 && !loading && !error && (
        <>
          <Accordion variant="separated" radius="lg" mb="lg" defaultValue="overview">
            <Accordion.Item value="overview">
              <Accordion.Control>
                <Group mr="md" wrap="nowrap">
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
                        <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
                          <Stack>
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="xs" wrap="nowrap" className="max-content-width">
                                <ColorSwatch
                                  color={`var(--mantine-color-${status.color}-filled)`}
                                  size="var(--mantine-font-size-md)"
                                />

                                <Text truncate>{status.label}</Text>
                              </Group>

                              <Text size="lg" fw="500" className="monospace">
                                {count}
                              </Text>
                            </Group>

                            <Progress
                              mt="xs"
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
              <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
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
                            <Box style={{ textAlign: 'start' }}>
                              <Text size="sm">{timePeriod.label}</Text>
                              <Text size="xs" c="dimmed">
                                {timePeriod.subLabel}
                              </Text>
                            </Box>
                          )
                        }))}
                      />
                    </Box>

                    {STATUS_ACTIVITY_TIME_PERIODS.map(timePeriod => (
                      <Tabs.Panel value={timePeriod.value} pt="xl" pr="md" key={timePeriod.value}>
                        <LineChart
                          h={480}
                          data={timePeriod.data}
                          dataKey="label"
                          curveType="linear"
                          tooltipProps={{
                            content: ({ label, payload }: any) => <ChartTooltip label={label} payload={payload} />
                          }}
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
                          yAxisProps={{
                            allowDecimals: false
                          }}
                        >
                          <defs>
                            <pattern
                              id="stripes"
                              width="8"
                              height="8"
                              patternTransform="rotate(45)"
                              patternUnits="userSpaceOnUse"
                            >
                              <rect width="4" height="8" fill="var(--mantine-color-dimmed)" />
                            </pattern>
                          </defs>

                          {activeTab === 'daily' && dayjs().format('ddd') !== 'Sun' && (
                            <ReferenceArea
                              x1={dayjs().format('ddd, DD MMM')}
                              yAxisId="left"
                              fillOpacity={0.125}
                              fill="url(#stripes)"
                              label={{
                                angle: -90,
                                fill: 'var(--mantine-color-bright)',
                                value: 'Rest of this week',
                                fontSize: 14
                              }}
                            />
                          )}
                        </LineChart>
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
