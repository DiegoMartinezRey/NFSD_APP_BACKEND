const Profile = require("../models/Profile");
const User = require("../models/User");
const userController = require("./userController");

const profileController = {

  getProfiles: async (req, res) => {
    console.log("Aca");
    try {
      const profiles = await Profile.find();
      return res.json(profiles);
    } catch (error) {
      res.status(500).send("Unable to find profiles");
    }
  },


  addProfile: async (req, res) => {
    try {
      const newProfile = await Profile.create({
        ...req.body,
      });
      res.status(200).json(newProfile);
    } catch (error) {
      console.error(error);
      res.status(400).send("Profile cannot be added", error);
    }
  },

  getAllProfiles: async (req, res) => {
    const profileId = req.query.profileId;
    try {
      const profiles = await Profile.find({ _id: { $ne: profileId } });
      return res.json(profiles);
    } catch (error) {
      res.status(500).send("Unable to find profiles");
    }
  },

  getProfileByUserId: async (req, res) => {
    try {
      const userId = req.params.id;
      const profile = await Profile.findOne({ _id: userId });
      return res.json(profile);
    } catch (error) {
      res.status(404).send("Profile not found");
    }
  },

  getProfileByName: async (req, res) => {
    try {
      const userName = req.params.name;
      const profile = await Profile.find({ name: userName }).populate(
        "user",
        "email"
      );
      return res.json(profile);
    } catch (error) {
      res.status(404).send("Profile not found");
    }
  },

  getProfileByEmail: async (req, res) => {
    try {
      const userEmail = req.params.email;
      const userId = await User.findOne({ email: userEmail });
      const profile = await Profile.findOne({ user: userId._id });
      const fullProfile = { user: userId, profile };
      return res.json(fullProfile);
    } catch (error) {
      res.status(404).send("Email not found");
    }
  },

  deleteProfile: async (req, res) => {
    console.log("profile: ", req.params.id);
    try {
      const profile = await Profile.findOneAndDelete({ userId: req.params.id });
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(404).send("Profile cannot be deleted");
    }
  },

  updateProfile: async (req, res) => {
    try {
      const profile = await Profile.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      res.json(profile);
    } catch (error) {
      res.status(404).send("Profile cannot be updated");
    }
  },

  getPaginationProfiles: async (req, res) => {
    const page = req.query.page;
    const limit = 9;
    const filters = req.query.filters || {};
    const profileId = req.query.profileId;

    try {
      let query = {};
      if (profileId) query._id = { $ne: profileId };
      if (Object.keys(filters).length > 0) {
        if (filters.nationality) query.nationality = filters.nationality;
        if (filters.gender) query.gender = filters.gender;
        if (filters.languages) query.languages = { $in: filters.languages };
        if (filters.age && filters.age.min && filters.age.max) {
          const currentDate = new Date();
          const minBirthdate = new Date(
            currentDate.getFullYear() - filters.age.max,
            currentDate.getMonth(),
            currentDate.getDate()
          );
          const maxBirthdate = new Date(
            currentDate.getFullYear() - filters.age.min,
            currentDate.getMonth(),
            currentDate.getDate()
          );

          query.dob = {
            $gte: minBirthdate,
            $lte: maxBirthdate,
          };
        }
      }

      const profiles = await Profile.find(query)
        .skip((page - 1) * limit)
        .limit(limit);
      res.json(profiles);
    } catch (error) {
      res.status(500).send("Unable to find profiles");
    }
  },
};

module.exports = profileController;
