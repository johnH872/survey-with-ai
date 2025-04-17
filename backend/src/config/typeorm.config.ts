import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Survey } from '../surveys/entities/survey.entity';
import { CreateInitialSchema1710600000001 } from '../migrations/1710600000001-CreateInitialSchema';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'survey_db',
  entities: [User, Survey],
  migrations: [CreateInitialSchema1710600000001],
  synchronize: false,
}); 