import { TextInput, PasswordInput, Button, Paper, Title, Container, Stack } from '@mantine/core'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { notifications } from '@mantine/notifications'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      notifications.show({
        title: 'Errore',
        message: 'Credenziali non valide',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="lg">
        Provvisorio Admin
      </Title>
      <Paper shadow="md" p={30} radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading}>
              Accedi
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
