import express from 'express';

const healthcheckRouter = express.Router();

healthcheckRouter.get('/', (req, res) => {
  res.send('Healthcheck is OK');
});

export { healthcheckRouter };