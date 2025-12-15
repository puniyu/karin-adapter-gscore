import { Config } from '@/common'
import { ImageType, Message, MessageType } from '@/types'
import { Elements } from 'node-karin'

export const KarinConverGscore = async (
  data: Array<Elements>,
): Promise<Array<Message>> => {
  const elements: Array<Message> = []
  for (const i of data) {
    switch (i.type) {
      case 'text':
        elements.push({
          type: MessageType.Text,
          data: i.text,
        })
        break
      case 'at':
        elements.push({
          type: MessageType.At,
          data: i.targetId,
        })
        break
      case 'reply':
        elements.push({
          type: MessageType.Reply,
          data: i.messageId,
        })
        break
      case 'image':
        const image = i.file
        elements.push({
          type: MessageType.Image,
          data: image,
        })
        break
      case 'file':
        const fileName = i.name || 'file'
        const file: `${string}|${string}` = `${fileName}|${i.file}`
        elements.push({
          type: MessageType.File,
          data: file,
        })
    }
  }
  return elements
}

export const GscoreConvertKarin = async (
  data: Array<Message>,
): Promise<Array<Elements>> => {
  const elements: Array<Elements> = []
  for (const i of data) {
    switch (i.type) {
      case 'text':
        elements.push({
          type: 'text',
          text: i.data,
        })
        break
      case 'at':
        elements.push({
          type: 'at',
          targetId: i.data,
        })
        break
      case 'reply': {
        elements.push({
          type: 'reply',
          messageId: i.data,
        })
        break
      }
      case 'image': {
        if (i.data.startsWith('link://')) {
          const url = i.data.replace('link://', '')
          elements.push({
            type: 'image',
            file: `http://${Config.config.host}:${Config.config.port}/${url}`,
          })
        } else {
          elements.push({
            type: 'image',
            file: i.data,
          })
        }
      }
    }
  }
  return elements
}
