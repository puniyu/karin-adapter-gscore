import { SenderType } from './sender'
export * from './sender'
export * from './permssion'

export enum MessageType {
  /** 文本 */
  Text = 'text',
  /** markdown */
  Markdown = 'markdown',
  /** 按钮 */
  Buttons = 'buttons',
  /** 图片 */
  Image = 'image',
  /** 文件 */
  File = 'file',
  /** 艾特 */
  At = 'at',
  /** 回复 */
  Reply = 'reply',
  /** 语音 */
  Record = 'record',
  /** 转发消息 */
  Node = 'node',
    /** 图片大小 */
  ImageSize = 'image_size',
}

export const enum ImageType {
  Url = 'url',
  Base64 = 'base64',
  File = 'file',
}

export interface Button {
  text: string
  data: string
  /** 按下显示的值 */
  pressed_text: string
  /**
   * 0灰色线框
   * 1蓝色线框
   */
  style: 0 | 1
  /**
   * 0跳转按钮
   * 1回调按钮
   * 2命令按钮
   */
  action: 0 | 1 | 2
  /**
   * 0指定用户
   * 1管理者
   * 2所有人可按
   * 3指定身份组
   */
  permisson: 0 | 1 | 2
  /** 仅限频道可用 */
  specify_role_ids: string[]
  /** 指定用户 */
  specify_user_ids: string[]
  unsupport_tips: string
}

export interface MessageData {
  [MessageType.Text]: string
  [MessageType.Markdown]: string
  [MessageType.Buttons]: Button[] | Button
  [MessageType.Image]: string
  [MessageType.File]: `${string}|${string}`
  [MessageType.At]: string
  [MessageType.Reply]: string
  [MessageType.ImageSize]: [{ width: number; height: number }]
}
export type Message = {
  [K in keyof MessageData]: {
    type: K;
    data: MessageData[K];
  }
}[keyof MessageData];

export enum Scene {
  Group = 'group',
  Direct = 'direct',
  Channel = 'channel',
  SubChannel = 'sub_channel',
}

/** 发送给Gscore的包 */
export interface MessageReceive {
  bot_id: string
  bot_self_id: string
  msg_id: string
  user_type: Scene
  group_id: string | `${string}-${string}`
  user_id: string
  user_pm: number
  content: Message[]
  sender: SenderType
}


/** 收到Gscore的包 */
export interface MessageSend {
  bot_id: string
  bot_self_id: string
  msg_id: string
  user_type: 'group'
  target_type: 'group' | 'channel' | null
  target_id: string | null
  content: Message[]
}
