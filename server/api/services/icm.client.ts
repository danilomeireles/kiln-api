import fetch from 'node-fetch';
import L from '../../common/logger';
import * as process from 'node:process';

interface ICMApiResponse {
  ok: boolean;
  status: number;
  json(): Promise<any>;
}

export class ICMClient {
  async saveICMData(payload: any): Promise<ICMApiResponse> {
    try {
      const url = process.env.COMM_API_SAVEDATA_ICM_ENDPOINT_URL;

      if (!url) {
        throw new Error(
          'COMM_API_SAVEDATA_ICM_ENDPOINT_URL environment variable is required'
        );
      }

      L.info(`Making POST request to: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: process.env.COMM_API_TIMEOUT
          ? parseInt(process.env.COMM_API_TIMEOUT, 10)
          : 30000,
      } as any);

      return {
        ok: response.ok,
        status: response.status,
        json: () => response.json(),
      };
    } catch (error) {
      L.error('ICMClient saveICMData request failed:', error);
      throw error;
    }
  }
}
