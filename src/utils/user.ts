import { Message, Permission } from 'node-karin'
import { PermissionType } from '@/types'

export const getAvatar = async (e: Message, userId: string) => {
  const bot = e.bot
  return await bot.getAvatarUrl(userId)
}

const getPermission = (e: Message): Permission => {
  if (e.isMaster) return 'master'
  if (e.isAdmin) return 'admin'

  if (e.isGroup) {
    if (e.sender.role === 'owner') return 'group.owner'
    return 'all'
  }

  if ('role' in e.sender && e.sender.role === 'owner') return 'guild.owner'

  return 'all'
}

export const getUserPerm = async (e: Message): Promise<number> => {
  const pm_type = e.isGroup ? PermissionType.Group : PermissionType.Channel
  const pm = getPermission(e)

  const permissionMap: Record<string, number> = {
    master: 1,
    admin: 2,
    all: 6,
    [`${PermissionType.Channel}.guild.owner`]: 2,
    [`${PermissionType.Channel}.guild.admin`]: 4,
    [`${PermissionType.Group}.group.owner`]: 2,
    [`${PermissionType.Group}.group.admin`]: 1,
  }

  if (permissionMap[pm] !== undefined) {
    return permissionMap[pm]
  }

  return permissionMap[`${pm_type}.${pm}`] ?? 6
}
