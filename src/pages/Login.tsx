import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LayoutDashboard } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        if (signInError instanceof Error && signInError.message === 'Account inactive') {
          setError('Sua conta está inativa. Contate o administrador.')
        } else {
          setError('Credenciais inválidas.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="rounded-xl dark:bg-white dark:p-2">
          <img
            src="https://expedy.com.br/wp-content/uploads/2026/04/handcorp-logo.png"
            alt="HANDCORP Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <span className="text-3xl font-bold tracking-tight text-[#00213c] dark:text-white">
          HANDCORP
        </span>
      </div>
      <Card className="w-full max-w-md shadow-xl border-slate-200/60 dark:border-slate-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar na conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
