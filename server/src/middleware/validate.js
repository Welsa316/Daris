import { ZodError } from 'zod';
import { t, getLang } from '../utils/i18n.js';

/**
 * Validation middleware factory using Zod schemas
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const lang = getLang(req);

    try {
      const data = schema.parse(req[source]);
      req[source] = data; // Replace with validated + sanitized data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        return res.status(400).json({
          error: t('error.validation', lang),
          details: errors,
        });
      }
      return res.status(400).json({ error: t('error.validation', lang) });
    }
  };
}
