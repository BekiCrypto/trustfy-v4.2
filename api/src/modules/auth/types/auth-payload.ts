export interface AuthPayload {
  address: string
  roles: string[]
  sub: string
  iat: number
  exp: number
}
