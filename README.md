## Description

A simple directory app that displays people. People can be added, deleted from, or have their information edited from the directory.


## Development Setup

1. Import directoryApp.sql into MySQL server. Find the following lines in your backend/app.js and modify as needed:

   ```js
   const connection = mysql.createConnection({
    host     : 'your_hostname',
    user     : 'your_username',
    password : 'your_password',
    database : 'your_database_name'
   });
   ```

2. Go to backend folder and do `npm install` to install all the dependencies listed in the package.json.
3. Go to frontend folder and do `npm install`.
4. Go to team-directory folder and do `npm install`.
5. Do `npm start`. The frontend app will start at localhost:3000 and the backend server will start at localhost:4000.

## Production Setup

1. Go to frontend folder and do `npm run build`.

## Known Isses/Bugs

* Submit button moves. To recreate issue, hit Submit while at least one section of the form is empty.