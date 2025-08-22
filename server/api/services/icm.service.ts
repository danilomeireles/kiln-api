import fetch from 'node-fetch';
import L from '../../common/logger';
import * as process from 'node:process';

interface SaveICMDataPayload {
  attachmentId: string;
  OfficeName: string;
  savedForm: any;
  token?: string;
  username?: string;
}

interface SaveICMDataRequest {
  attachmentId: string;
  OfficeName: string;
  username?: string;
  savedForm: any;
}

interface SaveICMDataResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export class ICMService {
  async saveICMData(
    data: SaveICMDataRequest,
    token?: string
  ): Promise<SaveICMDataResult> {
    try {
      const { attachmentId, OfficeName, username, savedForm } = data;

      if (!attachmentId || !OfficeName || !savedForm) {
        return {
          success: false,
          error:
            'Missing required fields: attachmentId, OfficeName, or savedForm',
          status: 400,
        };
      }

      const payload: SaveICMDataPayload = {
        attachmentId,
        OfficeName,
        savedForm,
      };

      // Add authentication info if provided
      if (token) {
        payload.token = token;
      } else if (username && username.length > 0) {
        payload.username = username;
      }

      const saveDataICMEndpoint =
        process.env.COMM_API_SAVEDATA_ICM_ENDPOINT_URL;

      if (!saveDataICMEndpoint) {
        return {
          success: false,
          error: 'CommunicationLayer API endpoint not configured',
          status: 500,
        };
      }

      // Call CommunicationLayer API
      const response = await fetch(saveDataICMEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        L.info('ICM Data saved successfully:', result);
        return {
          success: true,
          data: result,
        };
      } else {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errorMessage =
          errorData?.error || 'Error saving form. Please try again.';
        L.error('CommunicationLayer API Error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }
    } catch (error) {
      L.error('Error saving ICM data:', error);
      return {
        success: false,
        error: 'failed',
        status: 500,
      };
    }
  }
}

export default new ICMService();
