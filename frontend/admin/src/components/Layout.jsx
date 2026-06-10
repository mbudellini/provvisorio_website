import { AppShell, Group, Title, Button, NavLink } from '@mantine/core'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  IconDashboard,
  IconFolders,
  IconShirt,
  IconCategory,
  IconLogout,
  IconPhoto,
  IconCalendarEvent,
} from '@tabler/icons-react'

const links = [
  { label: 'Dashboard', icon: IconDashboard, path: '/' },
  { label: 'Categorie', icon: IconCategory, path: '/categories' },
  { label: 'Collezioni', icon: IconFolders, path: '/collections' },
  { label: 'Prodotti', icon: IconShirt, path: '/products' },
  { label: 'Immagini Hero', icon: IconPhoto, path: '/hero-images' },
  { label: 'Appuntamenti', icon: IconCalendarEvent, path: '/appointments' },
]

export default function Layout({ children }) {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <AppShell
      navbar={{
        width: 250,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Navbar p="xs">
        <Title order={3} mb="md" ta="center">
          Provvisorio
        </Title>
        {links.map((link) => (
          <NavLink
            key={link.path}
            label={link.label}
            leftSection={<link.icon size={20} />}
            active={location.pathname === link.path}
            onClick={() => navigate(link.path)}
            mb={4}
          />
        ))}
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconLogout size={18} />}
          onClick={logout}
          mt="auto"
          fullWidth
        >
          Logout
        </Button>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
