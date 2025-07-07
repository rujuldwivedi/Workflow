import {User,Goal,Task,ColorPalette} from './Schemas.mjs';
import ColorPaletteList from './colorpalette.mjs';

import express from 'express';
import mongoose from 'mongoose';

import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function allotColor(userColorList)
{
    let count = ColorPaletteList.length;
    let i = 0;
    while(i < 1000)
    {
        let random = Math.floor(Math.random()* count);
        let color = ColorPaletteList[random];
        if(userColorList.length == 0 || userColorList.includes(color.colorName) == false)
        {
            return color;
        }
        else
        {
            ++i;
        }
    }
    return ColorPaletteList[0];
}

async function createDefault(req)
{
    let color = allotColor([]);

    const goalDef = await Goal.create({
        username: req.body.userName,
        goalName: "Goal 1",
        goalDuration: 1,
        goalStart:new Date(),
        goalEnd: Date(new Date().getTime() + 10*24*60*60*1000),
        successCrit: "Way to measure the performance of your goal",
        completed: "false",
        color : {main: color.main, border:color.border},
    });

    const taskDef = await Task.create({
        username: req.body.userName,
        goalName: "Goal 1",
        color : {main: color.main, border:color.border},
        taskName: "Task 1",
        taskDuration: 1,
        taskPriorty: "Med",
        taskStart:new Date(),
        taskEnd: Date(new Date().getTime + 5*24*60*60*1000),
        subTaskList: [{
            subTaskName: "Subtask 1",
        est: 2,
        completed: "false",
        },{
            subTaskName: "Subtask 2",
        est: 4,
        completed: "true",
        }],
        completed:"false",
    });

    // console.log(req.body);
    const newUser = new User(req.body);
    newUser.goalList = [];
    newUser.goalList.push(await goalDef._id);
    newUser.taskList= [];
    newUser.taskList.push(await taskDef._id);
    newUser.colorUsed = [];
    newUser.colorUsed.push(color.colorName);
    await newUser.save();
    console.log(`New User:${req.body.firstName}`);
}

export default function Form(app){

    app.post('/form/register',async function(req,res){
        console.log("Register form uploaded");
        createDefault(req);
        res.send(`
        <!DOCTYPE html>
        <html>stackoverflow
        <body>
        <h2>Redirect to login</h2>
        <!--script to redirect to another webpage-->
        <script>
        window.location.href = "http://localhost:5000/login";
        </script>
        </body>

        </html>`
        )
    });

    app.post('/form/login',async function(req,res){
        console.log("Login Requested");
        const obj = await User.exists({username:req.body.username, password:req.body.password});
        if(obj != null)
        {
            res.send(`    <!DOCTYPE html>
            <html>
            <body>
            <h2>Redirect to Dashboard</h2>
            <!--script to redirect to another webpage-->
            <script>
            window.location.href = "http://localhost:5000/dashboard"; document.cookie="api=${obj._id};path=/dashboard";
            </script>
            </body>

            </html>`);
            // res.sendFile(path.join(__dirname, '../dashboard/index.html'));
            console.log("Login Successful");
        }
        else
        {
            res.send("Incorrect username/password");
            console.log("Login Failed");
        }
    });


    app.post("/form/addGoal",async function(req,res){
        let userId = req.body.api;
        let User_x = await User.findOne({_id:userId});
        delete req.body["api"];

        let new_color = allotColor(User_x.colorUsed);
        const newGoal = new Goal(req.body);
        newGoal.color = {main: new_color.main, border: new_color.border};
        newGoal.completed = false;

        User_x.colorUsed.push(new_color.colorName);

        let goal_id = await newGoal.save();
        User_x.goalList.push(goal_id);
        await User_x.save();
        console.log("Goal Added");
        res.send(`<!DOCTYPE html>
        <html>
        <body>
        <h2>Redirect to Dashboard</h2>
        <!--script to redirect to another webpage-->
        <script>
        window.location.href = "http://localhost:5000/dashboard";
        </script>
        </body>

        </html>`);

    });

    app.post("/form/addTask",async function(req,res){
        let userId = req.body.api;
        let User_x = await User.findOne({_id:userId}).populate('goalList');
        // console.log(User_x);
        delete req.body["api"];
        let goalId;
        User_x.goalList.forEach(goal => {
            if(goal.goalName === req.body.goalName)
                goalId = goal._id;
        })
        if(goalId == null)
        {
            throw "Goal not found for task";
        }
        let goal = await Goal.findOne({_id:goalId});
        req.body.color = goal.color
        let i = 0;
        let subTaskList = []
        while(true)
        {
            if("subTaskName"+i.toString() in req.body)
            {
                let subtask = {
                    subTaskName:req.body["subTaskName"+i.toString()],
             est: req.body["est"+i.toString()],
             completed:false,
                }
                subTaskList.push(subtask);
                i++;
            }
            else
            {
                break;
            }
        }
        const newTask = new Task(req.body);
        newTask.subTaskList =subTaskList;
        newTask.completed = false;
        // console.log(newTask);
        const taskId = await newTask.save();
        User_x.taskList.push(taskId);
        await User_x.save();
        console.log("Task Added");
        res.send(`<!DOCTYPE html>
        <html>
        <body>
        <h2>Redirect to Dashboard</h2>
        <!--script to redirect to another webpage-->
        <script>
        window.location.href = "http://localhost:5000/dashboard";
        </script>
        </body>

        </html>`);

    });




    app.post("/form/modifyTask",async function(req,res){
        console.log(req.body);
        let task_up = req.body;
        if(task_up.delete === 'true')
        {
            res.send(`<!DOCTYPE html>
            <html>
            <body>
            <h2>Redirect to Dashboard</h2>
            <!--script to redirect to another webpage-->
            <script>
            window.location.href = "http://localhost:5000/dashboard";
            </script>
            </body>

            </html>`);
            await Task.deleteOne({_id:req.body.taskId});
            return;
        }
        let task = await Task.findOne({_id:req.body.taskId});
        task.goalName = task_up.goalName;
        task.taskName= task_up.taskName;
        task.taskDuration= task_up.taskDuration;
        task.taskStart= task_up.taskStart;
        task.taskEnd= task_up.taskEnd;
        task.taskPriorty= task_up.taskPriorty;

        let i = 0;
        let subTaskList = [];
        while(true)
        {
            if("subTaskName"+i.toString() in task_up)
            {
                let subtask = {
                    subTaskName:task_up["subTaskName"+i.toString()],
             est: task_up["est"+i.toString()],
             completed:task_up["completed"+i.toString()],
                }
                subTaskList.push(subtask);
                i++;
            }
            else
            {
                break;
            }
        }
        task.subTaskList = subTaskList;
        task.completed = task_up.completed;
        res.send(`<!DOCTYPE html>
        <html>
        <body>
        <h2>Redirect to Dashboard</h2>
        <!--script to redirect to another webpage-->
        <script>
        window.location.href = "http://localhost:5000/dashboard";
        </script>
        </body>

        </html>`);
        await task.save();
        // console.log(task);

    });


    app.post("/form/modifyGoal",async function(req,res){
        console.log(req.body);
        if(req.body.delete == 'true')
        {
            res.send(`<!DOCTYPE html>
            <html>
            <body>
            <h2>Redirect to Dashboard</h2>
            <!--script to redirect to another webpage-->
            <script>
            window.location.href = "http://localhost:5000/dashboard";
            </script>
            </body>

            </html>`);
            await Goal.deleteOne({_id:req.body.goalId});
            await Task.deleteMany({goalName:req.body.goalName});
            return;
        }
        let goal_up = req.body;
        let goal = await Goal.findOne({_id:req.body.goalId});
        goal.goalName = goal_up.goalName;
        goal.goalDuration = goal_up.goalDuration;
        goal.goalStart = goal_up.goalStart;
        goal.goalEnd = goal_up.goalEnd;
        goal.successCrit= goal_up.successCrit;
        goal.completed = goal_up.completed;
        res.send(`<!DOCTYPE html>
        <html>
        <body>
        <h2>Redirect to Dashboard</h2>
        <!--script to redirect to another webpage-->
        <script>
        window.location.href = "http://localhost:5000/dashboard";
        </script>
        </body>

        </html>`);
        await goal.save();
    });





}