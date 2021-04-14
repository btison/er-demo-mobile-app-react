import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

export interface HealthPluginOptions {
}

const healthPlugin: FastifyPluginCallback<HealthPluginOptions> = (server, options, done) => {
  console.log('mounting health plugin');
  server.route({
    method: 'GET',
    url: '/health',
    handler: async () => {
      return {
        status: 'ok'
      };
    }
  });

  done();
};

export default fp(healthPlugin);
