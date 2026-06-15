import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getAvatarUrl } from '@/lib/utils'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Upload } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const updatedUser = await pb.collection('users').update(user.id, formData)

      // Refresh the session token & data to update global auth context
      pb.authStore.save(pb.authStore.token, updatedUser)

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      const errorMessages = Object.values(fieldErrors).join('\n')

      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: errorMessages || 'Ocorreu um erro ao salvar suas informações.',
      })
    } finally {
      setLoading(false)
    }
  }

  const currentAvatarUrl = getAvatarUrl(user, user?.avatar)

  return (
    <div className="container mx-auto p-6 max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-slate-900 dark:text-slate-100">
        Perfil
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Suas Informações</CardTitle>
          <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border border-slate-200 dark:border-slate-800">
                  <AvatarImage
                    src={previewUrl || currentAvatarUrl}
                    alt={name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-[#cd6a38]/10 text-[#cd6a38] dark:bg-[#cd6a38]/20 font-medium">
                    {name?.substring(0, 2).toUpperCase() ||
                      user?.email?.substring(0, 2).toUpperCase() ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado por aqui.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#cd6a38] hover:bg-[#b0582d] text-white"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
