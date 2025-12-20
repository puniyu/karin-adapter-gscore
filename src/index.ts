import { KarinConverGscore } from './core/convert'
import { AdapterGscore } from './core/client'
import { hooks, logger, Message, Permission } from 'node-karin'
import { MessageReceive, Scene, PermissionType } from '@/types'
import { getAvatar, getUserPerm } from './utils/user'

const getPerm = (e: Message): Permission => {
  if (e.isMaster) return 'master'
  if (e.isAdmin) return 'admin'
  if (e.isGroup) {
    if (e.sender.role === 'owner') return 'group.owner'
    if (e.isAdmin) return 'group.admin'
    return 'all'
  }
  return 'all'
}

export const KARIN_PLUGIN_INIT = async () => {
  const client = new AdapterGscore()

  hooks.message(async (message: Message) => {
    const content = await KarinConverGscore(message.elements)
    const pm_type = message.isGroup
      ? PermissionType.Group
      : PermissionType.Channel
    const pm = getPerm(message)
    const msg: MessageReceive = {
      bot_id: message.bot.selfId,
      bot_self_id: message.selfId,
      msg_id: message.messageId,
      user_type: message.isGroup ? Scene.Group : Scene.Direct,
      group_id: message.isGroup ? message.groupId : '',
      user_id: message.userId,
      user_pm: await getUserPerm(pm_type, pm),
      content,
      sender: {
        user_id: message.userId,
        nickname: message.sender.name,
        avatar: await getAvatar(message, message.userId),
      },
    }
    logger.debug(client.logger(), `发送消息: message_id: ${message.messageId}`)
    client.send(msg)
  })
}
