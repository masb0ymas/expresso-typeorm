import { validate } from 'expresso-core'
import { useToken } from 'expresso-hooks'
import { ExpiresType } from 'expresso-hooks/lib/token/types'
import { TOptions } from 'i18next'
import _ from 'lodash'
import { EntityManager } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/env'
import { i18n } from '~/config/i18n'
import ConstRole from '~/core/constant/entity/role'
import { IReqOptions } from '~/core/interface/ReqOptions'
import ErrorResponse from '~/core/modules/response/ErrorResponse'
import Mailing from '~/core/utils/mailing'
import { AppDataSource } from '~/database/datasource'
import { Role } from '~/database/entities/Role'
import { Session } from '~/database/entities/Session'
import {
  LoginAttributes,
  User,
  UserLoginAttributes,
} from '~/database/entities/User'
import userSchema from '../schema/user.schema'
import OpenStreetMapService from './provider/osm.service'
import SessionService from './session.service'

const sendMail = new Mailing()
const osmService = new OpenStreetMapService()

const newSessionService = new SessionService({
  tableName: 'session',
  entity: Session,
})

export default class AuthService {
  /**
   * Repository
   * @returns
   */
  private _repository() {
    const user_repo = AppDataSource.getRepository(User)

    return { user_repo }
  }

  /**
   *
   * @param formData
   * @returns
   */
  public async signUp(formData: any) {
    const { user_repo } = this._repository()
    const uid = uuidv4()

    const { token } = useToken.generate({
      value: { token: uid },
      secretKey: env.JWT_SECRET_ACCESS_TOKEN,
      expires: env.JWT_ACCESS_TOKEN_EXPIRED as ExpiresType,
    })

    let role_id = ConstRole.ID_USER

    // check role
    if (formData.roleAs === ConstRole.ID_USER) {
      role_id = ConstRole.ID_USER
    }

    const value = userSchema.register.parse({
      ...formData,
      is_active: false,
      is_blocked: false,
      phone: validate.empty(formData.phone),
      token_verify: token,
      role_id,
      upload_id: null,
    })

    const formRegister: any = {
      ...value,
      password: value.confirm_new_password,
    }

    const data = new User()
    const newData = await user_repo.save({
      ...data,
      ...formRegister,
    })

    // send mail if mail username & password exists
    if (env.MAIL_USERNAME && env.MAIL_PASSWORD) {
      await sendMail.accountRegistration({
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
  public async signIn(formData: LoginAttributes, options?: IReqOptions) {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const value = userSchema.login.parse(formData)

    let data: any

    // run transaction
    await AppDataSource.transaction(async (entityManager: EntityManager) => {
      // user repo
      const user_repo = entityManager.getRepository(User)

      // role repo
      const role_repo = entityManager.getRepository(Role)

      const getUser = await user_repo.findOne({
        select: ['id', 'fullname', 'email', 'is_active', 'password', 'role_id'],
        where: { email: value.email },
      })

      // check user account
      if (!getUser) {
        const message = i18n.t('errors.account_not_found', i18nOpt)
        throw new ErrorResponse.NotFound(message)
      }

      // check active account
      if (!getUser.is_active) {
        const message = i18n.t('errors.please_check_your_email', i18nOpt)
        throw new ErrorResponse.BadRequest(message)
      }

      const matchPassword = await getUser.comparePassword(value.password)

      // compare password
      if (!matchPassword) {
        const message = i18n.t('errors.incorrect_email_or_pass', i18nOpt)
        throw new ErrorResponse.BadRequest(message)
      }

      const user_id = getUser.id
      const getRole = await role_repo.findOne({
        where: { id: getUser.role_id },
      })

      if (value.latitude && value.longitude) {
        // get address from lat long maps
        const response = await osmService.getByCoordinate(
          String(value.latitude),
          String(value.longitude)
        )
        const address = _.get(response, 'display_name', '')

        // update address
        await user_repo.update({ id: user_id }, { address })
      }

      const payloadToken = { uid: user_id }

      const { token, expiresIn } = useToken.generate({
        value: payloadToken,
        secretKey: env.JWT_SECRET_ACCESS_TOKEN,
        expires: env.JWT_ACCESS_TOKEN_EXPIRED as ExpiresType,
      })

      const message = i18n.t('success.login', i18nOpt)

      const newData = {
        message,
        data: {
          access_token: token,
          expires_in: expiresIn,
          token_type: 'Bearer',
          user: {
            ...payloadToken,
            fullname: getUser.fullname,
            roleAs: getRole?.name,
          },
        },
      }

      data = newData
    })

    return data
  }

  /**
   *
   * @param user_id
   * @param token
   * @param options
   * @returns
   */
  public async verifySession(
    user_id: string,
    token: string,
    options?: IReqOptions
  ) {
    const { user_repo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const getSession = await newSessionService.findByUserToken(user_id, token)

    const validateToken = useToken.verify({
      token: getSession.token,
      secretKey: env.JWT_SECRET_ACCESS_TOKEN,
    })

    const userToken = validateToken?.data as UserLoginAttributes

    if (!_.isEmpty(userToken.uid)) {
      // get user
      const getUser = await user_repo.findOne({ where: { id: userToken.uid } })

      if (!getUser) {
        const message = i18n.t('errors.account_not_found', i18nOpt)
        throw new ErrorResponse.NotFound(message)
      }

      return getUser
    }

    return null
  }

  /**
   *
   * @param user_id
   * @param token
   * @param options
   * @returns
   */
  public async logout(user_id: string, token: string, options?: IReqOptions) {
    const { user_repo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    // get user
    const getUser = await user_repo.findOne({ where: { id: user_id } })

    if (!getUser) {
      const message = i18n.t('errors.account_not_found', i18nOpt)
      throw new ErrorResponse.NotFound(message)
    }

    // clean session
    await newSessionService.deleteByUserToken(getUser.id, token)
    const message = i18n.t('success.logout', i18nOpt)

    return message
  }
}
