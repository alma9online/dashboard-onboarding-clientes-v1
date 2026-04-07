import pb from '@/lib/pocketbase/client'
import { User } from '@/types'

export const getUsers = async () => {
  return pb.collection('users').getFullList<User>({
    sort: '-created',
  })
}

export const deleteUser = async (id: string) => {
  return pb.collection('users').delete(id)
}
