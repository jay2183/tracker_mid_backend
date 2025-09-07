const Employee = require('../models/employeeModel');
const Company = require('../models/companyModel');
const User = require('../models/user');
const { sendOTP } = require('../controllers/authController'); // Reuse OTP sending logic

// Create an employee
exports.createEmployee = async (req, res) => {
  const { firstName, lastName, email, phone, position, department, salary, hireDate, companyId } = req.body;
  const userId = req.user._id; // From authMiddleware

  try {
    // Verify company exists and is not deleted
    const company = await Company.findOne({ _id: companyId, isDeleted: false });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user exists, create if not
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name: `${firstName} ${lastName}`, email });
      await user.save();
    }

    // Check if employee already exists for this company
    const existingEmployee = await Employee.findOne({ email, company: companyId, isDeleted: false });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists in this company' });
    }

    // Create new employee
    const employee = new Employee({
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      salary,
      hireDate: hireDate || Date.now(),
      company: companyId,
      user: user._id, // Link to user
    });

    await employee.save();

    // Increment company's employee count
    await company.incrementEmployeeCount();

    // Send OTP to employee for verification
    await sendOTP({ body: { email } }, { json: () => {} }); // Mock res.json to avoid sending response

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, position, department, salary } = req.body;

  try {
    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update fields
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.phone = phone || employee.phone;
    employee.position = position || employee.position;
    employee.department = department || employee.department;
    employee.salary = salary || employee.salary;

    await employee.save();
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Soft delete an employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete employee
    employee.isDeleted = true;
    await employee.save();

    // Decrement company's employee count
    const company = await Company.findById(employee.company);
    if (company) {
      await company.decrementEmployeeCount();
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all employees for a company
exports.getEmployeesByCompany = async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findOne({ _id: companyId, isDeleted: false });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const employees = await Employee.find({ company: companyId, isDeleted: false });
    // .populate('User', 'name email');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id, isDeleted: false }).populate('user', 'name email');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Employee login via OTP (reuses authController's verifyOTP)
exports.employeeLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Verify OTP using authController's verifyOTP logic
    const result = await require('./authController').verifyOTP({
      body: { email, otp, name: 'Employee' },
    }, res);

    if (result.status === 200) {
      // Check if employee exists for this user
      const user = await User.findOne({ email });
      const employee = await Employee.findOne({ user: user._id, isDeleted: false }).populate('company');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found for this user' });
      }
      res.json({
        message: 'Employee login successful',
        token: result.token,
        userId: user._id,
        employee,
      });
    }
  } catch (error) {
    console.error('Error in employee login:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};