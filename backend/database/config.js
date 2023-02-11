const Pool=require('pg').Pool;

const pool=new Pool({
    user:       "postgres",
    host:       "localhost",
    database:   "ecommerce",
    password:   "Shubh",
    port:       5432,
})

module.exports=pool;