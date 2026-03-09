import { useEffect, useState } from 'react';

import { Accordion, Badge, Button, Checkbox, Grid, Group, Modal, Stack, Text, Transition } from '@mantine/core';

import { IconArrowBackUp, IconRestore } from '@tabler/icons-react';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS } from '../utils/constants';

const FilterApplications = ({
  opened,
  onClose,
  onSave
}: {
  opened: boolean;
  onClose: () => void;
  onSave: (newEmailUsedFilter: string[], newStatusFilter: string[]) => void;
}) => {
  const { emailUsedFilter, statusFilter, dispatch: applicationDispatch } = useApplicationContext();
  const { user } = useAuthContext();

  const [newEmailUsedFilter, setNewEmailUsedFilter] = useState(emailUsedFilter);
  const [newStatusFilter, setNewStatusFilter] = useState(statusFilter);

  useEffect(() => {
    if (opened) {
      setNewEmailUsedFilter(emailUsedFilter);
      setNewStatusFilter(statusFilter);
    }
  }, [opened]);

  const handleSave = () => {
    applicationDispatch({
      type: 'SET_FILTERS',
      payload: {
        emailUsedFilter: newEmailUsedFilter,
        statusFilter: newStatusFilter
      }
    });

    onSave(newEmailUsedFilter, newStatusFilter);
  };

  if (!user) {
    return null;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Filter Applications" overlayProps={{ blur: 2 }} centered>
      <Stack gap="sm">
        <Group gap="sm">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconRestore size={16} stroke={1.5} />}
            disabled={
              newStatusFilter.length === Object.values(APPLICATION_STATUS).length &&
              newEmailUsedFilter.length === user.suggestedEmails.length
            }
            onClick={() => {
              setNewStatusFilter(Object.values(APPLICATION_STATUS).map(status => status.label));
              setNewEmailUsedFilter(user.suggestedEmails);
            }}
          >
            Reset all filters
          </Button>
        </Group>

        <Accordion variant="separated" radius="sm" defaultValue="status">
          <Accordion.Item value="status">
            <Accordion.Control>
              <Group mr="md">
                <Text>Application status</Text>

                {statusFilter.length !== Object.values(APPLICATION_STATUS).length && (
                  <Badge variant="default" size="sm" ml="auto">
                    Applied
                  </Badge>
                )}
              </Group>
            </Accordion.Control>

            <Accordion.Panel>
              <Stack gap="lg">
                <Group gap="sm">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconRestore size={16} stroke={1.5} />}
                    disabled={newStatusFilter.length === Object.values(APPLICATION_STATUS).length}
                    onClick={() => setNewStatusFilter(Object.values(APPLICATION_STATUS).map(status => status.label))}
                  >
                    Reset
                  </Button>

                  <Transition
                    transition="fade-left"
                    mounted={
                      statusFilter.sort((a, b) => a.localeCompare(b)).toString() !==
                      newStatusFilter.sort((a, b) => a.localeCompare(b)).toString()
                    }
                  >
                    {transitionStyles => (
                      <Button
                        variant="light"
                        style={transitionStyles}
                        size="xs"
                        leftSection={<IconArrowBackUp size={16} stroke={1.5} />}
                        onClick={() => setNewStatusFilter(statusFilter)}
                      >
                        Undo
                      </Button>
                    )}
                  </Transition>
                </Group>

                <Grid>
                  {Object.values(APPLICATION_STATUS).map((status, index) => (
                    <Grid.Col span={{ base: 12, xs: 6 }} key={index}>
                      <Checkbox
                        color={status.color}
                        label={status.label}
                        checked={newStatusFilter.includes(status.label)}
                        disabled={newStatusFilter.length === 1 && newStatusFilter.includes(status.label)}
                        onChange={event => {
                          if (event.currentTarget.checked) {
                            setNewStatusFilter(prev => [...prev, status.label]);
                          } else {
                            setNewStatusFilter(prev => prev.filter(s => s !== status.label));
                          }
                        }}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="emailUsed">
            <Accordion.Control>
              <Group mr="md">
                <Text>Email used</Text>

                {emailUsedFilter.length !== user.suggestedEmails.length && (
                  <Badge variant="default" size="sm" ml="auto">
                    Applied
                  </Badge>
                )}
              </Group>
            </Accordion.Control>

            <Accordion.Panel>
              <Stack gap="lg">
                <Group gap="sm">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconRestore size={16} stroke={1.5} />}
                    disabled={newEmailUsedFilter.length === user.suggestedEmails.length}
                    onClick={() => {
                      setNewEmailUsedFilter(user.suggestedEmails);
                    }}
                  >
                    Reset
                  </Button>

                  <Transition
                    transition="fade-left"
                    mounted={
                      emailUsedFilter.sort((a, b) => a.localeCompare(b)).toString() !==
                      newEmailUsedFilter.sort((a, b) => a.localeCompare(b)).toString()
                    }
                  >
                    {transitionStyles => (
                      <Button
                        variant="light"
                        style={transitionStyles}
                        size="xs"
                        leftSection={<IconArrowBackUp size={16} stroke={1.5} />}
                        onClick={() => setNewEmailUsedFilter(emailUsedFilter)}
                      >
                        Undo
                      </Button>
                    )}
                  </Transition>
                </Group>

                <Grid>
                  {user.suggestedEmails.map((email, index) => {
                    const isLastSelected = newEmailUsedFilter.length === 1 && newEmailUsedFilter.includes(email);

                    return (
                      <Grid.Col span={12} key={index}>
                        <Group
                          component="label"
                          gap="var(--mantine-spacing-sm)"
                          style={{ cursor: isLastSelected ? 'not-allowed' : 'pointer' }}
                          className="max-content-width"
                        >
                          <Checkbox
                            checked={newEmailUsedFilter.includes(email)}
                            disabled={isLastSelected}
                            onChange={event => {
                              if (event.currentTarget.checked) {
                                setNewEmailUsedFilter(prev => [...prev, email]);
                              } else {
                                setNewEmailUsedFilter(prev => prev.filter(e => e !== email));
                              }
                            }}
                          />

                          <Text
                            size="sm"
                            truncate
                            flex={1}
                            c={isLastSelected ? 'var(--mantine-color-disabled-color)' : undefined}
                          >
                            {email}
                          </Text>
                        </Group>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

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

export default FilterApplications;
