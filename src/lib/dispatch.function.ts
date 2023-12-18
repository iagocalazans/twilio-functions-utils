import axios, { type AxiosResponse } from 'axios'

export const dispatch = async <T>(event: string, data: Record<string, any>): Promise<AxiosResponse<T>> => {
  return await axios({ url: `/${event}`, method: 'POST', data })
}
