import { Request, Response } from 'express';
import ICMService, { ICMData } from '../services/icm.service';
import fetch from 'node-fetch';

export class CommunicationsController {
  saveData(req: Request, res: Response): void {
    res.json({ endpoint: 'saveData', payload: req.body });
  }

  generateForm(req: Request, res: Response): void {
    res.json({ endpoint: 'generate', payload: req.body });
  }

  editFormData(req: Request, res: Response): void {
    res.json({ endpoint: 'edit', payload: req.body });
  }

  async saveICMData(req: Request, res: Response): Promise<void> {
    try {
      const { attachmentId, OfficeName, username, savedForm } = req.body;

      // Validate required fields
      if (!attachmentId || !OfficeName || !savedForm) {
        res.status(400).json({
          error:
            'Missing required fields: attachmentId, OfficeName, or savedForm',
        });
        return;
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      // TODO: Implement authentication/authorization when available
      // This should validate the token or username in the future

      // Prepare payload for CommunicationLayer API
      const payload: Record<string, any> = {
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

      // Get CommunicationLayer API endpoint from environment
      const saveDataICMEndpoint =
        process.env.COMM_API_SAVEDATA_ICM_ENDPOINT_URL;

      if (!saveDataICMEndpoint) {
        res.status(500).json({
          error: 'CommunicationLayer API endpoint not configured',
        });
        return;
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
        console.log('ICM Data saved successfully:', result);
        res.status(200).json({ message: 'success' });
      } else {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errorMessage =
          errorData?.error || 'Error saving form. Please try again.';
        console.error('CommunicationLayer API Error:', errorMessage);
        res.status(response.status).json({ error: errorMessage });
      }
    } catch (error) {
      console.error('Error saving ICM data:', error);
      res.status(500).json({ error: 'failed' });
    }
  }

  async saveICMData2(req: Request, res: Response): Promise<void> {
    const { caseId, payload } = req.body as Partial<ICMData>;
    const input: ICMData = { caseId: caseId, payload: payload };
    const record = await ICMService.saveICMData(input);
    res.json(record);
  }

  loadICMData(req: Request, res: Response): void {
    res.json({ endpoint: 'loadICMData', payload: req.body });
  }

  clearICMLockedFlag(req: Request, res: Response): void {
    res.json({ endpoint: 'clearICMLockedFlag', payload: req.body });
  }

  loadSavedJson(req: Request, res: Response): void {
    res.json({ endpoint: 'loadSavedJson', payload: req.body });
  }

  pdfRender(req: Request, res: Response): void {
    res.json({ endpoint: 'pdfRender', payload: req.body });
  }

  generatePDFFromJson(req: Request, res: Response): void {
    res.json({ endpoint: 'generatePDFFromJson', payload: req.body });
  }

  generateNewTemplate(req: Request, res: Response): void {
    res.json({ endpoint: 'generateNewTemplate', payload: req.body });
  }
}

export default new CommunicationsController();
