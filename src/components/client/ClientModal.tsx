import { useState, useEffect } from 'react'
import { Minus, Plus, Save, User, CheckSquare, Clock } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { ClientChecklist } from './ClientChecklist'
import { updateCliente } from '@/services/clientes'
import { createTarefa, updateTarefa } from '@/services/tarefas'
import { useToast } from '@/hooks/use-toast'
import type { Client, Task } from '@/types'
import { formatHoursToReadableTime } from '@/lib/utils'

const SISTEMAS_OPTIONS = ['Expedy', 'Snap', 'Handsys'] as const

interface ClientModalProps {
  client?: Client
  tasks: Task[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientModal({ client, tasks, open, onOpenChange }: ClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (client && open) {
      setFormData({
        nome: client.nome || '',
        email: client.email || '',
        telefone: client.telefone || '',
        sistemas: client.sistemas || [],
        funcoes_avancadas: client.funcoes_avancadas || false,
        horas_acumuladas: client.horas_acumuladas || 0,
      })
    }
  }, [client, open])

  if (!client) return null

  const handleSaveDetails = async () => {
    setIsSaving(true)
    try {
      await updateCliente(client.id, formData)
      toast({ title: 'Cliente atualizado com sucesso' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar cliente', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSistemaToggle = (sys: 'Expedy' | 'Snap' | 'Handsys') => {
    const current = formData.sistemas || []
    const updated = current.includes(sys) ? current.filter((s) => s !== sys) : [...current, sys]
    setFormData({ ...formData, sistemas: updated })
  }

  const adjustHours = (amount: number) => {
    setFormData((prev) => {
      const current = prev.horas_acumuladas || 0
      let next = current + amount
      if (next < 0) next = 0
      return { ...prev, horas_acumuladas: Number(next.toFixed(4)) }
    })
  }

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task) {
      await updateTarefa(id, { concluido: !task.concluido })
    }
  }

  const handleAddTask = async (titulo: string, descricao: string) => {
    await createTarefa({
      cliente_id: client.id,
      titulo,
      descricao,
      concluido: false,
    })
  }

  const handleEditTask = async (id: string, titulo: string, descricao: string) => {
    await updateTarefa(id, { titulo, descricao })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl">{client.nome}</DialogTitle>
          <DialogDescription>Gerencie os detalhes e o progresso da implantação.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 pb-2 shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Detalhes
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Checklist
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 pt-2">
              <TabsContent value="details" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Cliente</Label>
                      <Input
                        value={formData.nome || ''}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.telefone || ''}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Sistemas Contratados</Label>
                      <div className="flex flex-col gap-2">
                        {SISTEMAS_OPTIONS.map((sys) => (
                          <div key={sys} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sys-${sys}`}
                              checked={formData.sistemas?.includes(sys)}
                              onCheckedChange={() => handleSistemaToggle(sys)}
                            />
                            <Label htmlFor={`sys-${sys}`} className="font-normal cursor-pointer">
                              {sys}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Funções Avançadas</Label>
                          <p className="text-xs text-muted-foreground">Habilita recursos premium</p>
                        </div>
                        <Switch
                          checked={formData.funcoes_avancadas}
                          onCheckedChange={(c) =>
                            setFormData({ ...formData, funcoes_avancadas: c })
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col space-y-1.5">
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            Tempo Gasto (Horas)
                          </Label>
                          <span className="text-xs text-muted-foreground font-medium">
                            Total: {formatHoursToReadableTime(formData.horas_acumuladas)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustHours(-0.0833)}
                            className="h-8 w-8 shrink-0"
                            title="- 5 minutos"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            step="0.0833"
                            min="0"
                            className="w-24 text-center h-8"
                            value={formData.horas_acumuladas || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                horas_acumuladas: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustHours(0.0833)}
                            className="h-8 w-8 shrink-0"
                            title="+ 5 minutos"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveDetails}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    {!isSaving && <Save className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="mt-0">
                <ClientChecklist
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
