const { pool } = require("../dbConfig");

const createUserTable = async () => {
  const client = await pool.connect();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY, 
        name VARHCAR(255) NOT NULL, 
        email VARCHAR(255) UNIQUE NOT NULL, 
        password VARCHAR(255) NOT NULL, 
        membership_type VARHCHAR(20) DEFAULT 'normal', 
        isVerified BOOLEAN DEFAULT FALSE,
        verification_token VARHCAR(50), 
        created_at TIMESTAMP DEFAULT NOW()
       );`
    );
    console.log("Created user table.");
  } catch (error) {
    console.log("🚀 ~ file: users.js:21 ~ error:", error);
  } finally {
    client.release();
  }
};

module.exports = {
  createUserTable,
};
