import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: '127.0.0.1',      
  user: 'root',          
  password: 'wwe123',
  database: 'DBProductAPP',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});


//import mysql from 'mysql2/promise';

//export const pool = mysql.createPool({
  //host: '192.168.4.1',      
  //user: 'productapp',          
  //password: '123456produlab',
  //database: 'DBProductAPP',
  //port: 3306,
  //waitForConnections: true,
  //connectionLimit: 10,
//});