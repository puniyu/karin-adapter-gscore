import { Config } from '@/common'
import { Button, Message, MessageType } from '@/types'
import { Elements, KarinButton } from 'node-karin'

export const convertToKarinButton = (
  data: Button[][] | Button[] | Button,
): KarinButton[] | KarinButton[][] => {
  const convertButton = (button: Button): KarinButton => ({
    text: button.text,
    data: button.data,
    show: button.pressed_text,
    style: button.style,
    admin: button.permisson == 1,
    list: button.specify_user_ids,
    role: button.specify_role_ids,
    tips: button.unsupport_tips,
  })

  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    return (data as Button[][]).map((row) => row.map(convertButton))
  } else if (Array.isArray(data)) {
    return (data as Button[]).map(convertButton)
  } else {
    return [convertButton(data)]
  }
}

export const convertToGsCoreButton = (
  data: KarinButton[] | KarinButton[][],
): Button[] | Button[][] => {
  const convertSingleKarinButton = (button: KarinButton): Button => ({
    text: button.text,
    pressed_text: button.show,
    style: button.style as 0 | 1,
    action: button.callback ? 1 : 0,
    permisson: button.admin ? 1 : 2,
    specify_role_ids: button.role,
    specify_user_ids: button.list,
    unsupport_tips: button.tips,
  })
  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    return (data as KarinButton[][]).map((row) =>
      row.map(convertSingleKarinButton),
    )
  } else {
    return (data as KarinButton[]).map(convertSingleKarinButton)
  }
}

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
        break
      case 'markdown':
        elements.push({
          type: MessageType.Markdown,
          data: i.markdown,
        })
        break
      case 'button':
        const buttons = convertToGsCoreButton(i.data)
        elements.push({
          type: MessageType.Buttons,
          data: buttons,
        })
        break
      case 'keyboard':
        const keyboardButtons = convertToGsCoreButton(i.rows)
        elements.push({
          type: MessageType.Buttons,
          data: keyboardButtons,
        })
        break
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
            file: `http://${Config.host}:${Config.port}/${url.replace(/^\//, '')}`,
          })
        } else {
          elements.push({
            type: 'image',
            file: i.data,
          })
        }
        break
      }
      case 'file': {
        const [fileName, file] = i.data.split('|')
        elements.push({
          type: 'file',
          name: fileName,
          file,
        })
        break
      }
      case 'buttons': {
        const karinButtons = convertToKarinButton(i.data)
        if (Array.isArray(karinButtons[0])) {
          elements.push({
            type: 'keyboard',
            rows: karinButtons as KarinButton[][],
          })
        } else {
          elements.push({
            type: 'button',
            data: karinButtons as KarinButton[],
          })
        }
        break
      }
    }
  }
  return elements
}
