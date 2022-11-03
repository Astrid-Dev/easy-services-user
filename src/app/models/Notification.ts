export interface Notification {
  id: number;
  user_id: number;
  reason: NotificationEnum,
  is_read: boolean,
  data: {
    state?: number,
    enquiry_code?: string,
  },
  created_at: string,
  updated_at: string
}

export enum NotificationEnum{
  USER_ENQUIRY = ('user-enquiry'),
  PROVIDER_REQUEST = ('provider-request')
}
