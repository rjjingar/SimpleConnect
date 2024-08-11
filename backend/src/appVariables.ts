import dotenv from 'dotenv'; 

dotenv.config();  // Load environment variables from .env file 

if (!process.env.JWT_SCRET_KEY) {
    process.exit(1);
}

if (!process.env.PORT) {
    process.exit(1);
}

export const APP_PORT: number = parseInt(process.env.PORT, 10);
export const JWT_SECRET_KEY = process.env.JWT_SCRET_KEY;