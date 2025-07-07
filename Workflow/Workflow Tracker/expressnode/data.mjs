import {User,Goal,Task,ColorPalette} from './Schemas.mjs';

import express from 'express';
import mongoose from 'mongoose';

import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function Data(app){

    Array.prototype.forEachAsync = async function (fn) {
        for (let t of this) { await fn(t) }
    }

    Array.prototype.forEachAsyncParallel = async function (fn) {
        await Promise.all(this.map(fn));
    }

        app.use("/UserData",async function(req,res){
            let userId = req.path.substring(1);
            if(userId === "default")
                return;
            let User_x = await User.findOne({_id:userId});
            console.log(`User Info:${User_x.firstName}`);
            res.json(User_x);
        });


    app.use("/TaskListData",async function(req,res){
        let userId = req.path.substring(1);
        if(userId === "default")
            return;
        let User_x = await User.findOne({_id:userId});
        console.log(`TaskList Info:${User_x.firstName}`);

        let TaskList = [];
        await User_x.taskList.forEachAsyncParallel(async function(taskId){
            let Task_x = await Task.findOne({_id:taskId});
            if(Task_x != null)
                TaskList.push(Task_x);
        });
        // console.log(TaskList);
        res.send(TaskList);
    });

    app.use("/GoalListData",async function(req,res){
        let userId = req.path.substring(1);
        if(userId === "default")
            return;
        let User_x = await User.findOne({_id:userId});
        console.log(`GoalList info:${User_x.firstName}`);

        let GoalList = [];
        await User_x.goalList.forEachAsyncParallel(async function(goalId){
            let goal_x = await Goal.findOne({_id:goalId});
            if(goal_x != null)
                GoalList.push(goal_x);
        })
        // console.log(GoalList);
        res.send(GoalList);
    });

}