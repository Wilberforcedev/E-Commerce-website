import { Request, Response, NextFunction } from 'express';

export type ValidationRule = 'required' | 'string' | 'numeric' | 'array' | 'email' | string;

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

export interface ValidationResult {
  passes: boolean;
  errors: Record<string, string[]>;
}

/**
 * Laravel-style FormRequest Validator
 * Validates request payload against rules and returns standard Laravel 422 Unprocessable Entity
 */
export function validateData(data: Record<string, any>, rules: ValidationRules): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [field, ruleList] of Object.entries(rules)) {
    const value = getNestedValue(data, field);

    for (const rule of ruleList) {
      if (rule === 'required') {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          addError(errors, field, `The ${field} field is required.`);
          break; // Stop further validation for this field if required fails
        }
      }

      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (rule === 'string') {
        if (typeof value !== 'string') {
          addError(errors, field, `The ${field} must be a string.`);
        }
      } else if (rule === 'numeric') {
        if (typeof value !== 'number' || isNaN(value)) {
          addError(errors, field, `The ${field} must be a number.`);
        }
      } else if (rule === 'array') {
        if (!Array.isArray(value)) {
          addError(errors, field, `The ${field} must be an array.`);
        }
      } else if (rule === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          addError(errors, field, `The ${field} must be a valid email address.`);
        }
      } else if (rule.startsWith('min:')) {
        const min = parseFloat(rule.split(':')[1]);
        if (typeof value === 'number' && value < min) {
          addError(errors, field, `The ${field} must be at least ${min}.`);
        } else if (typeof value === 'string' && value.length < min) {
          addError(errors, field, `The ${field} must be at least ${min} characters.`);
        } else if (Array.isArray(value) && value.length < min) {
          addError(errors, field, `The ${field} must have at least ${min} items.`);
        }
      } else if (rule.startsWith('max:')) {
        const max = parseFloat(rule.split(':')[1]);
        if (typeof value === 'number' && value > max) {
          addError(errors, field, `The ${field} may not be greater than ${max}.`);
        } else if (typeof value === 'string' && value.length > max) {
          addError(errors, field, `The ${field} may not be greater than ${max} characters.`);
        }
      } else if (rule.startsWith('in:')) {
        const allowed = rule.substring(3).split(',');
        if (!allowed.includes(String(value))) {
          addError(errors, field, `The selected ${field} is invalid. Allowed values: ${allowed.join(', ')}.`);
        }
      }
    }
  }

  return {
    passes: Object.keys(errors).length === 0,
    errors,
  };
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

function addError(errors: Record<string, string[]>, field: string, message: string) {
  if (!errors[field]) {
    errors[field] = [];
  }
  errors[field].push(message);
}

/**
 * Laravel-style FormRequest middleware generator
 */
export function validateRequest(rules: ValidationRules) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validateData(req.body, rules);
    if (!result.passes) {
      return res.status(422).json({
        message: 'The given data was invalid.',
        errors: result.errors,
      });
    }
    next();
  };
}
