export type AuthUser = { id: string; email: string; displayName: string };
export type AccessPayload = {
  sub: string;
  email: string;
  sid: string;
  type: 'access';
};
export type RequestMeta = { userAgent?: string; ipAddress?: string };
