import express from 'express';
import cors from 'cors';
import config from 'config';
import { routers } from './routes';
import cookieParser from 'cookie-parser';

const { name, version } = require('../package.json');

const app = express();
const port = process.env.PORT || 4000;
const corsConfig = config.get('cors') || {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsConfig));
app.use(routers);

app.listen(port, ()  => {
  console.log(`==`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🚩 Project: ${name} (ver. ${version})`);
  console.log(`⚙️  Cors config ${JSON.stringify(corsConfig, null, 2)}`);
  console.log(`==`);
});
