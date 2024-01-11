const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  name: { type: String, require: true, maxlenght: 15 },
  last_name: { type: String, require: false },
  user_name: { type: String, unique: true, require: true },
  email: {
    type: String,
    unique: true,
    require: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  dob: { type: Date, require: false },
  nationality: { type: String, require: true },
  gender: { type: String, require: true },
  lenguage: { type: [Array], require: true },
  photo: { type: [Array], require: true },
  bio: { type: String, require: true, maxlenght: 150 },
  interest: { type: [Array], require: true },
});

const Profile = mongoose.model("profile", ProfileSchema);

module.exports = Profile;
