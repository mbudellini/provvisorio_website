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
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import api from '../api'
import { notifications } from '@mantine/notifications'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [opened, { open, close }] = useDisclosure(false)
  const [editingId, setEditingId] = useState(null)

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      order: 0,
    },
  })

  const fetchCategories = () => {
    api.get('/categories').then((res) => setCategories(res.data))
  }

  useEffect(fetchCategories, [])

  const openCreate = () => {
    setEditingId(null)
    form.reset()
    open()
  }

  const openEdit = (category) => {
    setEditingId(category._id)
    form.setValues({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order: category.order || 0,
    })
    open()
  }

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, values)
        notifications.show({ title: 'Aggiornata', message: 'Categoria aggiornata', color: 'green' })
      } else {
        await api.post('/categories', values)
        notifications.show({ title: 'Creata', message: 'Categoria creata', color: 'green' })
      }
      fetchCategories()
      close()
    } catch (err) {
      notifications.show({ title: 'Errore', message: err.response?.data?.message || 'Errore', color: 'red' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa categoria?')) return
    try {
      await api.delete(`/categories/${id}`)
      notifications.show({ title: 'Eliminata', message: 'Categoria eliminata', color: 'green' })
      fetchCategories()
    } catch (err) {
      notifications.show({ title: 'Errore', message: 'Errore durante eliminazione', color: 'red' })
    }
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Categorie</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
          Nuova categoria
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nome</Table.Th>
            <Table.Th>Slug</Table.Th>
            <Table.Th>Descrizione</Table.Th>
            <Table.Th>Ordine</Table.Th>
            <Table.Th>Azioni</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((c) => (
            <Table.Tr key={c._id}>
              <Table.Td>{c.name}</Table.Td>
              <Table.Td>{c.slug}</Table.Td>
              <Table.Td>
                <Text size="sm" lineClamp={1}>
                  {c.description || '-'}
                </Text>
              </Table.Td>
              <Table.Td>{c.order}</Table.Td>
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
          {categories.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5} ta="center" c="dimmed">
                Nessuna categoria. Crea la prima! (es. Pantaloni, T-Shirt, Longsleeve...)
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={close} title={editingId ? 'Modifica categoria' : 'Nuova categoria'} size="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Nome"
              required
              placeholder="es. Pantaloni, T-Shirt, Longsleeve"
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Slug"
              required
              placeholder="es. pantaloni, t-shirt, longsleeve"
              {...form.getInputProps('slug')}
            />
            <Textarea
              label="Descrizione"
              minRows={2}
              placeholder="Descrizione facoltativa della categoria"
              {...form.getInputProps('description')}
            />
            <NumberInput label="Ordine" {...form.getInputProps('order')} />
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