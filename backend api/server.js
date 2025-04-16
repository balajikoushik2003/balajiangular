            const express = require('express');
            const bodyParser = require('body-parser');
            const cors = require('cors');
            const mysql = require('mysql2/promise');
            const multer = require('multer');
            const path = require('path');
            const fs = require('fs');
            const bcrypt = require('bcrypt');
            const jwt = require('jsonwebtoken');

            const app = express();
            const PORT = process.env.PORT || 3000;
            const uploadDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);    
            }
            const uploadsDirPath = path.join(__dirname, 'uploads'); 
            app.get('/uploads', async (req, res) => {
                try {
                    const files = fs.readdirSync(uploadsDirPath);
                    res.json({
                        files: files.map(file => ({
                            name: file,
                            url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
                        })),
                    });
                } catch (err) {
                    console.error('Error listing files:', err.message);
                    res.status(500).json({ error: 'Error listing files', details: err.message });
                }
            });
            app.get('/uploads/:filename', (req, res) => {
                const fileName = req.params.filename;
                const filePath = path.join(uploadsDirPath, fileName);

                if (!fs.existsSync(filePath)) {
                    return res.status(404).json({ error: 'File not found' });
                }
                res.download(filePath, fileName, err => {
                    if (err) {
                        console.error('Error downloading file:', err.message);
                        res.status(500).json({ error: 'Error downloading file', details: err.message });
                    }
                });
            });
            app.use(cors());
            app.use(bodyParser.json());
            app.use('/uploads', express.static(uploadDir));

            const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'Password@2',
            database: 'student',
            });
            function generateToken(user) {
                const payload = {
                    id: user.id,
                    email: user.Email
                };
                const secretKey = process.env.JWT_SECRET || 'your-strong-secret-key';
                const options = { expiresIn: '1h' };
                return jwt.sign(payload, secretKey, options);
            }
            const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
                },
            });
            const upload = multer({ storage });
            app.get('/', (req, res) => {                
                res.send('Welcome to the Students Management API');
            });
            app.get('/students', async (req, res) => {
                const connection = await pool.getConnection();
                try {
                    const [results] = await connection.query('SELECT * FROM students');
                    res.json(results);
                } catch (err) {
                    console.error('Error fetching students:', err.message);
                    res.status(500).json({ error: 'Error fetching students', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.get('/students/:studentid', async (req, res) => {
                const id = req.params.studentid;
                const connection = await pool.getConnection();
                try {
                    const [results] = await connection.query('SELECT * FROM students WHERE studentid = ?', [id]);
                    if (results.length === 0) {
                        return res.status(404).json({ error: 'Student not found' });
                    }
                    res.json(results[0]);
                } catch (err) {
                    console.error('Error fetching student:', err.message);
                    res.status(500).json({ error: 'Error fetching student', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.post('/students', upload.single('studentimage'), async (req, res) => {
                const { studentname, studentdept, studentAge, mobile, email, date } = req.body;
                const studentimage = req.file ? `/uploads/${req.file.filename}` : null;

                if (!studentname || !studentdept || !studentAge || !mobile || !email || !date) {
                    return res.status(400).json({ error: 'All fields are required' });
                }
                const connection = await pool.getConnection();
                try {
                    await connection.beginTransaction();
                    const query = `
                        INSERT INTO students (studentname, studentdept, studentAge, mobile, email, date, studentimage)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    const values = [studentname, studentdept, parseInt(studentAge, 10), mobile, email, date, studentimage];
                    const [result] = await connection.execute(query, values);
                    await connection.commit();
                    res.status(201).json({
                        studentid: result.insertId,
                        studentname,
                        studentdept,
                        studentAge,
                        mobile,
                        email,
                        date,
                        studentimage,
                    });
                } catch (err) {
                    await connection.rollback();
                    console.error('Error creating student:', err.message);
                    res.status(500).json({ error: 'Error creating student', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.delete('/students/:studentid', async (req, res) => {
                const id = req.params.studentid;
                const connection = await pool.getConnection();
                try {
                    const [result] = await connection.execute('DELETE FROM students WHERE studentid = ?', [id]);
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Student not found' });
                    }
                    res.json({ msg: 'Student deleted successfully' });
                } catch (err) {
                    console.error('Error deleting student:', err.message);
                    res.status(500).json({ error: 'Error deleting student', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.get('/', (req, res) => {
                res.send('Welcome to the Student Management API');
            });
            app.get('/students', async (req, res) => {
                const connection = await pool.getConnection();
                try {
                    const [results] = await connection.query('SELECT * FROM students');
                    res.json(results);
                } catch (err) {
                    console.error('Error fetching students:', err.message);
                    res.status(500).json({ error: 'Error fetching students', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.get('/students/:studentid', async (req, res) => {
                const id = req.params.studentid;
                const connection = await pool.getConnection();
                try {
                    const [results] = await connection.query('SELECT * FROM students WHERE studentid = ?', [id]);
                    if (results.length === 0) {
                        return res.status(404).json({ error: 'Student not found' });
                    }
                    res.json(results[0]);
                } catch (err) {
                    console.error('Error fetching student:', err.message);
                    res.status(500).json({ error: 'Error fetching student', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.post('/students', upload.single('studentimage'), async (req, res) => {
                const { studentname, studentdept, studentAge, mobile, email, date } = req.body;
                const studentimage = req.file ? `/uploads/${req.file.filename}` : null;

                if (!studentname || !studentdept || !studentAge || !mobile || !email || !date) {
                    return res.status(400).json({ error: 'All fields are required' });
                }
                const connection = await pool.getConnection();
                try {
                    await connection.beginTransaction();
                    const query = `
                        INSERT INTO students (studentname, studentdept, studentAge, mobile, email, date, studentimage)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    const values = [studentname, studentdept, parseInt(studentAge, 10), mobile, email, date, studentimage];
                    const [result] = await connection.execute(query, values);
                    await connection.commit();
                    res.status(201).json({
                        studentid: result.insertId,
                        studentname,
                        studentdept,
                        studentAge,
                        mobile,
                        email,
                        date,
                        studentimage,
                    });
                } catch (err) {
                    await connection.rollback();
                    console.error('Error creating student:', err.message);
                    res.status(500).json({ error: 'Error creating student', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.delete('/students/:studentid', async (req, res) => {
                const id = req.params.studentid;
                const connection = await pool.getConnection();
                try {
                    const [result] = await connection.execute('DELETE FROM students WHERE studentid = ?', [id]);
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Student not found' });
                    }
                    res.json({ msg: 'Student deleted successfully' });
                } catch (err) {
                    console.error('Error deleting student:', err.message);
                    res.status(500).json({ error: 'Error deleting student', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.get('/teachers', async (req, res) => {
                const connection = await pool.getConnection();
                try {
                    const [results] = await connection.query('SELECT * FROM teachers');
                    res.json(results);
                } catch (err) {
                    console.error('Error fetching teachers:', err.message);
                    res.status(500).json({ error: 'Error fetching teachers', details: err.message });
                } finally {     
                    connection.release();
                }
            });
            async function createTables() {
            const connection = await pool.getConnection();
            try {
                await connection.query(
                `CREATE TABLE IF NOT EXISTS students (
                    studentid INT AUTO_INCREMENT PRIMARY KEY,
                    studentname VARCHAR(255) NOT NULL,
                    studentdept VARCHAR(255) NOT NULL,
                    studentAge INT NOT NULL CHECK (studentAge BETWEEN 3 AND 16),
                    mobile VARCHAR(10) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    date DATE NOT NULL,
                    studentimage VARCHAR(255),
                    phone1 VARCHAR(10),
                    phone2 VARCHAR(10)
                )`
                );

                await connection.query(
                `CREATE TABLE IF NOT EXISTS login (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    Name VARCHAR(255) NOT NULL,
                    Email VARCHAR(255) NOT NULL UNIQUE,
                    Password VARCHAR(255) NOT NULL
                )`
                );
            } finally {
                connection.release();
            }}
            createTables();
            app.get('/', (req, res) => {
            res.send('Welcome to the Student Management API');
            });
            app.get('/login', (req, res) => {
            res.send('use this to get data : http://localhost:3000/users');
            });
            app.get('/students', async (req, res) => {
            const connection = await pool.getConnection();
            try {
                const [results] = await connection.query('SELECT * FROM students');
                res.json(results);
            } catch (err) {
                console.error('Error fetching students:', err.message);
                res.status(500).json({ error: 'Error fetching students', details: err.message });
            } finally {
                connection.release();
            }
            });
            app.get('/students-with-department', async (req, res) => {
                const connection = await pool.getConnection();
                try {
                    console.log('Calling stored procedure...');     
                    const [results] = await connection.query('CALL students1()');
                    console.log('Stored procedure results:', results);
                    res.json(results[0]); 
                } catch (err) {
                    console.error('Error fetching students with departments:', err.message);
                    res.status(500).json({ error: 'Error fetching students with departments', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.get('/students/:studentid', async (req, res) => {
            const id = req.params.studentid;
            const connection = await pool.getConnection();
            try {
                const [results] = await connection.query('SELECT * FROM students WHERE studentid = ?', [id]);
                if (results.length === 0) {
                return res.status(404).json({ error: 'Student not found' });
                }
                res.json(results[0]);
            } catch (err) {
                console.error('Error fetching student:', err.message);
                res.status(500).json({ error: 'Error fetching student', details: err.message });
            } finally {
                connection.release();
            }
            });
                    app.post('/students', upload.single('studentimage'), async (req, res) => {
                        const { studentname, studentdept, studentAge, mobile, email, date } = req.body;
                        const studentimage = req.file ? `/uploads/${req.file.filename}` : null;
                        if (!studentname || !studentdept || !studentAge || !mobile || !email || !date) {
                        return res.status(400).json({ error: 'All fields are required' });
                    }
                    if (!/^\d+$/.test(mobile)) {
                        return res.status(400).json({ error: 'Invalid mobile number' });
                    }
                    if (!/^\S+@\S+\.\S+$/.test(email)) {
                        return res.status(400).json({ error: 'Invalid email address' });
                    }
                    const connection = await pool.getConnection();
                    try {
                        await connection.beginTransaction();
                        const query = `
                            INSERT INTO students (studentname, studentdept, studentAge, mobile, email, date, studentimage)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;
                        const values = [
                            studentname,
                            studentdept,
                            parseInt(studentAge, 10),
                            mobile,
                            email,
                            date,
                            studentimage,
                        ];
                        const [result] = await connection.execute(query, values);
                        await connection.commit();
                        res.status(201).json({
                            studentid: result.insertId,
                            studentname,
                            studentdept,
                            studentAge,
                            mobile,
                            email,
                            date,
                            studentimage,
                        });
                    } catch (err) {
                        await connection.rollback();            
                        console.error('Error creating student:', err.message);
                        res.status(500).json({ error: 'Error creating student', details: err.message });
                    } finally {
                        connection.release();
                    }
                });
                app.put('/students/:studentid', upload.single('studentimage'), async (req, res) => {
                    const id = req.params.studentid;
                    const { studentname, studentdept, studentAge, mobile, email, date, phone1, phone2 } = req.body;
                    if (!studentname || !studentdept || !studentAge || !mobile || !email || !date) {
                        return res.status(400).json({ error: 'All required fields must be provided for update.' });
                    }
                
                    const studentimage = req.file ? `/uploads/${req.file.filename}` : null;
                
                        
                    const connection = await pool.getConnection();
                    try {
                        await connection.beginTransaction();
                        const query = `
                            UPDATE students
                            SET     
                                studentname = ?, 
                                studentdept = ?, 
                                studentAge = ?, 
                                mobile = ?, 
                                email = ?, 
                                date = ?, 
                                studentimage = ?, 
                                phone1 = ?, 
                                phone2 = ?
                            WHERE studentid = ?
                        `;
                        const values = [
                            studentname || null,
                            studentdept || null,
                            parseInt(studentAge, 10) || null,
                            mobile || null,
                            email || null,
                            date || null,
                            studentimage,
                            phone1 || null,
                            phone2 || null,
                            id
                        ];
                
                        const [result] = await connection.execute(query, values);
                
                        if (result.affectedRows === 0) {
                            return res.status(404).json({ error: 'Student not found' });
                        }
                
                        await connection.commit();
                        res.json({
                            msg: 'Student updated successfully',
                            updatedStudent: { 
                                studentid: id, studentname, studentdept, studentAge, 
                                mobile, email, date, studentimage, phone1, phone2 
                            }
                        });
                    } catch (err) {
                        await connection.rollback();
                        console.error('Error updating student:', err.message);
                        res.status(500).json({ error: err.message });
                    } finally {
                        connection.release();
                    }
                });
            
                    
            app.post('/login', async (req, res) => {
                const { email, password } = req.body;
            
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }
                const connection = await pool.getConnection();
                try {
                    const [results] = await connection.query('SELECT * FROM login WHERE Email = ?', [email]);
                    if (results.length > 0) {
                        const user = results[0];
            
                        if (user.Password === password) { 
                            const token = generateToken(user); 
                            res.status(200).json({ 
                                message: 'Welcome to students web', 
                                user: user,
                                token: token 
                            });
                        } else {
                            return res.status(401).json({ error: 'Invalid login' });
                        }
                    } else {
                        return res.status(401).json({ error: 'Invalid login' });
                    }
                } catch (err) {
                    console.error('Error during login:', err.message);
                    res.status(500).json({ error: 'Server error', details: err.message });
                } finally {
                    connection.release();
                }
            });

            app.post('/register', async (req, res) => { 
                const { name, email, password } = req.body;
                if (!name || !email || !password) {
                    return res.status(400).json({ error: 'All fields are required' });
                }

                const connection = await pool.getConnection();
                try {
                    const query = 'INSERT INTO login (Name, Email, Password) VALUES (?, ?, ?)';
                    const values = [name, email, password];
                    await connection.execute(query, values);
                    res.status(201).json({ message: 'Congratulations! Registration successful' });
                } catch (err) {
                    console.error('Error during registration:', err.message);
                    res.status(500).json({ error: 'Error registering user', details: err.message });
                } finally {
                    connection.release();
                }
            });
            app.get('/users', async (req, res) => {
            const connection = await pool.getConnection();
            try {
                const [results] = await connection.query('SELECT Name, Email, Password FROM login');
                res.json(results);
            } catch (err) {
                console.error('Error fetching users:', err.message);
                res.status(500).json({ error: 'Error fetching users', details: err.message });
            } finally {
                connection.release();
            }
            });
            app.delete('/students/:studentid', async (req, res) => {
            const id = req.params.studentid;
            const connection = await pool.getConnection();
            try {
                const [result] = await connection.execute('DELETE FROM students WHERE studentid = ?', [id]);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Student not found' });
                }
                res.json({ msg: 'Student deleted successfully' });
            } catch (err) {
                console.error('Error deleting student:', err.message);
                res.status(500).json({ error: 'Error deleting student', details: err.message });
            } finally {
                connection.release();
            }
            });
            app.listen(PORT, () => {        
            console.log(`Server running on http://localhost:3000/students`);
            console.log(`Server running on http://localhost:3000/users`);
            console.log(`Server running on http://localhost:3000/uploads`);
            console.log(`Server running on http://localhost:3000/teachers`);
            });     