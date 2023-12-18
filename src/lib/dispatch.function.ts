import axios, { AxiosResponse } from 'axios';

export const dispatch = <T>(event: string, data: Record<string, any>): Promise<AxiosResponse<T>> => {
   return axios({ url: `/${event}`, method: 'POST', data });
  }
