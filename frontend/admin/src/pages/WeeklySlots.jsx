import { useState, useEffect } from 'react'
import {
  Title,
  Paper,
  Group,
  Text,
  TextInput,
  Button,
  Switch,
  Stack,
  ActionIcon,
  Tabs,
  Table,
  Badge,
  Loader,
  Center,
} from '@mantine/core'
import { IconPlus, IconTrash, IconRefresh, IconCalendar, IconClock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import api from '../api'

const DAY_NAMES = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
]

export default function WeeklySlots() {
  const [weeklySlots, setWeeklySlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('slots')

  useEffect(() => {
    fetchWeeklySlots()
  }, [])

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments()
    }
  }, [activeTab])

  const fetchWeeklySlots = async () => {
    setLoading(true)
    try {
      const res = await api.get('/weekly-slots')
      // Ensure all days exist (0-6)
      const slotsMap = {}
      res.data.forEach((d) => {
        slotsMap[d.dayOfWeek] = d
      })
      const allDays = DAY_NAMES.map((name, idx) => {
        if (slotsMap[idx]) {
          return {
            ...slotsMap[idx],
            dayName: name,
            enabled: slotsMap[idx].slots.length > 0,
          }
        }
        return {
          dayOfWeek: idx,
          dayName: name,
          slots: [],
          enabled: false,
        }
      })
      setWeeklySlots(allDays)
    } catch (err) {
      notifications.show({
        title: 'Errore',
        message: 'Impossibile caricare gli slot settimanali',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    setAppointmentsLoading(true)
    try {
      const res = await api.get('/appointments')
      setAppointments(res.data)
    } catch (err) {
      notifications.show({
        title: 'Errore',
        message: 'Impossibile caricare le prenotazioni',
        color: 'red',
      })
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const addSlot = (dayIndex) => {
    setWeeklySlots((prev) => {
      const updated = [...prev]
      const day = { ...updated[dayIndex] }
      day.slots = [...day.slots, { startTime: '09:00', endTime: '10:00', isActive: true }]
      day.enabled = true
      updated[dayIndex] = day
      return updated
    })
  }

  const removeSlot = (dayIndex, slotIndex) => {
    setWeeklySlots((prev) => {
      const updated = [...prev]
      const day = { ...updated[dayIndex] }
      day.slots = day.slots.filter((_, i) => i !== slotIndex)
      day.enabled = day.slots.length > 0
      updated[dayIndex] = day
      return updated
    })
  }

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    setWeeklySlots((prev) => {
      const updated = [...prev]
      const day = { ...updated[dayIndex] }
      day.slots = day.slots.map((slot, i) =>
        i === slotIndex ? { ...slot, [field]: value } : slot
      )
      updated[dayIndex] = day
      return updated
    })
  }

  const toggleDay = (dayIndex, enabled) => {
    setWeeklySlots((prev) => {
      const updated = [...prev]
      const day = { ...updated[dayIndex] }
      day.enabled = enabled
      if (enabled && day.slots.length === 0) {
        day.slots = [{ startTime: '09:00', endTime: '10:00', isActive: true }]
      }
      if (!enabled) {
        day.slots = []
      }
      updated[dayIndex] = day
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const weeklySlotsData = weeklySlots
        .filter((d) => d.enabled && d.slots.length > 0)
        .map((d) => ({
          dayOfWeek: d.dayOfWeek,
          slots: d.slots.filter((s) => s.isActive).map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            isActive: true,
          })),
        }))

      await api.put('/weekly-slots', { weeklySlots: weeklySlotsData })
      notifications.show({
        title: 'Salvato',
        message: 'Slot settimanali aggiornati con successo',
        color: 'green',
      })
      fetchWeeklySlots()
    } catch (err) {
      notifications.show({
        title: 'Errore',
        message: 'Impossibile salvare gli slot',
        color: 'red',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateAppointmentStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status })
      notifications.show({
        title: 'Aggiornato',
        message: 'Stato prenotazione aggiornato',
        color: 'green',
      })
      fetchAppointments()
    } catch (err) {
      notifications.show({
        title: 'Errore',
        message: 'Impossibile aggiornare la prenotazione',
        color: 'red',
      })
    }
  }

  const deleteAppointment = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione?')) return
    try {
      await api.delete(`/appointments/${id}`)
      notifications.show({
        title: 'Eliminata',
        message: 'Prenotazione eliminata',
        color: 'green',
      })
      fetchAppointments()
    } catch (err) {
      notifications.show({
        title: 'Errore',
        message: 'Impossibile eliminare la prenotazione',
        color: 'red',
      })
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green'
      case 'pending': return 'yellow'
      case 'cancelled': return 'red'
      default: return 'gray'
    }
  }

  const statusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confermato'
      case 'pending': return 'In attesa'
      case 'cancelled': return 'Cancellato'
      default: return status
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <>
      <Title order={2} mb="lg">
        Gestione Appuntamenti
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="slots" leftSection={<IconClock size={16} />}>
            Configurazione Slot
          </Tabs.Tab>
          <Tabs.Tab value="appointments" leftSection={<IconCalendar size={16} />}>
            Prenotazioni
          </Tabs.Tab>
        </Tabs.List>

        {/* Slots Configuration Tab */}
        <Tabs.Panel value="slots">
          <Paper p="md" withBorder mb="md">
            <Text size="sm" c="dimmed" mb="md">
              Configura gli orari di disponibilità per ogni giorno della settimana.
              Questi slot si ripeteranno automaticamente ogni settimana.
            </Text>

            <Stack gap="md">
              {weeklySlots.map((day, dayIndex) => (
                <Paper key={day.dayOfWeek} p="md" withBorder>
                  <Group justify="space-between" mb={day.enabled ? 'md' : 0}>
                    <Title order={4}>{day.dayName}</Title>
                    <Switch
                      checked={day.enabled}
                      onChange={(e) => toggleDay(dayIndex, e.currentTarget.checked)}
                      label={day.enabled ? 'Attivo' : 'Disattivato'}
                      labelPosition="left"
                    />
                  </Group>

                  {day.enabled && (
                    <Stack gap="xs">
                      {day.slots.map((slot, slotIndex) => (
                        <Group key={slotIndex} wrap="nowrap">
                          <TextInput
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(dayIndex, slotIndex, 'startTime', e.currentTarget.value)
                            }
                            w={120}
                          />
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                          <TextInput
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlot(dayIndex, slotIndex, 'endTime', e.currentTarget.value)
                            }
                            w={120}
                          />
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeSlot(dayIndex, slotIndex)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      ))}
                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => addSlot(dayIndex)}
                        mt="xs"
                      >
                        Aggiungi orario
                      </Button>
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button onClick={handleSave} loading={saving}>
              Salva Configurazione
            </Button>
          </Group>
        </Tabs.Panel>

        {/* Appointments Tab */}
        <Tabs.Panel value="appointments">
          <Group justify="flex-end" mb="md">
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchAppointments}
              loading={appointmentsLoading}
            >
              Aggiorna
            </Button>
          </Group>

          {appointmentsLoading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : appointments.length === 0 ? (
            <Paper p="xl" withBorder>
              <Text c="dimmed" ta="center">
                Nessuna prenotazione trovata
              </Text>
            </Paper>
          ) : (
            <Paper withBorder>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Data</Table.Th>
                    <Table.Th>Orario</Table.Th>
                    <Table.Th>Nome</Table.Th>
                    <Table.Th>Cognome</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Stato</Table.Th>
                    <Table.Th>Azioni</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {appointments.map((apt) => (
                    <Table.Tr key={apt._id}>
                      <Table.Td>{formatDate(apt.appointmentDate)}</Table.Td>
                      <Table.Td>
                        {apt.slotStartTime} - {apt.slotEndTime}
                      </Table.Td>
                      <Table.Td>{apt.firstName}</Table.Td>
                      <Table.Td>{apt.lastName}</Table.Td>
                      <Table.Td>{apt.email}</Table.Td>
                      <Table.Td>
                        <Badge color={statusColor(apt.status)} variant="light">
                          {statusLabel(apt.status)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          {apt.status !== 'cancelled' && (
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                            >
                              Cancella
                            </Button>
                          )}
                          {apt.status === 'cancelled' && (
                            <Button
                              size="xs"
                              variant="light"
                              color="green"
                              onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                            >
                              Ripristina
                            </Button>
                          )}
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => deleteAppointment(apt._id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Tabs.Panel>
      </Tabs>
    </>
  )
}