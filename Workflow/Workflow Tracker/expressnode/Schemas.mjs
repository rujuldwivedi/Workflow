//Schemas
import mongoose from 'mongoose';
const {Schema,SchemaTypes,model}= mongoose;

const colorpaletteSchema = new Schema({
    colorName:String,
    border:String,
    main:String,
});

const goalSchema = new Schema({
    goalName:String,
    goalDuration:Number,
    goalStart:Date,
    goalEnd:Date,
    successCrit:String,
    completed:String,
    color: {
        main:String,
        border:String,
    },
});

const taskSchema = new Schema({
    goalName:String,
    color: {
        main:String,
        border:String,
    },
    taskName:String,
    taskDuration:Number,
    taskStart:Date,
    taskEnd:Date,
    taskPriorty:String,
    subTaskList:[{
        subTaskName:String,
        est:Number,
        completed:String,
    }],
    completed:String,
});

//UserData is the collection here
const userSchema = new Schema({
    firstName:String,
    lastName:String,
    email:String,
    phoneNo: String,
    userName: String,
    password:String,
    dayStart:{
        type:Date,
        default : Date("July 19, 2024 06:00:00"),
    },
    dayEnd:{
        type: Date,
        default : Date("July 19, 2024 18:00:00"),
    },
    goalList:[{
        type: Schema.Types.ObjectId,
        ref: 'Goal',
    }],
    taskList:[{
        type: Schema.Types.ObjectId,
        ref: 'Task',
    }],
    colorUsed:[String]
});


const ColorPalette = model('ColorPalette',colorpaletteSchema);
const Task = model('Task',taskSchema);
const User = model('Users',userSchema);
const Goal = model('Goal',goalSchema);
export {User,Goal,Task,ColorPalette};
