export interface DtoLogin {
  token_type: string
  user: {
    uid: string
  }
  fullname: string
  access_token: string
  expires_in: number
  message: string
}
