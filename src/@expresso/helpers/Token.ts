import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import ms from 'ms'

dotenv.config()

const { JWT_SECRET_ACCESS_TOKEN }: any = process.env
const JWT_ACCESS_TOKEN_EXPIRED = process.env.JWT_ACCESS_TOKEN_EXPIRED ?? '1d'

interface PayloadAccessToken {
  accessToken: string
  expiresIn: number
}

function generateAccessToken(payload: any): PayloadAccessToken {
  const expiresIn = ms(JWT_ACCESS_TOKEN_EXPIRED) / 1000

  const accessToken = jwt.sign(
    JSON.parse(JSON.stringify(payload)),
    JWT_SECRET_ACCESS_TOKEN,
    { expiresIn }
  )

  return { accessToken, expiresIn }
}

export { generateAccessToken }
