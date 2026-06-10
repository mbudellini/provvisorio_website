import { Title, SimpleGrid, Paper, Text, Group, Anchor } from '@mantine/core'
import { IconFolders, IconShirt, IconCategory, IconCalendarEvent } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({ collections: 0, products: 0, categories: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/collections').then((r) => r.data),
      api.get('/products').then((r) => r.data),
      api.get('/categories').then((r) => r.data),
    ]).then(([collections, products, categories]) => {
      setStats({
        collections: Array.isArray(collections) ? collections.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        categories: Array.isArray(categories) ? categories.length : 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Categorie', count: stats.categories, icon: IconCategory, path: '/categories', color: 'violet' },
    { label: 'Collezioni', count: stats.collections, icon: IconFolders, path: '/collections', color: 'blue' },
    { label: 'Prodotti', count: stats.products, icon: IconShirt, path: '/products', color: 'teal' },
  ]

  return (
    <>
      <Title order={2} mb="lg">
        Dashboard
      </Title>
      <SimpleGrid cols={3}>
        {cards.map((card) => (
          <Paper
            key={card.path}
            shadow="xs"
            p="md"
            radius="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(card.path)}
          >
            <Group>
              <card.icon size={32} color={`var(--mantine-color-${card.color}-6)`} />
              <div>
                <Text size="sm" c="dimmed">
                  {card.label}
                </Text>
                <Title order={3}>{card.count}</Title>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper shadow="xs" p="xl" radius="md" withBorder mt="lg">
        <Title order={4} mb="sm">Benvenuto nella dashboard admin</Title>
        <Text c="dimmed" size="sm">
          Da qui puoi gestire il catalogo del negozio. Utilizza il menu lateralmente per navigare:
        </Text>
        <Group mt="md" gap="lg">
          <Anchor onClick={() => navigate('/categories')} fw={500}>
            📂 Gestisci Categorie
          </Anchor>
          <Anchor onClick={() => navigate('/collections')} fw={500}>
            📁 Gestisci Collezioni
          </Anchor>
          <Anchor onClick={() => navigate('/products')} fw={500}>
            👕 Gestisci Prodotti
          </Anchor>
          <Anchor onClick={() => navigate('/appointments')} fw={500}>
            📅 Gestisci Appuntamenti
          </Anchor>
        </Group>
      </Paper>
    </>
  )
}