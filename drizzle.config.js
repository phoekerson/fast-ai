export default {
    dialect: 'postgresql',
    schema: 'utils/db/schema.ts',
    out: './drizzle',

    dbCredentials: {
        url:"postgresql://neondb_owner:7ydGOWMjZar8@ep-restless-pine-a588hmln.us-east-2.aws.neon.tech/FastAI?sslmode=require",
        connectString:"postgresql://neondb_owner:7ydGOWMjZar8@ep-restless-pine-a588hmln.us-east-2.aws.neon.tech/FastAI?sslmode=require"
    },

};