const Company = require('../models/companyModel');
const Employee = require('../models/employeeModel');

// Create a company
exports.createCompany = async (req, res) => {
  const { name, address, foundedDate, description, contactEmail, contactPhone, website } = req.body;
  const userId = req.user._id; // From authMiddleware

  try {
    // Check if company name already exists
    const existingCompany = await Company.findOne({ name, isDeleted: false });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company name already exists' });
    }

    // Create new company
    const company = new Company({
      userId,
      name,
      address,
      foundedDate: foundedDate || Date.now(),
      description,
      contactEmail,
      contactPhone,
      website,
      createdBy: userId, // Track user who created the company
    });

    await company.save();
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// exports.getCompaniesByUserId = async (req, res) => {
//   const { userId } = req.user._id; // Assuming userId is passed as a URL parameter
// console.log("User id getCompanieBy userId ==",userId)
//   try {
//     // Validate userId format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: 'Invalid user ID format' });
//     }
    
//     // Fetch companies by userId and not deleted
//     const companies = await Company.find({userId:userId.toString(), isDeleted: false }).populate('user', 'name email');

//     // Check if companies exist
//     if (!companies || companies.length === 0) {
//       return res.status(404).json({ message: 'No companies found for this user' });
//     }

//     res.status(200).json({ message: 'Companies retrieved successfully', companies });
//   } catch (error) {
//     console.error('Error fetching companies:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// Update a company
exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, address, description, contactEmail, contactPhone, website } = req.body;

  try {
    const company = await Company.findOne({ _id: id, isDeleted: false });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update fields
    company.name = name || company.name;
    company.address = address || company.address;
    company.description = description || company.description;
    company.contactEmail = contactEmail || company.contactEmail;
    company.contactPhone = contactPhone || company.contactPhone;
    company.website = website || company.website;

    await company.save();
    res.json({ message: 'Company updated successfully', company });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Soft delete a company
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;
 console.log("This is deleteCompany Funcation Cmp id = ",id)
  try {
    const company = await Company.findOne({ _id: id, isDeleted: false });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isDeleted = true;
    await company.save();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all companies (non-deleted)
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isDeleted: false });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findOne({ _id: id, isDeleted: false });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// exports.getCompanyByUserId = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const userId = req.user._id; // From auth middleware
//     console.log("This is get company By userId ",userId,"req.params",id);
//             // if (userId.toString() !== req.params.id) {
//             //     return res.status(403).json({
//             //         success: false,
//             //         message: 'Unauthorized: User ID mismatch',
//             //     });
//             // }
//       //  const query = { userId };
//             // const user = await User.findById(userId);
//     const company = await Company.find({ userId: id, isDeleted: false });
//     if (!company) {
//       return res.status(404).json({ message: 'Company not found' });
//     }
//     res.json(company);
//   } catch (error) {
//     console.error('Error fetching company:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };