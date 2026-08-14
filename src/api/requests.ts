import { apiPostForm } from './client';
import { RequestType, TradeRequest } from '../types/api';

export interface TradeRequestInput {
  requesterName: string;
  etfId: number;
  requestType: RequestType;
  units: string;
  image: File;
}

export function submitTradeRequest(input: TradeRequestInput): Promise<TradeRequest> {
  const formData = new FormData();
  formData.append('requester_name', input.requesterName);
  formData.append('etf_id', input.etfId.toString());
  formData.append('request_type', input.requestType);
  formData.append('units', input.units);
  formData.append('requester_image', input.image);

  return apiPostForm<TradeRequest>('/api/requests', formData, false);
}
