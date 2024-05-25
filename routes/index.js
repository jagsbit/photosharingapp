var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const userModel = require("../models/user");
const postModel=require("../models/post")
const upload=require("./multer");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{msg:req.flash("msg1")});
});
router.get('/feed',isLoggedin,async function(req, res, next) {
  let posts= await postModel.find();
  let user= await userModel.findOne({email: req.user.email});
  
  res.render('feed',{posts,user});
});
router.get('/login', function(req, res, next) {
  res.render('login',{msg:req.flash("msg")});
});
router.post('/register', async function(req, res, next) {
  let { name, email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    msg1 = "User already exists";
    req.flash("msg1","User already exists");
    return res.status(500).redirect("/");
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        name,
        email,
        password: hash
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhh");
      res.cookie("token", token);
      res.redirect('/feed');
    });
  });
});
router.post('/login', async function(req, res, next) {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });

  if (!user) {
    msg = "Enter correct email or password";
    req.flash("msg","Enter correct email or password");
    return res.status(500).redirect("/login");
  }

  bcrypt.compare(password, user.password, function(err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhh");
      res.cookie("token", token);
      res.status(200).redirect('/feed');
    } else {
      msg = "Enter correct email or password";
      req.flash("msg","Enter correct email or password");

      return res.status(500).redirect("/login");
    }
  });
});
router.get('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.setHeader('Cache-Control', 'no-store'); // Clear browser cache
  res.redirect('/login');
});
router.get('/profile',isLoggedin,async (req,res)=>{
    let user= await userModel.findOne({email: req.user.email}).populate('boards');
    res.render('profile',{user});
});
// edit profile
router.get('/editprofile/:uid',isLoggedin,async(req,res)=>{
      let user=await userModel.findOne({email: req.user.email});
      res.render('editprofile',{user});
})
router.post('/editprofile/:uid',isLoggedin,upload.single("file"),async(req,res)=>{
  
  if (!req.file) {
      console.log("No file Chosen")
      let{name,email,bio}=req.body;
      let user = await userModel.findOneAndUpdate({email: req.user.email}, { name,email,bio});
      return res.redirect('/profile');
  }
  
  let{name,email,bio}=req.body;
  let user = await userModel.findOneAndUpdate({email: req.user.email}, { name,email,bio,profileImage:req.file.filename });
  res.redirect('/profile');
  
})

router.get('/createpost',isLoggedin,async (req,res)=>{
  let user= await userModel.findOne({email: req.user.email}).populate("posts");
  
  res.render('create',{user});
})
router.get('/delete/:pid',isLoggedin,async (req,res)=>{
  let user= await userModel.findOne({email: req.user.email});
  let post = await postModel.findOneAndDelete({ _id: req.params.pid });
  let ind=user.posts.indexOf(req.params.pid);
  console.log(ind);
  user.posts.splice(ind,1);
  await user.save();
  res.redirect('/createpost');
})
router.post('/upload',isLoggedin,upload.single('file'), async (req, res) => {
  console.log('Received request:', req.body);
  console.log('File:', req.file);
  if (!req.file) {
      return res.status(404).send("No file chosen");
  }
  const user= await userModel.findOne({email: req.user.email});
  let post=await postModel.create({
    image:req.file.filename,
    desc:req.body.desc,
    user:user._id
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/createpost');
});
router.get('/like/:postId', isLoggedin, async (req, res) => {
  try {
    const userId = req.user.userid; // Use the correct property
    const postId = req.params.postId;

    console.log(`User ID: ${userId}`);
    console.log(`Post ID: ${postId}`);

    // Find the post by ID
    let post = await postModel.findById(postId);

    if (!post) {
      console.log('Post not found');
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    let liked = false;
    if (post.likes.includes(userId)) {
      console.log('User has already liked the post');
      // Remove the user's ID from the likes array (unlike)
      post.likes.splice(post.likes.indexOf(userId), 1);
    } else {
      // Add the user's ID to the likes array (like)
      post.likes.push(userId);
      liked = true;
    }

    // Save the updated post
    await post.save();

    console.log('Like/unlike action completed successfully');
    res.status(200).json({ liked, likesCount: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/show/:pid',isLoggedin,async (req,res)=>{
     let post=await postModel.findOne({_id : req.params.pid});
     let user=await userModel.findOne({_id: post.user});
     console.log(user.name)
     res.render('show',{post,user});
})
router.get('/download/:filename',isLoggedin,(req, res) => {
  const filename = req.params.filename;
  const file = path.join(__dirname, 'public/images/uploads', filename);

  res.download(file, filename, (err) => {
      if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading file');
      }
  });
});
router.get('/save/:pid',isLoggedin,async (req,res)=>{
     const user= await userModel.findOne({email: req.user.email});
     let post=await postModel.findOne({_id : req.params.pid});
     if (user.boards.includes(post._id)) {
      console.log('already saved');
      // Remove the user's ID from the likes array (unlike)
    
    } else {
      // Add the user's ID to the likes array (like)
      user.boards.push(post._id);
      console.log('saved');
    }
     await user.save();
    
     res.render('show',{user,post});
})
router.get('/deleteboard/:bid',isLoggedin,async (req,res)=>{
  const user= await userModel.findOne({email: req.user.email});
  user.boards.splice(user.boards.indexOf(req.params.bid), 1);
  await user.save();
  res.redirect('/profile');
})
router.get('/showshave/:bid',isLoggedin,async (req,res)=>{
  let post=await postModel.findOne({_id : req.params.bid});
  let user=await userModel.findOne({_id: post.user});
  console.log(user.name)
  res.render('showshave',{post,user});
})
function isLoggedin(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    let data = jwt.verify(token, 'shhhhh');
    req.user = data;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.redirect('/login');
  }
}


module.exports = router;
