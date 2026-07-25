const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'eu-west-1',
  'eu-west-2',
  'us-east-2'
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Testing region ${region} (${host})...`);
  
  const client = new Client({
    user: 'postgres.qexrwqwdwqkhoddqkufi',
    host: host,
    database: 'postgres',
    password: 'zJcQ9GDJr6JV70ei',
    port: 6543,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected to ${region}!`);
    const res = await client.query('SELECT NOW()');
    console.log(`Database time: ${res.rows[0].now}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED for ${region}: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      console.log(`Found working region: ${region}`);
      process.exit(0);
    }
  }
  console.log("No pooler region worked.");
  process.exit(1);
}

run();
