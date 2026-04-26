export interface Item {
  id: number;
  name: string;
  quantity: number;
  location_id: number | null;
  purchase_price: number | null;
  currency_id: number;
  purchase_date: string | null;
  freeText: string | null;
}

export interface Location {
  id: number;
  name: string;
  parent_id: number | null;
  description: string | null;
}

export interface LocationNode extends Location {
  children: LocationNode[];
}

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}
