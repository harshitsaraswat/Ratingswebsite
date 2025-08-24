const isStrongPassword = (password) => {
 
  const lengthOk = password.length >= 8 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return lengthOk && hasUpper && hasSpecial;
};

const validateName = (name) => {
  return name && name.length >= 20 && name.length <= 60;
};

const validateAddress = (address) => {
  return address && address.length <= 400;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  isStrongPassword,
  validateName,
  validateAddress,
  validateEmail
};
