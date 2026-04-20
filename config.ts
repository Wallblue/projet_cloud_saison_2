import dotenv from 'dotenv';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

dotenv.config();

export interface AppConfig {
  DATABASE_URL: string;
  AWS_REGION: string;
  S3_BUCKET_NAME: string;
}

async function loadConfig(): Promise<AppConfig> {
  if (process.env.DATABASE_URL) {
    return {
      DATABASE_URL: process.env.DATABASE_URL,
      AWS_REGION: process.env.AWS_REGION!,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME!,
    };
  }

  const client = new SecretsManagerClient({ region: 'eu-west-1' });
  const response = await client.send(new GetSecretValueCommand({
    SecretId: 'cloud-projet/config',
  }));
  return JSON.parse(response.SecretString!) as AppConfig;
}

export default loadConfig();
