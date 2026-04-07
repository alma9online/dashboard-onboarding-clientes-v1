import pb from '@/lib/pocketbase/client'
import type { User } from '@/types'

export const getUsers = async () => {
  return pb.collection('users').getFullList<User>({
    sort: 'name',
  })
}

export const createUser = async (data: Partial<User> & { password?: string }) => {
  return pb.collection('users').create<User>({
    ...data,
    passwordConfirm: data.password,
  })
}

export const updateUser = async (id: string, data: Partial<User>) => {
  return pb.collection('users').update<User>(id, data)
}

export const deleteUser = async (id: string) => {
  return pb.collection('users').delete(id)
}
