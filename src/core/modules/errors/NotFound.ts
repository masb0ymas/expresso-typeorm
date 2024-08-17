import BaseResponse from './BaseResponse'

class NotFound extends BaseResponse {
  constructor(message: string) {
    super(message, 'Not Found', 404)
    Object.setPrototypeOf(this, NotFound.prototype)
  }
}

export default NotFound
