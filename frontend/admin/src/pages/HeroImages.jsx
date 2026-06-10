import {
  Title,
  Button,
  Group,
  SimpleGrid,
  Image,
  Text,
  Paper,
  ActionIcon,
  Stack,
  Loader,
  Center,
} from '@mantine/core'
import { IconPlus, IconTrash, IconPhoto } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import api from '../api'
import { notifications } from '@mantine/notifications'

export default function HeroImages() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchImages = () => {
    api
      .get('/hero-images')
      .then((res) => setImages(res.data))
      .catch(() => notifications.show({ title: 'Errore', message: 'Impossibile caricare le immagini', color: 'red' }))
      .finally(() => setLoading(false))
  }

  useEffect(fetchImages, [])

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let successCount = 0

    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        await api.post('/hero-images', formData)
        successCount++
      } catch (err) {
        notifications.show({
          title: 'Errore upload',
          message: `Impossibile caricare "${file.name}"`,
          color: 'red',
        })
      }
    }

    if (successCount > 0) {
      notifications.show({
        title: 'Immagini caricate',
        message: `${successCount} immagine/i caricate con successo`,
        color: 'green',
      })
      fetchImages()
    }
    setUploading(false)
    // Reset input
    e.target.value = ''
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa immagine?')) return
    try {
      await api.delete(`/hero-images/${id}`)
      notifications.show({ title: 'Eliminata', message: 'Immagine eliminata', color: 'green' })
      fetchImages()
    } catch (err) {
      notifications.show({ title: 'Errore', message: 'Errore durante eliminazione', color: 'red' })
    }
  }

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    )
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Immagini Hero</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Gestisci le immagini di sfondo visibili nella homepage del negozio. Se aggiungi più immagini, verranno
            mostrate come carosello.
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          loading={uploading}
          component="label"
        >
          Aggiungi immagini
          <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
        </Button>
      </Group>

      {images.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconPhoto size={48} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">Nessuna immagine hero caricata</Text>
            <Text size="sm" c="dimmed">
              Clicca su "Aggiungi immagini" per caricare le foto di sfondo della homepage
            </Text>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {images.map((img) => (
            <Paper key={img._id} radius="md" withBorder overflow="hidden">
              <Image src={img.url} h={220} fit="cover" />
              <Group justify="flex-end" p="xs">
                <Text size="xs" c="dimmed" flex={1}>
                  {new Date(img.createdAt).toLocaleDateString('it-IT')}
                </Text>
                <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(img._id)}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </>
  )
}