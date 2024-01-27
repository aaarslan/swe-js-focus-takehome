import z from "zod";

const schema = z.object({
  API_URL: z.string(),
  APPLICATION_PORT: z.number(),
  IS_CHINA: z.boolean().default(false),
});

export const env = schema.parse({
  API_URL: process.env.API_URL,
  APPLICATION_PORT: parseInt(process.env.APPLICATION_PORT as string, 10),
  IS_CHINA: process.env.IS_CHINA === "true",
});

console.log(env);
