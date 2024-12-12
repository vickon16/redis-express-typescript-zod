import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as qs from "qs";

export async function ravenInstance<T = any>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T, any>> {
  return await axios({
    ...config,
    url: "https://integrations.getravenbank.com/v1" + config.url,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${process.env.RAVEN_LIVE_SECRET_KEY}`,
    },
    data: qs.stringify(config.data),
  });
}

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // To maintain a proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
