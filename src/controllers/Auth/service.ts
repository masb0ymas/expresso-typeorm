import userSchema from '@controllers/User/schema'
import { User, UserPost } from '@entity/User'
import useValidation from '@expresso/hooks/useValidation'
import { getRepository } from 'typeorm'

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
}

export default AuthService
