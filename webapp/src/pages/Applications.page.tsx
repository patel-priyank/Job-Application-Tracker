import { useState } from 'react';

import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Group,
  Image,
  Indicator,
  Input,
  Pagination,
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
import FilterApplications from '../components/FilterApplications.component';
import FloatingActionButton from '../components/FloatingActionButton.component';
import PageCenter from '../components/PageCenter.component';
import SortApplications from '../components/SortApplications.component';

import { APPLICATION_STATUS } from '../utils/constants';
import { fetchApplications } from '../utils/functions';

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

  const search = async (query: string) => {
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
  };

  const debouncedSearch = useDebouncedCallback(search, 500);

  const handleSearch = (query: string, immediate = false) => {
    applicationDispatch({
      type: 'SET_SEARCH_QUERY',
      payload: query
    });

    if (immediate) {
      debouncedSearch.cancel();
      search(query.trim());
    } else {
      debouncedSearch(query.trim());
    }
  };

  const PaginationControls = ({ isEndOfList }: { isEndOfList: boolean }) => {
    if (!user) {
      return null;
    }

    return (
      <Group justify="center">
        <Pagination
          mt={isEndOfList ? 'md' : undefined}
          mb={isEndOfList ? undefined : 'md'}
          gap={4}
          radius="md"
          total={totalPages}
          value={page}
          siblings={0}
          className="monospace"
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
        />
      </Group>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <CreateApplication opened={createApplicationOpened} onClose={closeCreateApplication} />

      {user.applicationsCount === 0 && (
        <PageCenter>
          <Stack align="center" gap="xl">
            <Image
              src="./create-application.png"
              alt=""
              h={{ base: 240, md: 360 }}
              w={{ base: 240, md: 360 }}
              fit="contain"
            />

            <Text ta="center" style={{ textWrap: 'balance' }}>
              No applications yet? Let's kick things off by adding your first job application to start tracking your
              progress.
            </Text>

            <Button size="md" onClick={openCreateApplication}>
              Create application
            </Button>
          </Stack>
        </PageCenter>
      )}

      {user.applicationsCount > 0 && (
        <>
          <FilterApplications
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

          <SortApplications
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

          <Group gap="sm" mb="md">
            <TextInput
              flex={1}
              placeholder="Company name or job title"
              leftSection={<IconSearch size={16} stroke={1.5} />}
              rightSection={
                searchQuery !== '' ? <Input.ClearButton onClick={() => handleSearch('', true)} /> : undefined
              }
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
                zIndex={85}
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
                zIndex={85}
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

          <PaginationControls isEndOfList={false} />

          {loading && (
            <Grid>
              {Array.from({ length: pageSize }).map((_, index) => (
                <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }} key={index}>
                  <Application
                    application={{
                      _id: `dummy-${index}`,
                      companyName: 'Company name',
                      jobTitle: 'Job title',
                      emailUsed: 'Email used',
                      trackingLink: 'Tracking link',
                      status: 'Status',
                      date: new Date().toISOString(),
                      history: [{ _id: `dummy-history-${index}`, status: 'Status', date: new Date().toISOString() }]
                    }}
                    highlight=""
                    loading
                  />
                </Grid.Col>
              ))}
            </Grid>
          )}

          {!loading && (
            <>
              {applications.length === 0 ? (
                <Text c="dimmed" ta="center">
                  No applications found matching your filters or search
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

              <Box hiddenFrom="sm">
                <PaginationControls isEndOfList={true} />
              </Box>

              <FloatingActionButton icon={IconFile} label="Create application" onClick={openCreateApplication} />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Applications;
