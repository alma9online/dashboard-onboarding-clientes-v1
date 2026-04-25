import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { getSyncHistory, syncRdStation } from '@/services/sincronizacoes'
import { SyncHistory } from '@/types'
import { RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === 'admin'

  const [history, setHistory] = useState<SyncHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ novos: number; atualizados: number } | null>(null)

  const loadHistory = async () => {
    if (!isAdmin) return
    try {
      const data = await getSyncHistory()
      setHistory(data.items)
    } catch (error) {
      console.error('Failed to load sync history', error)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [isAdmin])

  useRealtime(
    'sincronizacoes',
    () => {
      loadHistory()
    },
    isAdmin,
  )

  const handleSync = async () => {
    setLoading(true)
    setSummary(null)
    try {
      const result = await syncRdStation()
      setSummary({
        novos: result.clientes_novos,
        atualizados: result.clientes_atualizados,
      })
      toast({
        title: 'Sincronização concluída',
        description: 'Os dados foram sincronizados com sucesso.',
      })
    } catch (error: unknown) {
      const msg = getErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Erro na sincronização',
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      {isAdmin && (
        <div className="grid gap-4 grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Integração RD Station</CardTitle>
              <CardDescription>
                Sincronize seus clientes e negócios ganhos do RD Station com a plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSync} disabled={loading} className="w-full sm:w-auto">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Sincronizando...' : 'Sincronizar com RD Station'}
              </Button>

              {summary && (
                <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 mt-4">
                  <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
                  <AlertTitle>Sucesso!</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 list-disc list-inside">
                      <li>
                        <strong>Clientes Novos:</strong> {summary.novos}
                      </li>
                      <li>
                        <strong>Clientes Atualizados:</strong> {summary.atualizados}
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronizações</CardTitle>
              <CardDescription>
                Últimas 10 tentativas de sincronização com o RD Station.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data / Hora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resumo</TableHead>
                      <TableHead>Executado por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Nenhuma sincronização encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(item.created), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.status === 'sucesso' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent">
                                Sucesso
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1 w-max"
                              >
                                <XCircle className="h-3 w-3" /> Erro
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.status === 'sucesso' ? (
                              <span className="text-sm">
                                {item.clientes_novos} novos, {item.clientes_atualizados} atualizados
                              </span>
                            ) : (
                              <span
                                className="text-sm text-red-600 truncate max-w-[200px] inline-block"
                                title={item.mensagem_erro}
                              >
                                {item.mensagem_erro || 'Falha na comunicação'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{item.expand?.executado_por?.name || 'Sistema'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isAdmin && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Você não tem permissão para visualizar as configurações do sistema.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
