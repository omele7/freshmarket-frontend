/**
 * Environment configuration for FreshMarket application
 *
 * IMPORTANT: Make sure the backend services are running at these URLs:
 * - User Service (Auth): https://localhost:5001/api
 * - Product Service: https://localhost:5003/api
 * - Order & Cart Service: https://localhost:5002/api (SAME SERVICE)
 *
 * CORS must be configured in the backend to accept: https://localhost:4200
 */
export const environment = {
  production: false,
  productServiceUrl: 'https://localhost:5003/api',
  userServiceUrl: 'https://localhost:5001/api',
  orderServiceUrl: 'https://localhost:5002/api',
  cartServiceUrl: 'https://localhost:5002/api',
};
export const environmentProd = {
  production: true,
  productServiceUrl: 'https://api.freshmarket.com/api',
  userServiceUrl: 'https://api.freshmarket.com/api',
  orderServiceUrl: 'https://api.freshmarket.com/api',
};
