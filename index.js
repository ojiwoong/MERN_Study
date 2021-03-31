const express = require('express');
const app = express();
const port = 5000;
const config = require('./config/key');

const { User } = require('./models/User');

// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// applicatoin/json
app.use(express.json());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.send('Hello World 안녕하세요. TEST'));

app.post('/register', (req, res) => {
  console.log(`요청값 : ${JSON.stringify(req.body)}`);
  const user = new User(req.body);
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
