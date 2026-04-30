// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,

//   ssl: {
//     rejectUnauthorized: false, // required for Supabase
//   },
// });

// // Optional: test connection on startup
// pool.connect()
//   .then(client => {
//     console.log("✅ Connected to Supabase DB");
//     client.release();
//   })
//   .catch(err => {
//     console.error("❌ DB Connection Error:", err.message);
//   });

// module.exports = pool;

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
});

// 👇 IMPORTANT: force SSL globally (fix for Render + Supabase)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Test connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to Supabase DB");
    client.release();
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
  });

module.exports = pool;