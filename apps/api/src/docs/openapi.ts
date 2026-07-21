import { z } from 'zod';

import { pathEntries, schemaRegistry, type SchemaName } from '#docs/paths';

const RESPONSE_DESCRIPTIONS: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Validation error',
  401: 'Missing or invalid access token',
  403: 'Forbidden — not the resource owner',
  404: 'Not found',
  409: 'Conflict',
  422: 'Rejected by guardrail',
  502: 'Upstream AI provider error',
};

function toSchemaObject(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, { io: 'input' });
}

const errorSchema = z.object({
  error: z.object({ message: z.string(), code: z.string(), details: z.unknown().optional() }),
});

const dataEnvelopeSchema = z.object({
  data: z.unknown(),
  meta: z.object({ total: z.number(), page: z.number(), pages: z.number() }).optional(),
});

const componentSchemas: Record<string, unknown> = {
  ErrorResponse: toSchemaObject(errorSchema),
  DataEnvelope: toSchemaObject(dataEnvelopeSchema),
};
for (const [name, schema] of Object.entries(schemaRegistry)) {
  componentSchemas[name] = toSchemaObject(schema);
}

function buildResponses(codes: number[]): Record<string, unknown> {
  const responses: Record<string, unknown> = {};
  for (const code of codes) {
    const isSuccess = code < 300;
    responses[String(code)] = {
      description: RESPONSE_DESCRIPTIONS[code] ?? 'Response',
      ...(code === 204
        ? {}
        : {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${isSuccess ? 'DataEnvelope' : 'ErrorResponse'}` },
            },
          },
        }),
    };
  }
  return responses;
}

function queryParameters(name: SchemaName): unknown[] {
  const schema = schemaRegistry[name];
  if (!(schema instanceof z.ZodObject)) return [];

  return Object.entries(schema.shape).map(([key, field]) => ({
    name: key,
    in: 'query',
    required: !(field as z.ZodType).isOptional(),
    schema: toSchemaObject(field as z.ZodType),
  }));
}

const paths: Record<string, Record<string, unknown>> = {};

for (const entry of pathEntries) {
  const pathItem = paths[entry.path] ??= {};

  const parameters: unknown[] = [
    ...(entry.params ?? []).map((name) => ({
      name,
      in: 'path',
      required: true,
      schema: { type: 'string' },
    })),
    ...(entry.query ? queryParameters(entry.query) : []),
  ];

  pathItem[entry.method] = {
    summary: entry.summary,
    tags: entry.tags,
    ...(entry.auth ? { security: [{ bearerAuth: [] }] } : {}),
    ...(parameters.length ? { parameters } : {}),
    ...(entry.body
      ? {
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: `#/components/schemas/${entry.body}` } } },
        },
      }
      : {}),
    responses: buildResponses(entry.responses),
  };
}

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'DevPraxis API',
    version: '0.1.0',
    description:
      'Knowledge hub for tech-interview preparation — articles, topics, favorites, Notion import, and an AI assistant grounded in the knowledge base.',
  },
  servers: [{ url: 'http://localhost:3000/api' }],
  tags: [{ name: 'Auth' }, { name: 'Topics' }, { name: 'Articles' }, { name: 'AI' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: componentSchemas,
  },
  paths,
};
