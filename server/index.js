const express = require('express');
const app = express();
const port = 5000;
const config = require('./config/key');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// applicatoin/json
app.use(express.json());

app.use(cookieParser());

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

app.post('/api/user/register', (req, res) => {
  console.log(`요청값 : ${JSON.stringify(req.body)}`);
  const user = new User(req.body);
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post('/api/users/login', (req, res) => {
  // 요청된 이메일이 데이터 베이스 있는지 체크
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSucess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    }
    // 요청된 이메일이 데이터 베이스에 있다면 비밀번호 체크
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSucess: false,
          message: '비밀번호가 틀렸습니다.',
        });

      // 비밀번호가 맞다면 토큰을 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. (cookie), localstorege)
        res
          .cookie('x_auth', user.token)
          .status(200)
          .json({ loginSucess: true, userId: user._id });
      });
    });
  });
});

app.post('/api/users/auth', auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
