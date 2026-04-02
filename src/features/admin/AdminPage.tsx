import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { Shield, Search, Check, X, Crown, AlertCircle, UserPlus, ArrowLeft, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminService, type AdminUser } from '@/services/adminService'
import { cn } from '@/utils/cn'

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
      plan === 'pro'
        ? 'bg-accent/20 text-accent'
        : 'bg-surface-elevated text-muted-foreground'
    )}>
      {plan === 'pro' && <Crown className="h-2.5 w-2.5" />}
      {plan}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
      role === 'admin'
        ? 'bg-primary/20 text-primary'
        : 'bg-surface-elevated text-muted-foreground'
    )}>
      {role === 'admin' && <Shield className="h-2.5 w-2.5" />}
      {role}
    </span>
  )
}

export function AdminPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Invite user form
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  async function loadUsers() {
    setIsLoading(true)
    setError(null)
    try {
      setUsers(await adminService.listUsers())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? users.filter((u) => u.email.toLowerCase().includes(q)) : users
  }, [users, search])

  async function handleAction(key: string, fn: () => Promise<void>, successMsg?: string) {
    setActionLoading(key)
    setActionError(null)
    setActionSuccess(null)
    try {
      await fn()
      await loadUsers()
      if (successMsg) {
        setActionSuccess(successMsg)
        setTimeout(() => setActionSuccess(null), 3000)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) return
    setIsInviting(true)
    setInviteError(null)
    setInviteSuccess(null)
    try {
      await adminService.inviteUser(email)
      setInviteSuccess(`Invite sent to ${email}`)
      setInviteEmail('')
      await loadUsers()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite user')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <PageLayout title="Admin" subtitle="User management">
      <div className="space-y-4 pb-8">

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Action feedback */}
        {actionError && (
          <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
            <span className="text-foreground flex-1">{actionError}</span>
            <button onClick={() => setActionError(null)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        )}
        {actionSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-success/10 px-4 py-3 text-sm">
            <Check className="h-4 w-4 flex-shrink-0 text-accent" />
            <span className="text-foreground flex-1">{actionSuccess}</span>
          </div>
        )}

        {/* Invite user */}
        <Card>
          <CardBody className="p-4">
            <p className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Invite User by Email
            </p>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={cn(
                  'flex-1 rounded-xl border border-surface-border bg-surface py-2 px-3',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
              />
              <Button type="submit" size="sm" variant="primary" isLoading={isInviting}>
                Invite
              </Button>
            </form>
            {inviteError && (
              <p className="mt-2 text-xs text-danger">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="mt-2 text-xs text-accent">{inviteSuccess}</p>
            )}
          </CardBody>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full rounded-xl border border-surface-border bg-surface py-2.5 pl-9 pr-4',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/50'
            )}
          />
        </div>

        {/* User list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground px-1">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            </p>
            {filtered.map((u) => {
              const busy = (label: string) => actionLoading === `${u.id}-${label}`
              return (
                <Card key={u.id}>
                  <CardBody className="p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{u.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <PlanBadge plan={u.plan} />
                          <RoleBadge role={u.role} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {u.plan === 'pro' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={busy('remove-pro')}
                            onClick={() => handleAction(
                              `${u.id}-remove-pro`,
                              () => adminService.removePro(u.id),
                              'Pro removed'
                            )}
                            className="text-danger hover:bg-danger/10 text-xs"
                          >
                            Remove Pro
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={busy('grant-pro')}
                            onClick={() => handleAction(
                              `${u.id}-grant-pro`,
                              () => adminService.grantPro(u.id),
                              'Pro granted'
                            )}
                            className="text-accent hover:bg-accent/10 text-xs"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Grant Pro
                          </Button>
                        )}

                        {u.role === 'admin' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={busy('remove-admin')}
                            onClick={() => handleAction(
                              `${u.id}-remove-admin`,
                              () => adminService.setRole(u.id, 'user')
                            )}
                            className="text-muted-foreground hover:bg-surface-elevated text-xs"
                          >
                            Remove Admin
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={busy('make-admin')}
                            onClick={() => handleAction(
                              `${u.id}-make-admin`,
                              () => adminService.setRole(u.id, 'admin')
                            )}
                            className="text-primary hover:bg-primary/10 text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Make Admin
                          </Button>
                        )}

                        {/* Grant full access = Pro + Admin */}
                        {(u.plan !== 'pro' || u.role !== 'admin') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={busy('full-access')}
                            onClick={() => handleAction(`${u.id}-full-access`, async () => {
                              await adminService.grantPro(u.id)
                              await adminService.setRole(u.id, 'admin')
                            }, 'Full access granted')}
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            Full Access
                          </Button>
                        )}

                        {u.plan === 'pro' && u.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 text-xs text-accent">
                            <Check className="h-3 w-3" /> Full
                          </span>
                        )}

                        {/* Delete user */}
                        {deleteConfirm === u.id ? (
                          <div className="flex items-center gap-1 rounded-xl border border-danger/40 bg-danger/10 px-2 py-1">
                            <span className="text-xs text-danger font-medium">Confirmar?</span>
                            <button
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-danger text-white hover:bg-danger/80 transition-colors"
                              onClick={() => {
                                setDeleteConfirm(null)
                                handleAction(
                                  `${u.id}-delete`,
                                  () => adminService.deleteUser(u.id),
                                  'Usuário deletado'
                                )
                              }}
                            >
                              Sim
                            </button>
                            <button
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={busy('delete')}
                            onClick={() => setDeleteConfirm(u.id)}
                            className="text-danger hover:bg-danger/10 text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Deletar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
