import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Card, Center, Divider, Grid, Group, Image, Loader, Stack, Text } from '@mantine/core';
import { BarChart, DonutChart } from '@mantine/charts';

import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS } from '../utils/constants';
import { showNotification } from '../utils/functions';

import createStatisticsImage from '../assets/create-statistics.png';
import statisticsErrorImage from '../assets/statistics-error.png';
import statisticsImage from '../assets/statistics.png';

const Statistics = () => {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    statusCounts: [],
    weeklyApplications: []
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

    setStatistics({
      statusCounts: data.statusCounts.map((status: { name: string; value: number }) => ({
        ...status,
        color: getStatusColor(status.name)
      })),
      weeklyApplications: data.weeklyApplications
    });

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    return Object.values(APPLICATION_STATUS).find(s => s.label === status)?.color ?? '';
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
        <Center pt="xl">
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
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Stack gap="md">
                <Text>Applications by Status</Text>

                <DonutChart
                  w="100%"
                  data={statistics.statusCounts}
                  size={240}
                  thickness={48}
                  withLabels
                  strokeWidth={0}
                  tooltipDataSource="segment"
                />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Stack gap="md">
                <Text>Weekly Applications</Text>

                <BarChart
                  h={300}
                  data={statistics.weeklyApplications}
                  dataKey="label"
                  type="stacked"
                  series={Object.values(APPLICATION_STATUS).map(status => ({
                    name: status.label,
                    color: status.color
                  }))}
                />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </>
  );
};

export default Statistics;
