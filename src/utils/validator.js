class Validator {
  static validateRequired(data, requiredFields) {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Email inválido: ${email}`);
    }
  }

  static validatePositiveNumber(value, fieldName) {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error(`${fieldName} deve ser um número positivo`);
    }
  }

  static validateString(value, fieldName, minLength = 1) {
    if (typeof value !== 'string' || value.trim().length < minLength) {
      throw new Error(`${fieldName} deve ser uma string com no mínimo ${minLength} caracteres`);
    }
  }

  static validateLessThanOrEqual(value, maxValue, fieldName) {
    if (value > maxValue) {
      throw new Error(`${fieldName} não pode ser maior que ${maxValue}`);
    }
  }
}

module.exports = Validator;
