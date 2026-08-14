import { apiGet } from './client';
import { Etf, HistoryPoint } from '../types/api';

export function getEtfs(): Promise<Etf[]> {
  return apiGet<Etf[]>('/api/etfs');
}

export function getEtf(id: number | string): Promise<Etf> {
  return apiGet<Etf>(`/api/etfs/${id}`);
}

export function getEtfHistory(id: number | string, limit = 200): Promise<HistoryPoint[]> {
  return apiGet<HistoryPoint[]>(`/api/etfs/${id}/history?limit=${limit}`);
}
