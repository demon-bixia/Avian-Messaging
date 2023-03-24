export default {
  nodeEnv: (process.env.NODE_ENV ?? ''),
  port: (process.env.PORT ?? 0),
  cookieProps: {
    key: 'ExpressGeneratorTs',
    secret: (process.env.COOKIE_SECRET ?? ''),
    options: {
      httpOnly: true,
      signed: true,
      path: (process.env.COOKIE_PATH ?? ''),
      maxAge: Number(process.env.COOKIE_EXP ?? 0),
      domain: (process.env.COOKIE_DOMAIN ?? ''),
      secure: (process.env.SECURE_COOKIE === 'true'),
    },
  },
  jwt: {
    accessSecret: (process.env.JWT_ACCESS_SECRET ?? ''),
    refreshSecret: (process.env.JWT_REFRESH_SECRET ?? ''),
    accessExp: (process.env.JWT_ACCESS_EXP ?? ''),
    refreshExp: (process.env.JWT_REFRESH_EXP ?? ''),
  },
  mongo: { connectionString: (process.env.MONGO_URI ?? '') },
  redis: { connectionString: (process.env.REDIS_URI ?? '') },
  graphql: { url: (process.env.GRAPHQL_URL ?? '') },
  cors: { origin: (process.env.ALLOW_ORIGIN ?? '') },
  oauth2: {
    clientId: (process.env.OAUTH2_CLIENT_ID ?? ''),
    clientSecret: (process.env.OAUTH2_CLIENT_SECRET ?? '')
  }
} as const;
