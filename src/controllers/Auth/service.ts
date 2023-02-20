import { MAIL_PASSWORD, MAIL_USERNAME } from '@config/env'
import userSchema from '@controllers/Account/User/schema'
import ConstRole from '@core/constants/ConstRole'
import { validateEmpty } from '@core/helpers/formatter'
import SendMail from '@core/helpers/sendMails'
import { generateToken } from '@core/helpers/token'
import { optionsYup } from '@core/helpers/yup'
import { AppDataSource } from '@database/data-source'
import { User, type UserAttributes } from '@database/entities/User'
import { v4 as uuidv4 } from 'uuid'

class AuthService {
  /**
   *
   * @param formData
   * @returns
   */
  public static async signUp(formData: UserAttributes): Promise<User> {
    const userRepository = AppDataSource.manager.getRepository(User)

    const uid = uuidv4()
    const { token } = generateToken({ token: uid })

    const newFormData = {
      ...formData,
      isActive: false,
      phone: validateEmpty(formData.phone),
      tokenVerify: token,
      RoleId: ConstRole.ID_USER,
    }

    const value = userSchema.register.validateSync(newFormData, optionsYup)

    const formRegister: any = {
      ...value,
      password: value.confirmNewPassword,
    }

    const data = new User()
    const newData = await userRepository.save({ ...data, ...formRegister })

    if (MAIL_USERNAME && MAIL_PASSWORD) {
      await SendMail.AccountRegistration({
        email: formData.email,
        fullname: formData.fullname,
      })
    }

    return newData
  }
}
export default AuthService
