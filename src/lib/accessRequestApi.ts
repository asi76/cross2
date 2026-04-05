const ACCESS_REQUEST_ENDPOINT = '/api/access-request-email';

export interface AccessRequestNotificationPayload {
  email: string;
  name?: string;
  message: string;
}

export const notifyAdminOfAccessRequest = async (payload: AccessRequestNotificationPayload): Promise<void> => {
  const response = await fetch(ACCESS_REQUEST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Email delivery failed');
  }
};
