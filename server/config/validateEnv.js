// Environment variables validator
export const validateEnv = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT'
  ];

  const missingEnvVars = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    console.error('\x1b[31m%s\x1b[0m', missingEnvVars.join(', '));
    console.error('\x1b[33m%s\x1b[0m', 'Please check your .env file');
    return false;
  }

  return true;
};

export default validateEnv;