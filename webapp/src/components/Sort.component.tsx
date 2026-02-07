import { useEffect, useState } from 'react';

import { Button, Grid, Group, Modal, Paper, Radio, Stack, Text } from '@mantine/core';

import { useApplicationContext } from '../hooks/useApplicationContext';

const SORT_BY_OPTIONS = [
  { label: 'Date added', value: 'added' },
  { label: 'Last updated', value: 'updated' },
  { label: 'Company name', value: 'company' },
  { label: 'Application status', value: 'status' }
];

const SORT_ORDER_OPTIONS = [
  { label: 'Oldest first / A-Z', value: 'asc' },
  { label: 'Newest first / Z-A', value: 'desc' }
];

const ITEMS_PER_PAGE = [
  { label: '12', value: '12' },
  { label: '24', value: '24' },
  { label: '48', value: '48' },
  { label: '96', value: '96' }
];

const Sort = ({
  opened,
  onClose,
  onSave
}: {
  opened: boolean;
  onClose: () => void;
  onSave: (newSort: string, newOrder: string, newPageSize: number) => void;
}) => {
  const { order, pageSize, sort, dispatch: applicationDispatch } = useApplicationContext();

  const [newOrder, setNewOrder] = useState(order);
  const [newSort, setNewSort] = useState(sort);
  const [newPageSize, setNewPageSize] = useState(pageSize);

  useEffect(() => {
    if (opened) {
      setNewOrder(order);
      setNewSort(sort);
      setNewPageSize(pageSize);
    }
  }, [opened]);

  const handleSave = () => {
    applicationDispatch({
      type: 'SET_SORT',
      payload: {
        sort: newSort,
        order: newOrder,
        pageSize: newPageSize
      }
    });

    onSave(newSort, newOrder, newPageSize);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Sort" overlayProps={{ blur: 2 }} centered>
      <Stack gap="sm">
        <Paper withBorder p="md">
          <Stack>
            <Text>Sort by</Text>

            <Radio.Group name="sortBy" value={newSort} onChange={val => setNewSort(val)}>
              <Grid>
                {SORT_BY_OPTIONS.map((option, index) => (
                  <Grid.Col span={{ base: 12, xs: 6 }} key={index}>
                    <Radio value={option.value} label={option.label} />
                  </Grid.Col>
                ))}
              </Grid>
            </Radio.Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Stack>
            <Text>Sort order</Text>

            <Radio.Group name="sortOrder" value={newOrder} onChange={val => setNewOrder(val)}>
              <Grid>
                {SORT_ORDER_OPTIONS.map((option, index) => (
                  <Grid.Col span={{ base: 12, xs: 6 }} key={index}>
                    <Radio value={option.value} label={option.label} />
                  </Grid.Col>
                ))}
              </Grid>
            </Radio.Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Stack>
            <Text>Applications per page</Text>

            <Radio.Group
              name="applicationsPerPage"
              value={newPageSize.toString()}
              onChange={val => setNewPageSize(Number(val))}
            >
              <Grid>
                {ITEMS_PER_PAGE.map((option, index) => (
                  <Grid.Col span={6} key={index}>
                    <Radio value={option.value} label={option.label} />
                  </Grid.Col>
                ))}
              </Grid>
            </Radio.Group>
          </Stack>
        </Paper>

        <Group mt="sm">
          <Button data-autofocus onClick={handleSave}>
            Save
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default Sort;
