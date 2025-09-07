const User = require('../models/user');
const CompanyProfile = require('../models/companyProfile');
const IndividualProfile = require('../models/individualProfile');



// Create or update company profile
exports.createCompanyProfile = async (req, res) => {
    const { companyName, address, contactEmail, phone,profileImage} = req.body;
    const user = req.user;

    if (user.userType !== 'company' && user.userType !== 'pending') {
        return res.status(400).json({ message: 'User must be of type company' });
    }

    try {
        // Check if profile already exists
        let profile = await CompanyProfile.findOne({ userId: user._id });
        if (profile) {
            return res.status(400).json({ message: 'Company profile already exists' });
        }

        // Create new profile
        profile = new CompanyProfile({
            userId: user._id,
            companyName,
            address,
            contactEmail,
            phone,
            profileImage
        });
        await profile.save();

        // Update user with profileId and userType
        user.userType = 'company';
        user.profileId = profile._id;
        await user.save();

        res.status(201).json({ message: 'Company profile created', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error creating company profile', error: error.message });
    }
};

// Create or update individual profile
exports.createIndividualProfile = async (req, res) => {
    const { firstName, lastName, phone, dateOfBirth,profileImage } = req.body;
    const user = req.user;

    if (user.userType !== 'individual' && user.userType !== 'pending') {
        return res.status(400).json({ message: 'User must be of type individual' });
    }

    try {
        // Check if profile already exists
        let profile = await IndividualProfile.findOne({ userId: user._id });
        if (profile) {
            return res.status(400).json({ message: 'Individual profile already exists' });
        }

        // Create new profile
        profile = new IndividualProfile({
            userId: user._id,
            firstName,
            lastName,
            phone,
            profileImage,
            dateOfBirth
        });
        await profile.save();

        // Update user with profileId and userType
        user.userType = 'individual';
        user.profileId = profile._id;
        await user.save();

        res.status(201).json({ message: 'Individual profile created', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error creating individual profile', error: error.message });
    }
};



exports.getCompanyProfile = async (req, res) => {
    const user = req.user;

    if (user.userType !== 'company') {
        return res.status(400).json({ message: 'User must be of type company' });
    }

    try {
        const profile = await CompanyProfile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }
        res.status(200).json({ profile });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving company profile', error: error.message });
    }
};

// Update company profile
exports.updateCompanyProfile = async (req, res) => {
    const { companyName, address, contactEmail, phone, profileImage } = req.body;
    const user = req.user;

    if (user.userType !== 'company') {
        return res.status(400).json({ message: 'User must be of type company' });
    }

    try {
        let profile = await CompanyProfile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        // Update profile fields
        profile.companyName = companyName || profile.companyName;
        profile.address = address || profile.address;
        profile.contactEmail = contactEmail || profile.contactEmail;
        profile.phone = phone || profile.phone;
        profile.profileImage = profileImage || profile.profileImage;

        await profile.save();
        res.status(200).json({ message: 'Company profile updated', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error updating company profile', error: error.message });
    }
};

// Get individual profile
exports.getIndividualProfile = async (req, res) => {
    const user = req.user;

    if (user.userType !== 'individual') {
        return res.status(400).json({ message: 'User must be of type individual' });
    }

    try {
        const profile = await IndividualProfile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Individual profile not found' });
        }
        res.status(200).json({ profile });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving individual profile', error: error.message });
    }
};

// Update individual profile
exports.updateIndividualProfile = async (req, res) => {
    const { firstName, lastName, phone, dateOfBirth, profileImage } = req.body;
    const user = req.user;

    if (user.userType !== 'individual') {
        return res.status(400).json({ message: 'User must be of type individual' });
    }

    try {
        let profile = await IndividualProfile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Individual profile not found' });
        }

        // Update profile fields
        profile.firstName = firstName || profile.firstName;
        profile.lastName = lastName || profile.lastName;
        profile.phone = phone || profile.phone;
        profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
        profile.profileImage = profileImage || profile.profileImage;

        await profile.save();
        res.status(200).json({ message: 'Individual profile updated', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error updating individual profile', error: error.message });
    }
};

// Get user details
exports.getUser = async (req, res) => {
    const user = req.user;

    try {
        const userData = await User.findById(user._id).select('name email userType profileId');
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        let profile = null;
        if (userData.userType === 'company') {
            profile = await CompanyProfile.findOne({ userId: user._id });
        } else if (userData.userType === 'individual') {
            profile = await IndividualProfile.findOne({ userId: user._id });
        }

        res.status(200).json({ user: userData, profile });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user details', error: error.message });
    }
};

// Select user type (if pending)
exports.selectUserType = async (req, res) => {
    const { userType } = req.body;
    const user = req.user;

    if (!['company', 'individual'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid userType. Must be "company" or "individual"' });
    }

    if (user.userType !== 'pending') {
        return res.status(400).json({ message: 'User type already set' });
    }

    try {
        user.userType = userType;
        await user.save();
        res.status(200).json({ 
            message: 'User type updated', 
            userType,
            nextStep: `Navigate to ${userType} profile setup`
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user type', error: error.message });
    }
};