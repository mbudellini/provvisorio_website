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
  Select,
  MultiSelect,
  Switch,
  SimpleGrid,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import api from '../api'
import { notifications } from '@mantine/notifications'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ value: s, label: s }))

export default function Products() {
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [opened, { open, close }] = useDisclosure(false)
  const [catModalOpened, { open: openCatModal, close: closeCatModal }] = useDisclosure(false)
  const [editingId, setEditingId] = useState(null)
  const [imagePreviews, setImagePreviews] = useState([])

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      images: [],
      collezione: '',
      category: '',
      sizes: [],
      colors: [],
      gender: 'uomo',
      featured: false,
      order: 0,
    },
  })

  const catForm = useForm({
    initialValues: {
      name: '',
      slug: '',
    },
  })

  const fetchData = () => {
    api.get('/products').then((res) => setProducts(res.data))
    api.get('/collections').then((res) => setCollections(res.data))
    api.get('/categories').then((res) => setCategories(res.data))
  }

  useEffect(fetchData, [])

  const collectionOptions = collections.map((c) => ({ value: c._id, label: c.name }))

  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }))

  const openCreate = () => {
    setEditingId(null)
    setImagePreviews([])
    form.reset()
    open()
  }

  const openEdit = (product) => {
    setEditingId(product._id)
    setImagePreviews(product.images || [])
    form.setValues({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      collezione: product.collezione?._id || product.collezione || '',
      category: product.category?._id || product.category || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      gender: product.gender || 'uomo',
      featured: product.featured || false,
      order: product.order || 0,
    })
    open()
  }

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, values)
        notifications.show({ title: 'Aggiornato', message: 'Prodotto aggiornato', color: 'green' })
      } else {
        await api.post('/products', values)
        notifications.show({ title: 'Creato', message: 'Prodotto creato', color: 'green' })
      }
      fetchData()
      close()
    } catch (err) {
      notifications.show({ title: 'Errore', message: err.response?.data?.message || 'Errore', color: 'red' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) return
    try {
      await api.delete(`/products/${id}`)
      notifications.show({ title: 'Eliminato', message: 'Prodotto eliminato', color: 'green' })
      fetchData()
    } catch (err) {
      notifications.show({ title: 'Errore', message: 'Errore durante eliminazione', color: 'red' })
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await api.post('/upload', formData)
        const url = res.data.url
        form.insertListItem('images', url)
        setImagePreviews((prev) => [...prev, url])
      } catch (err) {
        notifications.show({ title: 'Errore upload', message: `Errore con ${file.name}`, color: 'red' })
      }
    }
  }

  const removeImage = (index) => {
    form.removeListItem('images', index)
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const addColor = () => {
    const color = window.prompt('Inserisci un colore (es. Nero, Bianco):')
    if (color) form.insertListItem('colors', color)
  }

  const handleCreateCategory = async (values) => {
    try {
      const res = await api.post('/categories', values)
      notifications.show({ title: 'Categoria creata', message: `"${values.name}" aggiunta`, color: 'green' })
      await api.get('/categories').then((r) => setCategories(r.data))
      // Auto-select the newly created category in the product form
      form.setFieldValue('category', res.data._id)
      catForm.reset()
      closeCatModal()
    } catch (err) {
      notifications.show({ title: 'Errore', message: err.response?.data?.message || 'Errore', color: 'red' })
    }
  }

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name
    const found = categories.find((c) => c._id === (product.category?._id || product.category))
    return found ? found.name : '-'
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Prodotti</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
          Nuovo prodotto
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Immagine</Table.Th>
            <Table.Th>Nome</Table.Th>
            <Table.Th>Categoria</Table.Th>
            <Table.Th>Collezione</Table.Th>
            <Table.Th>Prezzo</Table.Th>
            <Table.Th>Genere</Table.Th>
            <Table.Th>In evidenza</Table.Th>
            <Table.Th>Azioni</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {products.map((p) => (
            <Table.Tr key={p._id}>
              <Table.Td>
                {p.images?.[0] && <Image src={p.images[0]} h={40} w={40} radius="sm" fit="cover" />}
              </Table.Td>
              <Table.Td>{p.name}</Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {getCategoryName(p)}
                </Text>
              </Table.Td>
              <Table.Td>{p.collezione?.name || '-'}</Table.Td>
              <Table.Td>{p.price ? `€${p.price}` : '-'}</Table.Td>
              <Table.Td>{p.gender === 'donna' ? 'Donna' : 'Uomo'}</Table.Td>
              <Table.Td>{p.featured ? 'Sì' : 'No'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(p)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(p._id)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          {products.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={8} ta="center" c="dimmed">
                Nessun prodotto
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      {/* Product Create/Edit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingId ? 'Modifica prodotto' : 'Nuovo prodotto'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <SimpleGrid cols={2}>
              <TextInput label="Nome" required placeholder="Nome del capo" {...form.getInputProps('name')} />
              <TextInput label="Slug" required placeholder="slug-del-prodotto" {...form.getInputProps('slug')} />
            </SimpleGrid>
            <Textarea
              label="Descrizione (facoltativa)"
              minRows={3}
              placeholder="Descrizione del capo di vestiario..."
              {...form.getInputProps('description')}
            />
            <SimpleGrid cols={3}>
              <NumberInput label="Prezzo (€)" decimalScale={2} {...form.getInputProps('price')} />
              <Select
                label="Collezione"
                data={collectionOptions}
                clearable
                {...form.getInputProps('collezione')}
              />
              <NumberInput label="Ordine" {...form.getInputProps('order')} />
            </SimpleGrid>

            {/* Category selector with inline "add new" button */}
            <Group align="flex-end" gap="xs">
              <Select
                label="Categoria"
                data={categoryOptions}
                clearable
                searchable
                placeholder="Seleziona categoria..."
                style={{ flex: 1 }}
                {...form.getInputProps('category')}
              />
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={openCatModal}
                style={{ marginBottom: 2 }}
              >
                Nuova
              </Button>
            </Group>

            <Select
              label="Genere"
              data={[
                { value: 'uomo', label: 'Uomo' },
                { value: 'donna', label: 'Donna' },
              ]}
              {...form.getInputProps('gender')}
            />
            <MultiSelect label="Taglie" data={SIZE_OPTIONS} {...form.getInputProps('sizes')} />
            <Group>
              <Button variant="light" size="xs" onClick={addColor}>
                Aggiungi colore
              </Button>
              {form.values.colors.map((color, i) => (
                <Group key={i} gap={4}>
                  <Text size="sm">{color}</Text>
                  <ActionIcon variant="subtle" color="red" size="xs" onClick={() => form.removeListItem('colors', i)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Group>
            <Switch label="In evidenza" {...form.getInputProps('featured', { type: 'checkbox' })} />
            <div>
              <Text size="sm" fw={500} mb={4}>
                Immagini
              </Text>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
              <SimpleGrid cols={4} mt="sm">
                {imagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <Image src={src} h={80} radius="sm" fit="cover" />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="xs"
                      style={{ position: 'absolute', top: 4, right: 4 }}
                      onClick={() => removeImage(i)}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </div>
                ))}
              </SimpleGrid>
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

      {/* Inline Category Creation Modal */}
      <Modal opened={catModalOpened} onClose={closeCatModal} title="Nuova categoria" size="sm">
        <form onSubmit={catForm.onSubmit(handleCreateCategory)}>
          <Stack>
            <TextInput
              label="Nome"
              required
              placeholder="es. Pantaloni, T-Shirt, Longsleeve"
              {...catForm.getInputProps('name')}
            />
            <TextInput
              label="Slug"
              required
              placeholder="es. pantaloni, t-shirt"
              {...catForm.getInputProps('slug')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeCatModal}>
                Annulla
              </Button>
              <Button type="submit">Crea e seleziona</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}