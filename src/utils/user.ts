import { Message, Permission } from 'node-karin'
import { PermissionType } from '@/types'

export const getAvatar = async (e: Message, userId: string) => {
  const bot = e.bot
  return await bot.getAvatarUrl(userId)
}

export const getUserPerm = async (pm_type: PermissionType, pm: Permission): Promise<number> => {
  switch (pm) {
    case 'master': return 1
    case 'admin': return 2
    case 'all': return 6
  }
  
  switch (pm_type) {
    case PermissionType.Channel:
      switch (pm) {
        case 'guild.owner': return 2
        case 'guild.admin': return 4
      }
      break
    case PermissionType.Group:
      switch (pm) {
        case 'group.owner': return 2
        case 'group.admin': return 1
      }
      break
  }
  
  return 6
}
