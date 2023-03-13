import { MAIL_PASSWORD, MAIL_USERNAME } from '@config/env'
import { i18nConfig } from '@config/i18n'
import SessionService from '@controllers/Account/Session/service'
import userSchema from '@controllers/Account/User/schema'
import UserService from '@controllers/Account/User/service'
import ConstRole from '@core/constants/ConstRole'
import SendMail from '@core/helpers/sendMails'
import { generateToken, verifyToken } from '@core/helpers/token'
import { optionsYup } from '@core/helpers/yup'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { AppDataSource } from '@database/data-source'
import {
  User,
  type LoginAttributes,
  type UserLoginAttributes,
} from '@database/entities/User'
import { validateEmpty } from 'expresso-core'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { type DtoLogin } from './interface'

class AuthService {
  /**
   *
   * @param formData
   * @returns
   */
  public static async signUp(formData: any): Promise<User> {
    const userRepository = AppDataSource.manager.getRepository(User)

    const uid = uuidv4()
    const { token } = generateToken({ token: uid })

    let RoleId = ConstRole.ID_USER

    // check role
    if (formData.roleAs === 'USER') {
      RoleId = ConstRole.ID_USER
    }

    const newFormData = {
      ...formData,
      isActive: false,
      phone: validateEmpty(formData.phone),
      tokenVerify: token,
      RoleId,
    }

    const value = userSchema.register.validateSync(newFormData, optionsYup)

    const formRegister: any = {
      ...value,
      password: value.confirmNewPassword,
    }

    const data = new User()
    const newData = await userRepository.save({ ...data, ...formRegister })

    // send mail if mail username & password exists
    if (MAIL_USERNAME && MAIL_PASSWORD) {
      await SendMail.accountRegistration({
        email: formData.email,
        fullname: formData.fullname,
      })
    }

    return newData
  }

  /**
   *
   * @param formData
   * @param options
   * @returns
   */
  public static async signIn(
    formData: LoginAttributes,
    options?: ReqOptions
  ): Promise<DtoLogin> {
    const userRepository = AppDataSource.getRepository(User)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const value = userSchema.login.validateSync(formData, optionsYup)

    const getUser = await userRepository.findOne({
      select: ['id', 'fullname', 'email', 'isActive', 'password', 'RoleId'],
      where: { email: value.email },
    })

    // check user account
    if (!getUser) {
      const message = i18nConfig.t('errors.account_not_found', i18nOpt)
      throw new ResponseError.NotFound(message)
    }

    // check active account
    if (!getUser.isActive) {
      const message = i18nConfig.t('errors.please_check_your_email', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }

    const matchPassword = await getUser.comparePassword(value.password)

    // compare password
    if (!matchPassword) {
      const message = i18nConfig.t('errors.incorrect_email_or_pass', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }

    const payloadToken = { uid: getUser.id }
    const { token, expiresIn } = generateToken(payloadToken)

    const message = i18nConfig.t('success.login', i18nOpt)

    const newData = {
      message,
      accessToken: token,
      expiresIn,
      tokenType: 'Bearer',
      user: payloadToken,
      fullname: getUser.fullname,
    }

    return newData
  }

  /**
   *
   * @param UserId
   * @param token
   * @param options
   * @returns
   */
  public static async verifySession(
    UserId: string,
    token: string,
    options?: ReqOptions
  ): Promise<User | null> {
    const getSession = await SessionService.findByUserToken(UserId, token)
    const validateToken = verifyToken(getSession.token)

    const userToken = validateToken?.data as UserLoginAttributes

    if (!_.isEmpty(userToken.uid)) {
      const getUser = await UserService.findById(userToken.uid, { ...options })

      return getUser
    }

    return null
  }

  /**
   *
   * @param UserId
   * @param token
   * @param options
   * @returns
   */
  public static async logout(
    UserId: string,
    token: string,
    options?: ReqOptions
  ): Promise<string> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const getUser = await UserService.findById(UserId, { ...options })

    // clean session
    await SessionService.deleteByUserToken(getUser.id, token)
    const message = i18nConfig.t('success.logout', i18nOpt)

    return message
  }
}
export default AuthService
