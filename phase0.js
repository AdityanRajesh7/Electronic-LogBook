const { Pool } = require('pg');
require('dotenv').config({ path: 'artifacts/api-server/.env' });
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Find Anil Kumar
  const users = await pool.query(`SELECT u.id, u.full_name, s.id as student_id FROM users u JOIN students s ON u.id = s.user_id WHERE u.role = 'student' AND u.full_name ILIKE '%Anil%'`);
  if (users.rows.length === 0) {
    console.log('No student named Anil Kumar found.');
  } else {
    for (const u of users.rows) {
      console.log('Found user:', u);
      const cases = await pool.query('SELECT count(*) FROM case_logs WHERE student_id = $1', [u.student_id]);
      const procedures = await pool.query('SELECT count(*) FROM procedure_logs WHERE student_id = $1', [u.student_id]);
      const academics = await pool.query('SELECT count(*) FROM academic_logs WHERE student_id = $1', [u.student_id]);
      console.log(`Logs for student_id ${u.student_id}: Cases: ${cases.rows[0].count}, Procedures: ${procedures.rows[0].count}, Academics: ${academics.rows[0].count}`);
    }
  }

  // Find Pediatrics department ID
  const depts = await pool.query(`SELECT id FROM departments WHERE code = 'PAED' LIMIT 1`);
  if (depts.rows.length > 0) {
    const deptId = depts.rows[0].id;
    
    // Check if Aravind P exists
    const aravind = await pool.query(`SELECT id FROM users WHERE email = 'aravind@elogbook.com'`);
    if (aravind.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      const resUser = await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role, status, department_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        ['Aravind P', 'aravind@elogbook.com', hash, 'student', 'approved', deptId]
      );
      const userId = resUser.rows[0].id;
      const regNo = 'PG2024-PAED-' + Math.floor(100 + Math.random() * 900);
      const joinDate = '2024-06-01';
      const kuhsId = 'KUHS-' + regNo;
      await pool.query(
        'INSERT INTO students (user_id, registration_number, batch, date_of_joining, kuhs_id, specialty) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, regNo, '2024', joinDate, kuhsId, 'Pediatrics']
      );
      console.log(`Created student Aravind P. Credentials: email: aravind@elogbook.com, password: password123. Registration: ${regNo}, Join Date: ${joinDate}`);
    } else {
      console.log('Aravind P already exists.');
    }
  }

  pool.end();
})();
