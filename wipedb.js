const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Danger = require('./models/dangerModel');
const DangerComment = require('./models/dangerCommentModel')
const User = require('./models/userModel');
const UserSensitive = require('./models/userSensitiveModel')
const mongoDB = 'mongodb+srv://admin:admin@trentinoalert.yxh7w.mongodb.net/?retryWrites=true&w=majority&appName=TrentinoAlert';

main().catch((err) => console.log(err));

async function main() {
    console.log('About to connect');
    await mongoose.connect(mongoDB);
    console.log('Should be connected?');
    await Danger.deleteMany({});
    await User.deleteMany({});
    await UserSensitive.deleteMany({})
    await DangerComment.deleteMany({})
    console.log('deleted');
    mongoose.connection.close();
}