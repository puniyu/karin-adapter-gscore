import { Role, Sex } from "node-karin";

export interface SenderType {
  user_id: string,
  nickname: string,
  avatar: string,
  card?: string,
  age?: number,
  sex?: Sex,
  area?: string,
  role?: Role,
  title?: string
}