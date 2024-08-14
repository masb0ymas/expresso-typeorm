import BaseResponse from './BaseResponse'

class Unauthorized extends BaseResponse {
  constructor(message: string) {
    super(message, 'Unauthorized', 401)
    Object.setPrototypeOf(this, Unauthorized.prototype)
  }
}

export default Unauthorized
