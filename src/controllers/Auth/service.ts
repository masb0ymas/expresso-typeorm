import userSchema from '@controllers/User/schema'
import { LoginAttributes, User, UserPost } from '@entity/User'
import { generateAccessToken } from '@expresso/helpers/Token'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { getRepository } from 'typeorm'

interface DtoLogin {
  tokenType: string
  user: {
    uid: string
  }
  accessToken: string
  expiresIn: number
  message: string
}

class AuthService {
  public static async signUp(formData: UserPost): Promise<User> {
    const userRepository = getRepository(User)
    const value = useValidation(userSchema.register, formData)

    const newFormData = {
      ...value,
      password: value.confirmNewPassword,
    }

    const data = new User()
    const newData = await userRepository.save({ ...data, ...newFormData })

    return newData
  }

  public static async signIn(formData: LoginAttributes): Promise<DtoLogin> {
    const userRepository = getRepository(User)
    const value = useValidation(userSchema.login, formData)

    const getUser = await userRepository.findOne({
      select: ['id', 'email', 'isActive', 'password', 'RoleId'],
      where: { email: value.email },
    })

    // check user account
    if (!getUser) {
      throw new ResponseError.NotFound('account not found or has been deleted')
    }

    // check active account
    if (!getUser.isActive) {
      throw new ResponseError.BadRequest(
        'please check your email account to verify your email and continue the registration process.'
      )
    }

    const matchPassword = await getUser.comparePassword(value.password)

    // compare password
    if (!matchPassword) {
      throw new ResponseError.BadRequest('incorrect email or password')
    }

    const payloadToken = { uid: getUser.id }
    const accessToken = generateAccessToken(payloadToken)

    const newData = {
      message: 'Login successfully',
      ...accessToken,
      tokenType: 'Bearer',
      user: payloadToken,
    }

    return newData
  }
}

export default AuthService
