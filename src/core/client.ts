import  {
  AdapterBase,
  AdapterType,
  logger,
  getBot,
  contactGroup,
  Contact,
  contactFriend,
  senderGroup,
  createGroupMessage,
} from 'node-karin'
import { adapterName, adapterVersion } from '@/root'
import { Config } from '@/common'
import WebSocket from 'node-karin/ws'
import { MessageReceive, MessageSend } from '@/types'
import { GscoreConvertKarin } from './convert'

export class AdapterGscore extends AdapterBase implements AdapterType {
  #ws
  #messageSeq = 0
  constructor() {
    super()
    const gecorePath = `ws://${Config.config.host}:${Config.config.port}/ws/karin`
    this.adapter = {
      index: 0,
      name: adapterName,
      version: adapterVersion,
      platform: 'other',
      standard: 'other',
      protocol: 'other',
      communication: 'webSocketClient',
      address: gecorePath,
      connectTime: new Date().getTime(),
      secret: null,
    }
    this.#ws = new WebSocket(gecorePath)
  }
  sendApi?: ((...args: any[]) => Promise<any>) | undefined
  logger(...message: any[]) {
    logger.info(logger.chalk.rgb(224, 105, 123)('[GsCore]'), ...message)
  }
  async init() {
    this.#ws.on('open', () => {
      this.logger('连接成功')
    })
    this.#ws.on('error', (err) => {
      this.logger('连接出错:', err)
    })
    this.#ws.on('close', (code, reason) => {
      this.logger('连接关闭:', code, reason.toString())
    })
    this.#ws.on('message', async (data) => {
      const time = Date.now()
      const message: MessageSend = JSON.parse(data.toString())
      let contact: Contact = contactFriend(message.target_id!)
      const elements = await GscoreConvertKarin(message.content)
      const bot = getBot(message.bot_self_id)!
      if (message.target_type === 'group') {
        contact = contactGroup(message.target_id!)
        this.logger("收到消息")
        const sender = senderGroup(message.target_id!)
        const e = createGroupMessage({
          time,
          eventId: `message:${message.msg_id}`,
          rawEvent: message,
          srcReply: (elements) => bot.sendMsg(contact, elements),
          elements,
          messageId: message.msg_id,
          messageSeq: ++this.#messageSeq,
          bot,
          contact,
          sender
        })
        e.reply(elements)
      }
    })
  }
  send(data: MessageReceive) {
    const jsonData = JSON.stringify(data)
    this.#ws.send(Buffer.from(jsonData, 'utf8'))
  }
}
