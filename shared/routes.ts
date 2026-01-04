import { z } from 'zod';
import { insertProfileSchema, insertInquirySchema, insertTourInquirySchema, insertProfileCommentSchema, profiles, inquiries, tourInquiries, profileComments } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  profiles: {
    list: {
      method: 'GET' as const,
      path: '/api/profiles',
      input: z.object({
        search: z.string().optional(),
        district: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof profiles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:id',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertProfileSchema,
      responses: {
        201: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  inquiries: {
    create: {
      method: 'POST' as const,
      path: '/api/inquiries',
      input: insertInquirySchema,
      responses: {
        201: z.custom<typeof inquiries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  tours: {
    create: {
      method: 'POST' as const,
      path: '/api/tours',
      input: insertTourInquirySchema,
      responses: {
        201: z.custom<typeof tourInquiries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  comments: {
    list: {
      method: 'GET' as const,
      path: '/api/profiles/:profileId/comments',
      responses: {
        200: z.array(z.custom<typeof profileComments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles/:profileId/comments',
      input: insertProfileCommentSchema,
      responses: {
        201: z.custom<typeof profileComments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type ProfileInput = z.infer<typeof api.profiles.create.input>;
export type InquiryInput = z.infer<typeof api.inquiries.create.input>;
export type TourInquiryInput = z.infer<typeof api.tours.create.input>;
export type ProfileCommentInput = z.infer<typeof api.comments.create.input>;
