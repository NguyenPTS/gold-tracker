export const API_CONFIG = {
  // baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://14.225.205.200:2238',
  endpoints: {
    goldPrices: {
      latest: '/gold/prices/latest',
      history: '/gold/prices/history',
      byType: (type: string) => `/gold/prices/type/${type}`,
    },
    assets: {
      list: '/assets',
      create: '/assets',
      update: (id: string) => `/assets/${id}`,
      delete: (id: string) => `/assets/${id}`,
    },
    

    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      profile: '/auth/profile',
      google: '/auth/google',
      googleCallback: '/auth/google/callback',
    },
  },
} as const; 
/////