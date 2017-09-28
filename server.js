var express = require("express"),
  passport = require("passport"),
  morgan = require("morgan"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  session = require("express-session"),
  axios = require("axios"),
  InstagramStrategy = require("passport-instagram").Strategy;

var INSTAGRAM_CLIENT_ID = "3c88a712383249c4909699e213a37b34";
var INSTAGRAM_CLIENT_SECRET = "e32f8155b47e45ccb372e71daadfe35e";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new InstagramStrategy(
    {
      clientID: INSTAGRAM_CLIENT_ID,
      clientSecret: INSTAGRAM_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/instagram/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      //store media in db
      const userId = profile.id;

      axios
        .get(
          "https://api.instagram.com/v1/users/" +
            userId +
            "/media/recent/?access_token=" +
            accessToken +
            ""
        )
        .then(function(response) {
          const imageArr = [];
          console.log(response);
          for (var key in response) {
            var item = response[key].data;
          }

          item.forEach(function(elem) {
            imageArr.push(elem.images.low_resolution.url);
          });

          console.log("HEEEEEEEEEJ");
        })
        .catch(function(error) {
          console.log(error);
        });

      process.nextTick(function() {
        return done(null, profile);
      });
    }
  )
);

var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(morgan("combined"));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(methodOverride());
app.use(
  session({
    saveUninitialized: true,
    resave: true,
    secret: "secret"
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.render("index", { user: req.user });
});

app.get("/profile", ensureAuthenticated, function(req, res) {
  res.render("profile", {
    user: req.user
  });
});

app.get("/login", function(req, res) {
  res.render("login", { user: req.user });
});

app.get("/auth/instagram", passport.authenticate("instagram"), function(
  req,
  res
) {});

app.get(
  "/auth/instagram/callback",
  passport.authenticate("instagram", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("http://instagram.com/accounts/logout/");
});

var port = 3000;

app.listen(port, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info(
      "==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.",
      port,
      port
    );
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
