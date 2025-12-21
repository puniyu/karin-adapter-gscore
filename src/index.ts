import { KarinConverGscore, AdapterGscore } from '@/core'
import { hooks, logger, Message } from 'node-karin'
import { MessageReceive, Scene } from '@/types'
import { getAvatar, getUserPerm } from './utils/user'

export const KARIN_PLUGIN_INIT = async () => {
  const client = new AdapterGscore()

  hooks.message(async (message: Message) => {
    const content = await KarinConverGscore(message.elements)
    const msg: MessageReceive = {
      bot_id: message.bot.selfId,
      bot_self_id: message.selfId,
      msg_id: message.messageId,
      user_type: message.isGroup ? Scene.Group : Scene.Direct,
      group_id: message.isGroup ? message.groupId : '',
      user_id: message.userId,
      user_pm: await getUserPerm(message),
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
