
import pkg from 'pg';
const { Pool } = pkg;


export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'GOS-30081987',
    port: '5432',
});
