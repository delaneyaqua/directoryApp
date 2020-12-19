CREATE TABLE member (
  last_name varchar(30) NOT NULL,
  first_name varchar(30) NOT NULL,
  email_address varchar(75) NOT NULL,
  _position varchar(60) NOT NULL,
  town varchar(40) NOT NULL,
  checked tinyint(1) NOT NULL,
  id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
);

INSERT INTO member (last_name,first_name,email_address,_position,town,checked) VALUES
('Downing', 'Delaney', 'delaney.downing@email.com', 'developer', 'CA', 0);
