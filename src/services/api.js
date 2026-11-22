import { env } from '../config/env.js';
import { createApiClient } from './http.js';

export { ApiError } from './http.js';

export const api = createApiClient(env.apiBaseUrl);