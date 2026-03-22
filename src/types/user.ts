export interface User {
  id: number
  username: string
  nickname: string
  email?: string
  phone?: string
  avatar?: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
  nickname: string
}
