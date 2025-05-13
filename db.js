import mysql from 'mysql2/promise';

const DATABASE_HOST = process.env.DATABASE_HOST
const DATABASE_PORT = process.env.DATABASE_PORT
const DATABASE_NAME = process.env.DATABASE_NAME
const DATABASE_PASS = process.env.DATABASE_PASS
const DATABASE_USER = process.env.DATABASE_USER


console.log(DATABASE_NAME)

export const pool = mysql.createPool({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASS,
    port: Number(DATABASE_PORT) || 3306,
    database: DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});
