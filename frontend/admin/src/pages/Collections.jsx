import {
  Title,
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Stack,
  ActionIcon,
  Image,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import api from '../api'
import { notifications } from '@mantine/notifications'

export default function Collections() {
  const [collections, setCollections] = useState([])
  const [opened, { open, close }] = useDisclosure(false)
  const [editingId, setEditingId] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      coverImage: '',
      season: '',
      order: 0,
    },
  })

  const fetchCollections = () => {
    api.get('/collections').then((res) => setCollections(res.data))
  }

  useEffect(fetchCollections, [])

  const openCreate = () => {
    setEditingId(null)
    setCoverPreview('')
    form.reset()
    open()
  }

  const openEdit = (collection) => {
    setEditingId(collection._id)
    setCoverPreview(collection.coverImage || '')
    form.setValues({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      coverImage: collection.coverImage || '',
      season: collection.season || '',
      order: collection.order || 0,
    })
    open()
  }

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/collections/${editingId}`, values)
        notifications.show({ title: 'Aggiornata', message: 'Collezione aggiornata', color: 'green' })
      } else {
        await api.post('/collections', values)
        notifications.show({ title: 'Creata', message: 'Collezione creata', color: 'green' })
      }
      fetchCollections()
      close()
    } catch (err) {
      notifications.show({ title: 'Errore', message: err.response?.data?.message || 'Errore', color: 'red' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa collezione?')) return
    try {
      await api.delete(`/collections/${id}`)
      notifications.show({ title: 'Eliminata', message: 'Collezione eliminata', color: 'green' })
      fetchCollections()
    } catch (err) {
      notifications.show({ title: 'Errore', message: 'Errore durante eliminazione', color: 'red' })
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await api.post('/upload', formData)
      form.setFieldValue('coverImage', res.data.url)
      setCoverPreview(res.data.url)
    } catch (err) {
      notifications.show({ title: 'Errore upload', message: 'Impossibile caricare immagine', color: 'red' })
    }
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Collezioni</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
          Nuova collezione
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Copertina</Table.Th>
            <Table.Th>Nome</Table.Th>
            <Table.Th>Slug</Table.Th>
            <Table.Th>Stagione</Table.Th>
            <Table.Th>Azioni</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {collections.map((c) => (
            <Table.Tr key={c._id}>
              <Table.Td>
                {c.coverImage && <Image src={c.coverImage} h={40} w={40} radius="sm" fit="cover" />}
              </Table.Td>
              <Table.Td>{c.name}</Table.Td>
              <Table.Td>{c.slug}</Table.Td>
              <Table.Td>{c.season}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(c)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(c._id)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {collections.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5} ta="center" c="dimmed">
                Nessuna collezione
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={close} title={editingId ? 'Modifica collezione' : 'Nuova collezione'} size="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Nome" required {...form.getInputProps('name')} />
            <TextInput label="Slug" required {...form.getInputProps('slug')} />
            <Textarea label="Descrizione" minRows={3} {...form.getInputProps('description')} />
            <TextInput label="Stagione" placeholder="es. PE/Estate 2026" {...form.getInputProps('season')} />
            <NumberInput label="Ordine" {...form.getInputProps('order')} />
            <div>
              <Text size="sm" fw={500} mb={4}>
                Copertina
              </Text>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {coverPreview && <Image src={coverPreview} h={100} mt="sm" radius="sm" />}
            </div>
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Annulla
              </Button>
              <Button type="submit">{editingId ? 'Salva' : 'Crea'}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}
