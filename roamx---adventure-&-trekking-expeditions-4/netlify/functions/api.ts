import serverless from 'serverless-http';
import { createExpressApp } from '../../server/app';

const app = createExpressApp();

// Netlify Function handler for serverless API routing
export const handler = serverless(app);
