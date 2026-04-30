// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

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

pool.connect()
  .then(client => {
    console.log("✅ Connected to Supabase DB");
    client.release();
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
  });

module.exports = pool;