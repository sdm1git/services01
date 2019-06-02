var data_json=[]
//console.log(data_json)
//data_json = []
const pg = require('pg')

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'postgres', // env var: PGUSER
  database: 'postgres', // env var: PGDATABASE
  password: 'secretpass', // env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, // env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 3000 // how long a client is allowed to remain idle before being closed
}

const receiver_id = 5 // идентификатор экземпляра сервиса
const pool = new pg.Pool(config)
/*var query1 = {
    text:'INSERT INTO que1 (batch,portion,portion_data) values ($1,$2,$3)',
    rowMode:'array',
    types:{getTypeParser:() => (val) => val}
}*/
async function qselect (q) {
  const client = await pool.connect()
  let res
  let res1
  try {
    //await client.query('BEGIN')
    try {
      res = await client.query(q)
      //await client.query('COMMIT')
    } catch (err) {
      //await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res//[res,res1]
}

async function qupdate (q) {
    const client = await pool.connect()
    let res
    try {
        await client.query('BEGIN')
        try {
            res = await client.query(q)
            await client.query('COMMIT')
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        }
    } finally {
        client.release()
    }
    return res
}

async function readrec () {
  try {
    let batch_row
    let temp_arr
    const { rows } = await qselect({text:'SELECT batch,portions from send_log where sended = true and received = false'})
    //console.log(rows) 
    for (item1 of rows){
        batch_row =  await qselect({text:'SELECT portion,portion_data from que1 where batch=$1',values:[item1.batch]})
       //console.log(batch_row['rows'])//[0]['portion']+'-'+batch_row['rows'][0]['portion_data'])//.rows.portion+'-'+batch_row.rows.portion_data)
        temp_arr = []
        for(item2 of batch_row['rows']){
           temp_arr = temp_arr.concat(JSON.parse(item2['portion_data']))
            //console.log(item1.batch+'-'+temp_arr)

       }
       //console.log(temp_arr)
       data_json[data_json.length]=temp_arr
       await qupdate({text:'UPDATE send_log SET received = true WHERE batch =$1 RETURNING id',values:[item1.batch]})
    }
    //console.log("-- -- -- -- -- --")
    console.log(data_json)
  } catch (err) {
    console.log('Database ' + err)
  }
}

readrec()



