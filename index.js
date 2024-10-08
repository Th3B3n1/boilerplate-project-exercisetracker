import express from 'express';
import cors from 'cors';
import 'dotenv';
import bodyParser from 'body-parser';
import crypto from 'crypto';

const app = express();
const jsonParser = bodyParser.urlencoded({extended: false});

let users = new Array();
let exercises = new Array();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/users", function (req, res)
{
  if (users.length > 0)
  {
    res.json(users);
  }
  else
  {
    res.json({error: "There is no user in the database."});
  }
})

app.get("/api/users/:_id/logs", function (req, res)
{
  if (req.params._id != undefined)
  {
    if (exercises.some(e => e._id == req.params._id))
    {
      let allExercise = exercises.filter(e => e._id == req.params._id);
      let logs = new Array();
      for (let i = 0; i < allExercise.length; i++)
      {
        logs.push({description: allExercise[i].description, duration: parseInt(allExercise[i].duration), date: allExercise[i].date});
      }
      if (req.query != undefined)
      {
        if (req.query.to != undefined && req.query.from != undefined)
        {
          logs = logs.filter(e => new Date(e.date) >= new Date(req.query.from) && new Date(e.date) <= new Date(req.query.to));
        }
        if (req.query.limit != undefined)
        {
          logs = logs.slice(0, req.query.limit);
        }
      }
      res.json({username: allExercise[0].username, count: logs.length, _id: allExercise[0]._id, log: logs});
    }
    else
    {
      res.json({error: "No user is assigned to this id"});
    }
  }
})

app.post("/api/users", jsonParser, function (req, res) 
{
  if (req.body.username != undefined && req.body.username != "")
  {
    let user = {_id: crypto.randomBytes(20).toString('hex'), username: req.body.username};
    users.push(user);
    res.json(user);
  }
  else
  {
    res.json({error: "Invalid username"});
  }
})

app.post("/api/users/:_id/exercises", jsonParser, function (req, res)
{
  if (req.params._id != undefined)
  {
    if (users.some(e => e._id == req.params._id))
    {
      if (req.body != undefined)
      {
        if ((req.body.description != undefined && req.body.description != "") && (req.body.duration != undefined && !isNaN(parseInt(req.body.duration))))
        {
          let id = users.findIndex(e => e._id == req.params._id);
          let exercise = {username: users[id].username, description: req.body.description, duration: parseInt(req.body.duration), date: req.body.date == "" || req.body.date == " " || req.body.date == undefined ? new Date().toDateString() : new Date(req.body.date).toDateString(), _id: users[id]._id};
          exercises.push(exercise);
          res.json(exercise);
        }
        else
        {
          res.json({error: "Mandatory fields are invalid"});
        }
      }
      else
      {
        res.json({error: "No field given"});
      }
    }
    else
    {
      res.json({error: "No user is assigned to this id"});
    }
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
