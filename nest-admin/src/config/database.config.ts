import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/nest_admin',
}));
