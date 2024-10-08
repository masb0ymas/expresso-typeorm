import { type TOptions } from 'i18next'
import { i18n } from '~/config/i18n'
import { IReqOptions } from '~/core/interface/ReqOptions'

type DataResponseEntity<TData> = {
  message?: string
  statusCode?: number
} & TData

type DtoHttpResponse<TData> = {
  statusCode: number
  message: string
} & Omit<DataResponseEntity<TData>, 'message' | 'statusCode'>

class HttpResponse {
  /**
   * Base Response
   * @param dataResponse
   * @returns
   */
  private static baseResponse<TData>(
    dataResponse: DataResponseEntity<TData>
  ): DtoHttpResponse<TData> {
    const {
      message = 'data has been received',
      statusCode = 200,
      ...rest
    } = dataResponse

    return { statusCode, message, ...rest }
  }

  /**
   * Response Get or Sucess
   * @param dataResponse
   * @param options
   * @returns
   */
  public static get<TData>(
    dataResponse: DataResponseEntity<TData>,
    options?: IReqOptions
  ): DtoHttpResponse<TData> {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const message = i18n.t('success.data_received', i18nOpt)

    return this.baseResponse({ message, ...dataResponse })
  }

  /**
   * Response Failed or Error
   * @param dataResponse
   * @param options
   * @returns
   */
  public static error<TData>(
    dataResponse: DataResponseEntity<TData>,
    options?: IReqOptions
  ): DtoHttpResponse<TData> {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const message = i18n.t('errors.too_many_request', i18nOpt)

    return this.baseResponse({ message, ...dataResponse })
  }

  /**
   * Response Created
   * @param dataResponse
   * @param options
   * @returns
   */
  public static created<TData>(
    dataResponse: DataResponseEntity<TData>,
    options?: IReqOptions
  ): DtoHttpResponse<TData> {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const message = i18n.t('success.data_added', i18nOpt)

    return this.baseResponse({ statusCode: 201, message, ...dataResponse })
  }

  /**
   * Response Updated
   * @param dataResponse
   * @param options
   * @returns
   */
  public static updated<TData>(
    dataResponse: DataResponseEntity<TData>,
    options?: IReqOptions
  ): DtoHttpResponse<TData> {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const message = i18n.t('success.data_updated', i18nOpt)

    return this.baseResponse({ message, ...dataResponse })
  }

  /**
   * Response Deleted
   * @param dataResponse
   * @param options
   * @returns
   */
  public static deleted<TData>(
    dataResponse: DataResponseEntity<TData>,
    options?: IReqOptions
  ): DtoHttpResponse<TData> {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const message = i18n.t('success.data_deleted', i18nOpt)

    return this.baseResponse({ message, ...dataResponse })
  }
}

export default HttpResponse
