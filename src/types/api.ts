/** Decimal money/quantity. ALWAYS a string with 2 decimals. Never parsed to number. */
export type DecimalString = string;

/** ISO-8601 UTC with a trailing 'Z'. */
export type IsoUtcString = string;

export type Trend = 'UP' | 'DOWN' | 'FLAT';
export type RequestType = 'BUY' | 'SELL';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ChangeType = 'ABSOLUTE' | 'PERCENTAGE';

export interface Etf {
  id: number;
  name: string;
  logo_url: string | null;
  current_value: DecimalString;
  previous_value: DecimalString;
  last_change_amount: DecimalString;
  last_change_percentage: DecimalString;
  trend: Trend;
  updated_at: IsoUtcString;
  currency: string;
}

export interface HistoryPoint {
  id: number;
  etf_id: number;
  old_value: DecimalString;
  new_value: DecimalString;
  change_amount: DecimalString;
  change_percentage: DecimalString;
  change_type: ChangeType;
  input_value: DecimalString;
  created_at: IsoUtcString;
}

export interface TradeRequest {
  id: number;
  requester_name: string;
  requester_image_url: string;
  etf_id: number;
  etf_name: string;
  request_type: RequestType;
  units: DecimalString;
  etf_value_snapshot: DecimalString;
  total_value_snapshot: DecimalString;
  status: RequestStatus;
  currency: string;
  created_at: IsoUtcString;
  processed_at: IsoUtcString | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface AdminIdentity {
  id: number;
  username: string;
}

export interface ApiErrorEnvelope {
  error: { code: string; message: string; details?: unknown };
}
