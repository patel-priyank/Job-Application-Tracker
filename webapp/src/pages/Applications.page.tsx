import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ActionIcon,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Indicator,
  Input,
  Pagination,
  Skeleton,
  Stack,
  Text,
  TextInput
} from '@mantine/core';

import { useDisclosure, useDebouncedCallback } from '@mantine/hooks';

import { IconArrowsDownUp, IconFile, IconFilter, IconSearch } from '@tabler/icons-react';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import Application from '../components/Application.component';
import CreateApplication from '../components/CreateApplication.component';
import FilterModal from '../components/FilterModal.component';
import FloatingActionButton from '../components/FloatingActionButton.component';
import SortModal from '../components/SortModal.component';

import { APPLICATION_STATUS } from '../utils/constants';
import { fetchApplications } from '../utils/functions';

import authenticationImage from '../assets/authentication.png';
import createApplicationImage from '../assets/create-application.png';

const Applications = () => {
  const {
    applications,
    emailUsedFilter,
    order,
    page,
    pageSize,
    searchQuery,
    sort,
    statusFilter,
    totalPages,
    dispatch: applicationDispatch
  } = useApplicationContext();
  const { user } = useAuthContext();

  const [filterOpened, { open: openFilter, close: closeFilter }] = useDisclosure(false);
  const [sortOpened, { open: openSort, close: closeSort }] = useDisclosure(false);

  const [loading, setLoading] = useState(false);
  const [createApplicationOpened, { open: openCreateApplication, close: closeCreateApplication }] =
    useDisclosure(false);

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

    await fetchApplications(
      user.token,
      applicationDispatch,
      statusFilter,
      emailUsedFilter,
      sort,
      order,
      pageSize,
      1,
      query
    );

    applicationDispatch({
      type: 'SET_PAGE',
      payload: 1
    });

    setLoading(false);
  }, 500);

  return (
    <>
      <CreateApplication opened={createApplicationOpened} onClose={closeCreateApplication} />

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
                <Button onClick={openCreateApplication}>Create application</Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && user.applicationsCount > 0 && (
        <>
          <FilterModal
            opened={filterOpened}
            onClose={closeFilter}
            onSave={async (newEmailUsedFilter: string[], newStatusFilter: string[]) => {
              closeFilter();

              setLoading(true);

              await fetchApplications(
                user.token,
                applicationDispatch,
                newStatusFilter,
                newEmailUsedFilter,
                sort,
                order,
                pageSize,
                1,
                searchQuery
              );

              setLoading(false);
            }}
          />

          <SortModal
            opened={sortOpened}
            onClose={closeSort}
            onSave={async (newSort: string, newOrder: string, newPageSize: number) => {
              closeSort();

              setLoading(true);

              await fetchApplications(
                user.token,
                applicationDispatch,
                statusFilter,
                emailUsedFilter,
                newSort,
                newOrder,
                newPageSize,
                1,
                searchQuery
              );

              setLoading(false);
            }}
          />

          <Group gap="sm" mb="lg">
            <TextInput
              flex={1}
              placeholder="Company name or job title"
              leftSection={<IconSearch size={16} stroke={1.5} />}
              rightSection={searchQuery !== '' ? <Input.ClearButton onClick={() => handleSearch('')} /> : undefined}
              rightSectionPointerEvents="auto"
              value={searchQuery}
              onChange={e => handleSearch(e.currentTarget.value)}
            />

            <Group gap="sm" hiddenFrom="sm">
              <Indicator
                color="yellow"
                size={14}
                withBorder
                disabled={
                  statusFilter.length === Object.values(APPLICATION_STATUS).length &&
                  emailUsedFilter.length === user.suggestedEmails.length
                }
              >
                <ActionIcon size="input-sm" onClick={openFilter}>
                  <IconFilter size={16} stroke={1.5} />
                </ActionIcon>
              </Indicator>

              <ActionIcon size="input-sm" onClick={openSort}>
                <IconArrowsDownUp size={16} stroke={1.5} />
              </ActionIcon>
            </Group>

            <Group gap="sm" visibleFrom="sm">
              <Indicator
                color="yellow"
                size={14}
                withBorder
                disabled={
                  statusFilter.length === Object.values(APPLICATION_STATUS).length &&
                  emailUsedFilter.length === user.suggestedEmails.length
                }
              >
                <Button leftSection={<IconFilter size={16} stroke={1.5} />} onClick={openFilter}>
                  Filter
                </Button>
              </Indicator>

              <Button leftSection={<IconArrowsDownUp size={16} stroke={1.5} />} onClick={openSort}>
                Sort
              </Button>
            </Group>
          </Group>

          <Group justify="center">
            <Pagination
              mb="lg"
              gap={4}
              radius="md"
              total={totalPages}
              value={page}
              siblings={0}
              hideWithOnePage
              onChange={async pageVal => {
                applicationDispatch({
                  type: 'SET_PAGE',
                  payload: pageVal
                });

                setLoading(true);
                await fetchApplications(
                  user.token,
                  applicationDispatch,
                  statusFilter,
                  emailUsedFilter,
                  sort,
                  order,
                  pageSize,
                  pageVal,
                  searchQuery
                );
                setLoading(false);
              }}
              style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}
            />
          </Group>

          {loading && (
            <Grid>
              {Array.from({ length: pageSize }).map((_, index) => (
                <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }} key={index}>
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
                <Text c="dimmed" ta="center">
                  No applications match your search
                </Text>
              ) : (
                <Grid>
                  {applications.map(application => (
                    <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }} key={application._id}>
                      <Application application={application} highlight={searchQuery} />
                    </Grid.Col>
                  ))}
                </Grid>
              )}

              <FloatingActionButton icon={IconFile} label="Create application" onClick={openCreateApplication} />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Applications;
