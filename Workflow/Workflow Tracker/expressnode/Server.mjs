import {User,Goal,Task,ColorPalette} from './Schemas.mjs';
import ColorPaletteList from './colorpalette.mjs';

import mongoose from 'mongoose';
import express from "express";
import cors from 'cors';
import path from "path";

import bodyParser from "body-parser";

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import Pages from './pages.mjs';
import Form from './form.mjs';
import Data from './data.mjs';
let port = 5000;


let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors());

app.use('/assets',express.static(path.join(__dirname, '../assets')));

Pages(app);
Form(app);
Data(app);

// app.use('/register',express.static(path.join(__dirname, '../register')));
// app.use('/dashboard',express.static(path.join(__dirname, '../dashboard')));

let colorPaletteList;
function allotColor(userColorList)
{
    let count = colorPaletteList.length;
    let i = 0;
    while(i < 1000)
    {
        let random = Math.floor(Math.random()* count);
        let color = colorPaletteList[random];
            if(userColorList.length == 0 || userColorList.includes(color.colorName) == false)
            {
                return color;
            }
            else
            {
                ++i;
            }
    }
    return colorPaletteList[0];
}



async function checkColor(color)
{
    let bo = await ColorPalette.exists(color);
    if(bo == null)
    {
        ColorPalette.create(color);
    }
}

function loadColors()
{
    ColorPaletteList.forEach(color =>checkColor(color));
}

export default async function Server(db)
{
    let server = app.listen(port,function(z){
    console.log("Express Setup and runnin...");
    });
    loadColors();

}
