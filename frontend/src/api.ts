/*
 * Shared frontend tasks:
 * Htoo Myat Aung - profile API; Kyaw Zin Htike - ingredient/staff API;
 * Ei Thandar Kyaw - order API; Saw Keh Blu - chat API.
 */
import { firebaseAuth } from './firebase';
import type { CartItem } from './types';

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? 'https://scentify-backend-595105589462.asia-southeast1.run.app'
    : 'http://localhost:8080');

export interface ApiOrder {
  id: number;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentSlipUrl?: string;
  verifiedAt?: string;
  items: CartItem[];
  createdAt: string;
}

export interface ApiMessage {
  id: string;
  userId: string;
  senderId: string;
  senderRole: 'customer' | 'admin';
  message: string;
  createdAt: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data, error } = await firebaseAuth.auth.getSession();
  if (error) throw error;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(data.session?.access_token
        ? { Authorization: `Bearer ${data.session.access_token}` }
        : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error((await response.text()) || `Backend request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export const backendApi = {
  getProfile: () => request<{ id: string; displayName: string; shippingAddress: Record<string, string> }>('/api/profile'),
  getMyOrders: () => request<ApiOrder[]>('/api/orders/mine'),
  getOrders: () => request<ApiOrder[]>('/api/orders'),
  createOrder: (order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    total: number;
    paymentSlipUrl?: string;
    items: CartItem[];
  }) => request<ApiOrder>('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (id: number, status: string) =>
    request<ApiOrder>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  verifyOrderPayment: (id: number) =>
    request<ApiOrder>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus: 'verified' }),
    }),
  getChatMessages: () => request<ApiMessage[]>('/api/chat/messages'),
  sendChatMessage: (message: string) =>
    request<ApiMessage>('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getAdminChatMessages: () => request<ApiMessage[]>('/api/chat/admin/messages'),
  sendAdminChatMessage: (userId: string, message: string) =>
    request<ApiMessage>('/api/chat/admin/messages', {
      method: 'POST',
      body: JSON.stringify({ userId, message }),
    }),
  saveStaff: (staff: {
    action: 'create' | 'update' | 'disable';
    userId?: string;
    name: string;
    email: string;
    password: string;
    role: string;
    title: string;
    phone: string;
  }) => request<{ userId: string }>('/api/admin/staff', {
    method: 'POST',
    body: JSON.stringify(staff),
  }),
};
