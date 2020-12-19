const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;  
const mysql = require('mysql');  

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'company'
});

connection.connect(err => {
	if (err) {
		console.error('Error connecting: ' + err.stack);
		return err;
	}
});

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
/*
app.get('/', (req, res) => {
	res.send('here')
});
*/
// read from database to load initial data
app.get('/data', (req, res) => {
	//res.json(member)
	connection.query('SELECT * FROM member', (err, results) => {
        if (!err) {
            //res.send(JSON.stringify(rows));
            return res.json({
            	data: results
            })
        } else {
            console.log('Error while performing Query.');
        }
    });
});

// add new members to database on Save
app.post('/new', function(req, res, next) {
    connection.query("INSERT INTO member (last_name,first_name,email_address,_position,town,checked) VALUES ('"+req.body.last_name+"','"+req.body.first_name+"','"+req.body.email_address+"','"+req.body._position+"','"+req.body.town+"',"+ 0 +")", function (error, results, fields) {
        if(error) { 
            console.error(req.body);
            throw error;
        }
        res.send(JSON.stringify(results));
    });
});

// update members in database on Save
app.post('/update', function(req, res, next) {
    connection.query("UPDATE member SET last_name = '"+req.body.last_name+"', first_name = '"+req.body.first_name+"', email_address = '"+req.body.email_address+"', _position = '"+req.body._position+"', town = '"+req.body.town+"' WHERE id = "+ req.body.id + "", function (error, results, fields) {
        if(error) throw error;
        res.send(JSON.stringify(results));
    });
});

// delete members on database on Save
app.post('/delete', function(req, res, next) {
    connection.query("DELETE FROM member WHERE id = "+req.body.id+"", function (error, results, fields) {
        if(error) throw error;
        res.send(JSON.stringify(results));
    });
});

app.listen(port, () => console.log(`Server started on port ${port}`));
