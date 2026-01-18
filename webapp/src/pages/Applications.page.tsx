import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Input,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput
} from '@mantine/core';
import { useDisclosure, useDebouncedCallback } from '@mantine/hooks';

import { IconFile, IconSearch } from '@tabler/icons-react';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import Application from '../components/Application.component';
import CreateApplication from '../components/CreateApplication.component';
import FloatingActionButton from '../components/FloatingActionButton.component';

import { fetchApplications } from '../utils/functions';

import authenticationImage from '../assets/authentication.png';
import createApplicationImage from '../assets/create-application.png';

const SORT_OPTIONS = [
  { label: 'Date added (newest first)', sort: 'added', order: 'desc' },
  { label: 'Date added (oldest first)', sort: 'added', order: 'asc' },
  { label: 'Last updated (newest first)', sort: 'updated', order: 'desc' },
  { label: 'Last updated (oldest first)', sort: 'updated', order: 'asc' },
  { label: 'Company name (A-Z)', sort: 'company', order: 'asc' },
  { label: 'Company name (Z-A)', sort: 'company', order: 'desc' },
  { label: 'Application status (A-Z)', sort: 'status', order: 'asc' },
  { label: 'Application status (Z-A)', sort: 'status', order: 'desc' }
];

const Applications = () => {
  const { applications, order, page, searchQuery, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [searchResultsCount, setSearchResultsCount] = useState(0);
  const [createAppOpened, { open: openCreateApp, close: closeCreateApp }] = useDisclosure(false);

  const paramsRef = useRef({ order, sort });

  useEffect(() => {
    paramsRef.current = { order, sort };
  }, [order, sort]);

  useEffect(() => {
    return () => {
      if (!user) {
        return;
      }

      applicationDispatch({
        type: 'SET_PAGE',
        payload: 1
      });

      applicationDispatch({
        type: 'SET_SEARCH_QUERY',
        payload: ''
      });

      fetchApplications(paramsRef.current.sort, paramsRef.current.order, 1, user.token, applicationDispatch);
    };
  }, []);

  const handleSearch = (query: string) => {
    applicationDispatch({
      type: 'SET_SEARCH_QUERY',
      payload: query
    });

    search(query.trim());
  };

  const search = useDebouncedCallback(async (query: string) => {
    if (!user) {
      return;
    }

    setLoading(true);
    const count = await fetchApplications(sort, order, 1, user.token, applicationDispatch, query);
    setLoading(false);

    applicationDispatch({
      type: 'SET_PAGE',
      payload: 1
    });

    setSearchResultsCount(query ? count : 0);
  }, 500);

  const handleSort = async (sort: string, order: string) => {
    if (!user) {
      return;
    }

    applicationDispatch({
      type: 'SET_SORT',
      payload: { sort, order }
    });

    setLoading(true);
    await fetchApplications(sort, order, page, user.token, applicationDispatch, searchQuery);
    setLoading(false);
  };

  return (
    <>
      <CreateApplication opened={createAppOpened} onClose={closeCreateApp} />

      <Group justify="space-between">
        <Text component="h2" size="lg" fw="500">
          Applications
        </Text>
      </Group>

      <Divider my="md" />

      {!user && (
        <Grid justify="center">
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image
                src={authenticationImage}
                alt=""
                h={{ base: 240, md: 360 }}
                p="md"
                style={{ objectFit: 'contain' }}
              />

              <Text my="md" c="dimmed" flex={1}>
                Get started tracking your job applications by creating an account or signing in. It only takes a minute!
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
                src={createApplicationImage}
                alt=""
                h={{ base: 240, md: 360 }}
                p="md"
                style={{ objectFit: 'contain' }}
              />

              <Text my="md" c="dimmed" flex={1}>
                No applications yet? Let's kick things off by adding your first job application to start tracking your
                progress.
              </Text>

              <Group>
                <Button onClick={openCreateApp}>Create application</Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && user.applicationsCount > 0 && (
        <>
          <Flex direction={{ base: 'column', md: 'row' }} gap="xs" mb="lg">
            <TextInput
              flex={1}
              label="Search"
              placeholder="Company name, job title, or email used"
              leftSection={<IconSearch size={16} stroke={1.5} />}
              rightSection={searchQuery !== '' ? <Input.ClearButton onClick={() => handleSearch('')} /> : undefined}
              rightSectionPointerEvents="auto"
              value={searchQuery}
              onChange={e => handleSearch(e.currentTarget.value)}
            />

            <Select
              w={{ base: '100%', md: '15rem' }}
              label="Sort by"
              withAlignedLabels
              allowDeselect={false}
              maxDropdownHeight={320}
              comboboxProps={{ shadow: 'xl' }}
              data={SORT_OPTIONS.map(option => ({
                value: `${option.sort}-${option.order}`,
                label: option.label
              }))}
              value={`${sort}-${order}`}
              onChange={value => {
                if (value) {
                  const [newSort, newOrder] = value.split('-');
                  handleSort(newSort, newOrder);
                }
              }}
            />
          </Flex>

          <Center>
            <Pagination
              mb="lg"
              radius="md"
              total={(() => {
                const totalApplications = searchQuery ? searchResultsCount : user.applicationsCount;
                return Math.ceil(totalApplications / Number(import.meta.env.VITE_PAGE_SIZE));
              })()}
              value={page}
              siblings={0}
              onChange={async pageVal => {
                applicationDispatch({
                  type: 'SET_PAGE',
                  payload: pageVal
                });

                setLoading(true);
                await fetchApplications(sort, order, pageVal, user.token, applicationDispatch, searchQuery);
                setLoading(false);
              }}
            />
          </Center>

          {loading && (
            <Grid>
              {Array.from({ length: Number(import.meta.env.VITE_PAGE_SIZE) }).map((_, index) => (
                <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={index}>
                  <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                    <Card.Section h={140}>
                      <Skeleton height={140} radius={0} animate={false} />
                    </Card.Section>

                    <Stack gap="xs" mt="md">
                      <Skeleton animate={false}>
                        <Text>Company name</Text>
                      </Skeleton>

                      <Skeleton animate={false}>
                        <Text>Job title</Text>
                      </Skeleton>

                      <Stack gap="xs">
                        <Skeleton w="75%" animate={false}>
                          <Text size="xs">Status</Text>
                        </Skeleton>

                        <Skeleton w="50%" animate={false}>
                          <Text size="xs">Date</Text>
                        </Skeleton>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}

          {!loading && (
            <>
              {applications.length === 0 ? (
                <Center>
                  <Text c="dimmed">No applications match your search</Text>
                </Center>
              ) : (
                <Grid>
                  {applications.map(application => (
                    <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={application._id}>
                      <Application application={application} />
                    </Grid.Col>
                  ))}
                </Grid>
              )}

              <FloatingActionButton icon={IconFile} label="Create application" onClick={openCreateApp} />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Applications;
