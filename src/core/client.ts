import {
  AdapterBase,
  AdapterType,
  logger,
  getBot,
  contactGroup,
  Contact,
  contactFriend,
} from 'node-karin'
import { adapterName, adapterVersion } from '@/root'
import { Config } from '@/common'
import WebSocket from 'node-karin/ws'
import { MessageReceive, MessageSend } from '@/types'
import { GscoreConvertKarin } from './convert'

export class AdapterGscore extends AdapterBase implements AdapterType {
  #ws!: WebSocket
  #reconnectAttempts = 0
  #reconnectInterval = 3000

  constructor() {
    super()
    this.#initWebSocket()
  }

  logger() {
    logger.chalk.rgb(224, 105, 123)('[GsCore]')
  }

  #initWebSocket() {
    const isWss = Config.config.wss
    const gecorePath = `${isWss ? 'wss' : 'ws'}://${Config.config.host}:${Config.config.port}/ws/karin`

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

    this.#ws.on('open', () => {
      this.#reconnectAttempts = 0
      logger.info(this.logger(), '连接成功')
    })

    this.#ws.on('error', (err) => {
      logger.info(this.logger(), '连接出错')
      logger.debug(this.logger(), err)
    })

    this.#ws.on('close', (_code, reason) => {
      logger.info(this.logger(), '连接关闭')
      logger.debug(this.logger(), reason.toString())
      this.#reconnect()
    })

    this.#ws.on('message', async (data) => {
      const message: MessageSend = JSON.parse(data.toString())
      let contact: Contact = contactFriend(message.target_id!)
      const elements = await GscoreConvertKarin(message.content)
      const bot = getBot(message.bot_self_id)!
      logger.info(this.logger(), `收到消息: message_id: ${message.msg_id}`)
      if (message.target_type === 'group') {
        contact = contactGroup(message.target_id!)
        bot.sendMsg(contact, elements)
      }
      bot.sendMsg(contact, elements)
    })
  }

  #reconnect() {
    this.#reconnectAttempts++
    logger.debug(this.logger(), `尝试重连 (${this.#reconnectAttempts})`)

    setTimeout(() => {
      this.#initWebSocket()
    }, this.#reconnectInterval)
  }
  send(data: MessageReceive) {
    const jsonData = JSON.stringify(data)
    this.#ws.send(Buffer.from(jsonData, 'utf8'))
  }
}
