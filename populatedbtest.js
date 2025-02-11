const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const User = require("./models/userModel")
const UserSensitive = require("./models/userSensitiveModel")
const Danger = require("./models/dangerModel")
const mongoDB = 'mongodb+srv://admin:admin@trentinoalert.yxh7w.mongodb.net/?retryWrites=true&w=majority&appName=TrentinoAlert';

main().catch((err) => console.log(err));

async function main() {
    console.log('About to connect');
    await mongoose.connect(mongoDB);
    console.log('Should be connected?');
    const existingModSensitive = await UserSensitive.findOne({
        emailAddress: "mod@mod.com",
        cellphoneNumber: "0000000000",
        password: "$2a$12$.vI9hho4ewT7q4pkYcNbXunaVAHj1dLwFomTewxzhbGPvZ.hYTC8u"
    }).exec()
    if(!existingModSensitive) {
        const modSensitive = new UserSensitive({
            emailAddress: "mod@mod.com",
            cellphoneNumber: "0000000000",
            password: "$2a$12$.vI9hho4ewT7q4pkYcNbXunaVAHj1dLwFomTewxzhbGPvZ.hYTC8u" //Moderator1
        })
        await modSensitive.save();
        const mod = new User({
            name: "Moderator",
            surname: "Moderator",
            isModerator: true,
            userSensitiveID: modSensitive._id
        })
        await mod.save();
        console.log("saved moderator");
    }
    const existingUserSensitive = await UserSensitive.findOne({
        emailAddress: "standardUser@standardUser.com",
        cellphoneNumber: "1111111111",
        password: "$2a$12$VvjnpXeL.gsj/Nv2FsiK4.NsnbYU3w4CHTNBbCiqUsVhKV901G/Wm"
    }).exec()
    if(!existingUserSensitive) {
        const userSensitive = new UserSensitive({
            emailAddress: "standardUser@standardUser.com",
            cellphoneNumber: "1111111111",
            password: "$2a$12$VvjnpXeL.gsj/Nv2FsiK4.NsnbYU3w4CHTNBbCiqUsVhKV901G/Wm" //StandardUser1
        })
        await userSensitive.save()
        const user = new User({
            name: "StandardUser",
            surname: "StandardUser",
            isModerator: false,
            userSensitiveID: userSensitive._id
        })
        await user.save()
        console.log("saved standard user")
    }
    mongoose.connection.close();
}