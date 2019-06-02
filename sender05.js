var data_json=[
    {name:"Donald J. Morgan",acct:"45698700000087001",a1:"Jackson street, 45"},
    [   {name:"1.Emmie Gonsalez",acct:"41234700000087001"},
        {name:"2.Airam Abdullah",acct:"41234700000987001"},
        {name:"3.Emmie Gonsalez",acct:"41234700000087002"},
        {name:"4.Emmie Gonsalez",acct:"41234700000087003"},
        {name:"5.Emmie Gonsalez",acct:"41234700000087004"},
        {name:"6.Emmie Gonsalez",acct:"41234700000087005"},
        {name:"7.Emmie Gonsalez",acct:"41234700000087006"},
        {name:"8.Emmie Gonsalez",acct:"41234700000087007"},
        {name:"9.Emmie Gonsalez",acct:"41234700000087008"},
        {name:"10.Emmie Gonsalez",acct:"41234700000087009"},
        {name:"11.Lockie Jackson",acct:"41434700000087001"}
    ],
    {name:"Sam Twicker",acct:"46234700000087001",b1:"4000.00"},
    {name:"Sanyo Pontcho",acct:"46234700000045001",b1:"41000.00"},
    {name:"Sam Twicker",acct:"46234700000087001",b1:"3000.00"},
    {name:"Sam Twicker",acct:"46234700000087001",b1:"2000.00"},
    {name:"John Bolton",acct:"4109800000087006",a1:"Bunker street, 5"}
]
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

const sender_id = 11
const osize = 3 //максимальный размер пакета
const pool = new pg.Pool(config)
/*var query1 = {
    text:'INSERT INTO que1 (batch,portion,portion_data) values ($1,$2,$3)',
    rowMode:'array',
    types:{getTypeParser:() => (val) => val}
}*/

async function qinsert (q,q1,noaddlog) {
  const client = await pool.connect()
  let res
  let res1
  try {
    await client.query('BEGIN')
    try {
      if (!noaddlog) {
          res1 = await client.query(q1)
      }
      res = await client.query(q)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res//[res,res1]
}

/*async function qgetbatch () {
    const client = await pool.connect()
    let res
    try {

        try {
            res = await client.query('SELECT max(batch) from send_log')
        } catch (err) {
            throw err
        }
    } finally {
        client.release()
    }
    return res
}*/

async function procrec (batch_data,batch_id) {
  try {
      //let batch_id = await (Date.now()*10000)

    const { rows } = await qinsert({text:'INSERT INTO que1 (batch,portion,portion_data) values ($1,$2,$3) RETURNING id',values:[batch_id,0,JSON.stringify(batch_data)]},
        {text:'INSERT INTO send_log (batch,portions,sender_id,sended,received) values ($1,$2,$3,$4,$5) RETURNING id',values:[batch_id,1,sender_id,1,0]})
    //console.log(rows[0].id) //console.log(JSON.stringify(rows)+' - index '+i+'. '+n+' json.length '+(Array.isArray(batch_data)?batch_data.length:0))
  } catch (err) {
    console.log('Database ' + err)
  }
}

async function procpack (portions,batch_data,batch_id,portion) {
    try {
    const { rows } = await qinsert({text:'INSERT INTO que1 (batch,portion,portion_data) values ($1,$2,$3) RETURNING id',values:[batch_id,portion,JSON.stringify(batch_data)]},
            {text:'INSERT INTO send_log (batch,portions,sender_id,sended,received) values ($1,$2,$3,$4,$5) RETURNING id',values:[batch_id,portions,sender_id,(batch_data.length<=osize),0]},portion!==1)
        //console.log(rows[0].id) //console.log(JSON.stringify(rows)+' - index '+i+'. '+n+' json.length '+(Array.isArray(batch_data)?batch_data.length:0))
    } catch (err) {
        console.log('Database ' + err)
    }
}


var batch_id = 1//(Date.now())
    for (let i=0;i<data_json.length;i++)  {
        if (!Array.isArray(data_json[i])){
            procrec([data_json[i]],batch_id);
        }
        else {
            let portions = Math.ceil(data_json[i].length / osize)
            for (let j = 0; j < portions ; j++) {
                procpack(portions,data_json[i].slice(j*osize,(j+1)*osize), batch_id,j+1)

            };
        }

        batch_id++;
    }






