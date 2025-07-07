import express from 'express';

import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default function Pages(app){
    app.get('/login',function(req,res){
        res.sendFile(path.join(__dirname, '../login/index.html'));
    });

    app.get('/login/index.css',function(req,res){
        res.sendFile(path.join(__dirname,'../login/index.css'));
    });

    app.get('/login/index.js',function(req,res){
        res.sendFile(path.join(__dirname,'../login/index.js'));
    });

    app.get('/register',function(req,res){
        res.sendFile(path.join(__dirname, '../register/index.html'));
    });

    app.get('/register/index.css',function(req,res){
        res.sendFile(path.join(__dirname,'../register/index.css'));
    });

    app.get('/register/index.js',function(req,res){
        res.sendFile(path.join(__dirname,'../register/index.js'));
    });

    app.get('/dashboard',function(req,res){
        res.sendFile(path.join(__dirname, '../dashboard/index.html'));
    });

    app.get('/dashboard/index.css',function(req,res){
        res.sendFile(path.join(__dirname,'../dashboard/index.css'));
    });

    app.get('/dashboard/index.js',function(req,res){
        res.sendFile(path.join(__dirname,'../dashboard/index.js'));
    });
}