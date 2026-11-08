import { cancel, confirm, intro, isCancel, outro, password, select, spinner, text } from '@clack/prompts'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

let database!: typeof import('../../src/lib/database').default
let auth!: (typeof import('../../src/lib/auth/auth'))['auth']
let authMongoClient!: (typeof import('../../src/lib/auth/auth-database'))['authMongoClient']

type User = {
  id: string
  email: string
  name: string
  role?: string
}

const DEFAULT_EMAIL = 'admin@email.com'
const DEFAULT_NAME = 'Admin'
const DEFAULT_PASSWORD = '12345678'
let mongooseConnected = false
let authDatabaseConnected = false

function valueOrCancel(value: string | symbol): string {
  if (isCancel(value)) {
    cancel('Operação cancelada.')
    throw new Error('Operação cancelada.')
  }
  if (typeof value !== 'string') {
    throw new Error('Valor inválido.')
  }
  return value
}

function handleCancel(value: boolean | symbol): boolean {
  if (isCancel(value)) {
    cancel('Operação cancelada.')
    throw new Error('Operação cancelada.')
  }
  if (typeof value !== 'boolean') {
    throw new Error('Valor inválido.')
  }
  return value
}

async function askUserData(user?: User) {
  const email = valueOrCancel(
    await text({
      message: 'E-mail',
      initialValue: user?.email || DEFAULT_EMAIL,
      validate: value => (value && value.includes('@') ? undefined : 'Informe um e-mail válido.'),
    }),
  )
  const name = valueOrCancel(
    await text({
      message: 'Nome',
      initialValue: user?.name || DEFAULT_NAME,
      validate: value => (value && value.trim() ? undefined : 'Informe um nome.'),
    }),
  )
  const newPassword = valueOrCancel(
    await password({
      message: 'Senha',
      validate: value => (!value || value.length >= 8 ? undefined : 'A senha deve ter pelo menos 8 caracteres.'),
    }),
  )

  return { email, name, password: newPassword || DEFAULT_PASSWORD }
}

async function listUsers(): Promise<User[]> {
  const context = await auth.$context
  const users = await context.internalAdapter.listUsers(100, 0)
  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'role' in user && typeof user.role === 'string' ? user.role : undefined,
  }))
}

async function connectToDatabase() {
  const originalLog = console.log
  console.log = (...args: unknown[]) => {
    if (args.length === 1 && args[0] === 'Connected to database!') {
      return
    }
    originalLog(...args)
  }

  try {
    await database.connect()
  } finally {
    console.log = originalLog
  }

  mongooseConnected = true
  await authMongoClient.connect()
  authDatabaseConnected = true
}

async function loadUsers(): Promise<User[]> {
  const progress = spinner()
  progress.start('Carregando usuários...')

  try {
    await connectToDatabase()
    const users = await listUsers()
    progress.stop('Usuários carregados.')
    return users
  } catch (error) {
    progress.stop('Não foi possível carregar os usuários.')
    throw error
  }
}

async function createUser() {
  const data = await askUserData()
  await connectToDatabase()
  const context = await auth.$context
  const existing = await context.internalAdapter.findUserByEmail(data.email)

  if (existing) {
    throw new Error(`Já existe um usuário com o e-mail ${data.email}.`)
  }

  const user = await context.internalAdapter.createUser(
    { email: data.email, name: data.name, role: 'admin', emailVerified: true },
    { method: 'admin' },
  )
  await context.internalAdapter.linkAccount({
    providerId: 'credential',
    accountId: user.id,
    userId: user.id,
    password: await context.password.hash(data.password),
  })
}

async function resetUser(users: User[]) {
  if (!users.length) {
    throw new Error('Não existem usuários cadastrados.')
  }

  const selected = await selectUser(users)
  if (!selected) {
    return
  }

  const newPassword = valueOrCancel(
    await password({
      message: 'Nova senha',
      validate: value => (!value || value.length >= 8 ? undefined : 'A senha deve ter pelo menos 8 caracteres.'),
    }),
  )
  const context = await auth.$context
  await context.internalAdapter.updatePassword(selected.id, newPassword || DEFAULT_PASSWORD)
}

async function selectUser(users: User[]): Promise<User | null> {
  const selected = valueOrCancel(
    await select({
      message: 'Selecione o usuário',
      options: [
        ...users.map(user => ({ value: user.id, label: `${user.name} (${user.email})` })),
        { value: 'back', label: 'Voltar ao menu principal' },
      ],
    }),
  )
  return selected === 'back' ? null : users.find(user => user.id === selected) || null
}

async function updateUser(users: User[]) {
  if (!users.length) {
    throw new Error('Não existem usuários cadastrados.')
  }

  const user = await selectUser(users)
  if (!user) {
    return
  }

  const data = await askUserData(user)
  const context = await auth.$context
  await context.internalAdapter.updateUser(user.id, { email: data.email, name: data.name, role: 'admin' })
  await context.internalAdapter.updatePassword(user.id, data.password)
}

async function deleteUser(users: User[]) {
  if (!users.length) {
    throw new Error('Não existem usuários cadastrados.')
  }

  const user = await selectUser(users)
  if (!user) {
    return
  }

  const shouldDelete = handleCancel(
    await confirm({
      message: `Excluir o administrador ${user.name} (${user.email})?`,
      initialValue: false,
    }),
  )
  if (!shouldDelete) {
    return
  }

  const context = await auth.$context
  await context.internalAdapter.deleteUser(user.id)
}

async function selectAction(users: User[]): Promise<string> {
  const options = [
    { value: 'create', label: 'Criar administrador' },
    ...(users.length > 0
      ? [
          { value: 'update', label: 'Editar administrador' },
          { value: 'reset', label: 'Redefinir senha' },
          { value: 'delete', label: 'Excluir administrador' },
        ]
      : []),
    { value: 'exit', label: 'Sair' },
  ]
  return valueOrCancel(await select({ message: 'O que deseja fazer?', options }))
}

async function runAction(action: string, users: User[]) {
  if (action === 'create') {
    await createUser()
  } else if (action === 'reset') {
    await resetUser(users)
  } else if (action === 'update') {
    await updateUser(users)
  } else if (action === 'delete') {
    await deleteUser(users)
  }
}

async function runInteractive() {
  while (true) {
    const users = await loadUsers()
    if (users.length) {
      console.log(`Usuários cadastrados: ${users.map(user => `${user.name} <${user.email}>`).join(', ')}`)
    } else {
      console.log('Nenhum usuário cadastrado.')
    }

    const action = await selectAction(users)
    if (action === 'exit') {
      return
    }

    try {
      await runAction(action, users)
      outro('Operação concluída.')
    } catch (error) {
      outro(error instanceof Error ? error.message : 'Não foi possível concluir a operação.')
    }
  }
}

async function main() {
  const databaseModule = await import('../../src/lib/database')
  const authModule = await import('../../src/lib/auth/auth')
  const authDatabaseModule = await import('../../src/lib/auth/auth-database')
  database = databaseModule.default
  auth = authModule.auth
  authMongoClient = authDatabaseModule.authMongoClient
  intro('Genesis Forms - administração de usuários')

  const mode = process.argv[2]
  if (mode === '--create' || mode === '--reset') {
    const users = mode === '--reset' ? await loadUsers() : []
    await runAction(mode === '--create' ? 'create' : 'reset', users)
    outro('Operação concluída.')
    return
  }

  await runInteractive()
}

main()
  .catch(error => {
    outro(error instanceof Error ? error.message : 'Não foi possível concluir a operação.')
    process.exitCode = 1
  })
  .finally(async () => {
    if (authDatabaseConnected) {
      await authMongoClient.close()
    }
    if (mongooseConnected) {
      await database.close()
    }
  })
