import { apiGet, apiPatchJson, apiPostJson, apiPostForm } from './client';
import { RequestStatus, TradeRequest, Etf } from '../types/api';

export function updateEtfName(id: number | string, name: string): Promise<Etf> {
  return apiPatchJson<Etf>(`/api/admin/etfs/${id}`, { name }, true);
}

export function setEtfValue(id: number | string, value: string): Promise<Etf> {
  return apiPostJson<Etf>(`/api/admin/etfs/${id}/value`, { value }, true);
}

export function adjustEtfValue(id: number | string, percentage: string): Promise<Etf> {
  return apiPostJson<Etf>(`/api/admin/etfs/${id}/adjust`, { percentage }, true);
}

export function uploadEtfLogo(id: number | string, file: File): Promise<Etf> {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostForm<Etf>(`/api/admin/etfs/${id}/logo`, formData, true);
}

export interface RequestFilters {
  status?: RequestStatus | 'All';
  request_type?: string | 'All';
  etf_id?: number | string | 'All';
  limit?: number;
  offset?: number;
}

export function listRequests(filters: RequestFilters = {}): Promise<TradeRequest[]> {
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.request_type && filters.request_type !== 'All') params.append('request_type', filters.request_type);
  if (filters.etf_id && filters.etf_id !== 'All') params.append('etf_id', filters.etf_id.toString());
  
  params.append('limit', (filters.limit ?? 100).toString());
  if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

  return apiGet<TradeRequest[]>(`/api/admin/requests?${params.toString()}`, true);
}

export function getRequest(id: number | string): Promise<TradeRequest> {
  return apiGet<TradeRequest>(`/api/admin/requests/${id}`, true);
}

export function setRequestStatus(id: number | string, status: RequestStatus): Promise<TradeRequest> {
  return apiPatchJson<TradeRequest>(`/api/admin/requests/${id}/status`, { status }, true);
}
