// API_URL priority:
//   1. API_URL env var (set at build time or dev time)
//   2. app.json extra.apiUrl (production EC2 URL baked in)
//   3. null → auto-detected at runtime in api.ts
const appJson = require("./app.json");
const apiUrl = process.env.API_URL || appJson.expo?.extra?.apiUrl || null;

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl,
    },
  },
};
