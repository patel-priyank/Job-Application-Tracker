import { Link } from 'react-router-dom';

import { Button, Card, Divider, Grid, Group, Image, Stack, Text } from '@mantine/core';
import { DonutChart } from '@mantine/charts';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS } from '../utils/constants';

import createStatisticsImage from '../assets/create-statistics.png';
import statisticsImage from '../assets/statistics.png';

const Statistics = () => {
  const { applications } = useApplicationContext();
  const { user } = useAuthContext();

  const appStatusData = Array.from(new Set(applications.map(application => application.status))).map(status => ({
    name: status,
    value: applications.filter(application => application.status === status).length,
    color: Object.values(APPLICATION_STATUS).find(applicationStatus => applicationStatus.label === status)?.color || ''
  }));

  return (
    <>
      <Group>
        <Text component="h2" size="lg" fw="500">
          Statistics
        </Text>
      </Group>

      <Divider my="md" />

      {!user && (
        <Grid>
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
        <Grid>
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

      {user && user.applicationsCount > 0 && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Stack gap="md">
                <Text>Application Status</Text>

                <DonutChart
                  w="100%"
                  data={appStatusData}
                  size={240}
                  thickness={48}
                  withLabels
                  strokeWidth={0}
                  paddingAngle={2.8125}
                  tooltipDataSource="segment"
                />

                <Group justify="space-between">
                  <Text>Total</Text>
                  <Text>{user.applicationsCount}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </>
  );
};

export default Statistics;
