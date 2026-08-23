import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.string(),
      tags: z.array(z.string()),
      featured: z.boolean().default(false),
      author: z.string().default('Alex.Hsiao'),
      readTime: z.string().default('5 min read'),
      heroImage: z.union([image(), z.string()]).optional(),
      banner: z.union([image(), z.string()]).optional(),
    }),
});

export const collections = { blog };
