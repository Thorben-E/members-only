const { User, Message } = require('../db')

exports.main_get = async (req, res, next) => {
  try {
    let admin = false
    let member = false
    if (res.locals.currentUser) {
      if (res.locals.currentUser.member === true) {
        member = true
      } 
      if (res.locals.currentUser.admin === true) {
        admin = true
      }
    }
    const messages = await Message.find().sort([["timestamp", "descending"]]).populate("user");
    return res.render('index', { 
      messages: messages,
      admin: admin,
      member: member
    })
  } catch (err) {
    return next(err);
  }
};

exports.create_message_post = (req, res, next) => {
  let yourDate = new Date() 
  console.log(typeof yourDate.toISOString().split('T')[0], yourDate.toISOString().split('T')[0])
  new Message({
    title: req.body.title,
    message: req.body.message,
    timestamp: yourDate.toISOString().split('T')[0],
    user: res.locals.currentUser.username
  }).save((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
}

exports.membership_get = (req, res) => {
  res.render('membership')
}

exports.membership_post = (req, res, next) => {
  console.log(res.locals.currentUser)
  if (req.body.answer !== process.env.MEMBER_PW) {
    res.render('membership', { errMessage: "Wrong password"})
  } else {
    User.findByIdAndUpdate(res.locals.currentUser._id,{ $set:{ "member": true }}, {},
    function(err, result) {
      if (err) return next(err)
      res.redirect('/')
    })
  }
}

exports.deletemessage_delete = (req, res, next) => {
  Message.findByIdAndDelete(req.params.id)
    .then(() => res.redirect('/'))
}