// Form validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[\d+\-().\s]{10,}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const validateName = (name) => {
  return name.trim().length >= 2 && !/[^a-zA-Z\s'-]/.test(name);
};

export const validateDateOfBirth = (date) => {
  const dob = new Date(date);
  const today = new Date();
  const minAge = 2; // Minimum 2 years old
  const maxAge = 10; // Maximum 10 years old
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

export const validateAdmissionsForm = (formData) => {
  const errors = {};

  if (!formData.student_name?.trim()) {
    errors.student_name = 'Student name is required';
  } else if (!validateName(formData.student_name)) {
    errors.student_name = 'Enter a valid name (letters only)';
  }

  if (!formData.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  } else if (!validateDateOfBirth(formData.date_of_birth)) {
    errors.date_of_birth = 'Student must be between 2-10 years old';
  }

  if (!formData.parent_name?.trim()) {
    errors.parent_name = 'Parent name is required';
  } else if (!validateName(formData.parent_name)) {
    errors.parent_name = 'Enter a valid name';
  }

  if (!formData.parent_email?.trim()) {
    errors.parent_email = 'Email is required';
  } else if (!validateEmail(formData.parent_email)) {
    errors.parent_email = 'Enter a valid email';
  }

  if (!formData.contact_number?.trim()) {
    errors.contact_number = 'Phone number is required';
  } else if (!validatePhone(formData.contact_number)) {
    errors.contact_number = 'Enter a valid phone number';
  }

  if (!formData.grade_applied) {
    errors.grade_applied = 'Please select a grade';
  }

  return errors;
};

export const validateContactForm = (formData) => {
  const errors = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = 'Name is required';
  } else if (!validateName(formData.fullName)) {
    errors.fullName = 'Enter a valid name';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Enter a valid email';
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'Phone is required';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Enter a valid phone number';
  }

  if (!formData.message?.trim()) {
    errors.message = 'Message is required';
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
};
