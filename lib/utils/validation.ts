/**
 * Server-side validation utilities for business logic
 * These can be used both client-side and in future server-side API endpoints
 */

import { log } from './logger';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface ProductValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  sku: {
    required: boolean;
    pattern: RegExp;
    minLength: number;
    maxLength: number;
  };
  barcode: {
    required: boolean;
    pattern?: RegExp;
  };
  price: {
    required: boolean;
    min: number;
    max: number;
  };
  cost: {
    required: boolean;
    min: number;
  };
  stock: {
    required: boolean;
    min: number;
  };
  category: {
    required: boolean;
  };
}

const DEFAULT_PRODUCT_RULES: ProductValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  sku: {
    required: true,
    pattern: /^[A-Za-z0-9-]{2,20}$/,
    minLength: 2,
    maxLength: 20,
  },
  barcode: {
    required: false,
    pattern: /^[0-9]{8,18}$/,
  },
  price: {
    required: true,
    min: 0.01,
    max: 1000000,
  },
  cost: {
    required: true,
    min: 0,
  },
  stock: {
    required: true,
    min: 0,
  },
  category: {
    required: true,
  },
};

/**
 * Validate product data against business rules
 */
export function validateProduct(
  product: any,
  rules: ProductValidationRules = DEFAULT_PRODUCT_RULES,
  existingProducts: any[] = []
): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (rules.name.required && !product.name?.trim()) {
    errors.name = 'Product name is required';
  } else if (product.name && product.name.length < rules.name.minLength) {
    errors.name = `Product name must be at least ${rules.name.minLength} characters`;
  } else if (product.name && product.name.length > rules.name.maxLength) {
    errors.name = `Product name must not exceed ${rules.name.maxLength} characters`;
  }

  // SKU validation
  if (rules.sku.required && !product.sku?.trim()) {
    errors.sku = 'SKU is required';
  } else if (product.sku && !rules.sku.pattern.test(product.sku)) {
    errors.sku = 'SKU must contain only letters, numbers, and dashes (2-20 characters)';
  } else if (product.sku && product.sku.length < rules.sku.minLength) {
    errors.sku = `SKU must be at least ${rules.sku.minLength} characters`;
  } else if (product.sku && product.sku.length > rules.sku.maxLength) {
    errors.sku = `SKU must not exceed ${rules.sku.maxLength} characters`;
  } else if (product.sku) {
    // Check SKU uniqueness
    const skuExists = existingProducts.some(
      p => p.sku === product.sku.trim() && p.id !== product.id
    );
    if (skuExists) {
      errors.sku = 'SKU already exists';
    }
  }

  // Barcode validation
  if (rules.barcode.required && !product.barcode?.trim()) {
    errors.barcode = 'Barcode is required';
  } else if (product.barcode && rules.barcode.pattern && !rules.barcode.pattern.test(product.barcode)) {
    errors.barcode = 'Barcode must contain only digits (8-18 characters)';
  } else if (product.barcode) {
    // Check barcode uniqueness
    const barcodeExists = existingProducts.some(
      p => p.barcode === product.barcode.trim() && p.id !== product.id
    );
    if (barcodeExists) {
      errors.barcode = 'Barcode already exists';
    }
  }

  // Price validation
  const price = parseFloat(product.price);
  if (rules.price.required && (!product.price || isNaN(price))) {
    errors.price = 'Valid selling price is required';
  } else if (!isNaN(price)) {
    if (price < rules.price.min) {
      errors.price = `Selling price must be at least ${rules.price.min}`;
    } else if (price > rules.price.max) {
      errors.price = `Selling price must not exceed ${rules.price.max}`;
    }
  }

  // Cost validation
  const cost = parseFloat(product.cost);
  if (rules.cost.required && (!product.cost || isNaN(cost))) {
    errors.cost = 'Valid cost price is required';
  } else if (!isNaN(cost)) {
    if (cost < rules.cost.min) {
      errors.cost = `Cost price must be at least ${rules.cost.min}`;
    }
    // Business rule: Cost should not exceed selling price
    if (!isNaN(price) && cost > price) {
      errors.cost = 'Cost price cannot exceed selling price';
    }
  }

  // Stock validation
  const stock = parseInt(product.stock);
  if (rules.stock.required && (product.stock === '' || isNaN(stock))) {
    errors.stock = 'Valid stock quantity is required';
  } else if (!isNaN(stock)) {
    if (stock < rules.stock.min) {
      errors.stock = `Stock cannot be less than ${rules.stock.min}`;
    }
  }

  // Category validation
  if (rules.category.required && !product.category?.trim()) {
    errors.category = 'Category is required';
  } else if (product.category && product.category.trim().length === 0) {
    errors.category = 'Category cannot be empty';
  }

  // Additional field validations
  let minStock: number | undefined;
  if (product.minStock !== undefined) {
    minStock = parseInt(product.minStock);
    if (isNaN(minStock) || minStock < 0) {
      errors.minStock = 'Minimum stock must be a valid non-negative number';
    }
  }

  if (product.maxStock !== undefined) {
    const maxStock = parseInt(product.maxStock);
    if (isNaN(maxStock) || maxStock < 0) {
      errors.maxStock = 'Maximum stock must be a valid non-negative number';
    } else if (minStock !== undefined && !isNaN(minStock) && maxStock < minStock) {
      errors.maxStock = 'Maximum stock must be greater than or equal to minimum stock';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate sale data
 */
export function validateSale(sale: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!sale.items || !Array.isArray(sale.items) || sale.items.length === 0) {
    errors.items = 'Sale must contain at least one item';
  } else {
    sale.items.forEach((item: any, index: number) => {
      if (!item.productId) {
        errors[`items_${index}_productId`] = `Item ${index + 1} is missing product ID`;
      }
      if (!item.name) {
        errors[`items_${index}_name`] = `Item ${index + 1} is missing product name`;
      }
      if (!item.qty || item.qty <= 0) {
        errors[`items_${index}_qty`] = `Item ${index + 1} must have a valid quantity`;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors[`items_${index}_price`] = `Item ${index + 1} must have a valid price`;
      }
    });
  }

  if (!sale.customerId) {
    errors.customerId = 'Customer ID is required';
  }

  if (!sale.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }

  const total = parseFloat(sale.total);
  if (isNaN(total) || total <= 0) {
    errors.total = 'Total must be a valid positive number';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate inventory transaction
 */
export function validateInventoryTransaction(transaction: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!transaction.productId) {
    errors.productId = 'Product ID is required';
  }

  if (!transaction.type) {
    errors.type = 'Transaction type is required';
  } else if (
    !['purchase', 'sale', 'adjustment', 'transfer', 'return'].includes(transaction.type)
  ) {
    errors.type = 'Invalid transaction type';
  }

  const qty = parseInt(transaction.qty);
  if (isNaN(qty)) {
    errors.qty = 'Quantity must be a valid number';
  } else if (qty === 0) {
    errors.qty = 'Quantity cannot be zero';
  }

  if (!transaction.createdBy) {
    errors.createdBy = 'Created by field is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate and sanitize product data for server-side processing
 */
export function validateAndSanitizeProduct(product: any, existingProducts: any[] = []): ValidationResult {
  // Sanitize string fields
  const sanitized = {
    ...product,
    name: product.name ? sanitizeInput(product.name) : '',
    sku: product.sku ? sanitizeInput(product.sku).toUpperCase() : '',
    barcode: product.barcode ? sanitizeInput(product.barcode) : '',
    category: product.category ? sanitizeInput(product.category) : 'General',
    description: product.description ? sanitizeInput(product.description) : '',
  };

  // Validate the sanitized data
  const result = validateProduct(sanitized, DEFAULT_PRODUCT_RULES, existingProducts);
  
  log.info('VALIDATION', `Product validation: ${result.valid ? 'PASSED' : 'FAILED'}`, {
    valid: result.valid,
    errors: result.errors,
  });

  return result;
}

/**
 * Check stock availability with validation
 */
export function validateStockAvailability(
  currentStock: number,
  requestedQty: number,
  allowBackorder: boolean = false
): ValidationResult {
  const errors: Record<string, string> = {};

  if (requestedQty <= 0) {
    errors.qty = 'Requested quantity must be positive';
  }

  if (!allowBackorder && currentStock < requestedQty) {
    errors.stock = `Insufficient stock. Available: ${currentStock}, Requested: ${requestedQty}`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate payment information
 */
export function validatePayment(payment: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!payment.method) {
    errors.method = 'Payment method is required';
  } else if (
    !['cash', 'mpesa', 'card', 'split'].includes(payment.method)
  ) {
    errors.method = 'Invalid payment method';
  }

  const amount = parseFloat(payment.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Payment amount must be a valid positive number';
  }

  // For M-Pesa, phone number is required
  if (payment.method === 'mpesa' && !payment.phoneNumber) {
    errors.phoneNumber = 'Phone number is required for M-Pesa payments';
  }

  // For card, card details are required
  if (payment.method === 'card' && !payment.cardNumber) {
    errors.cardNumber = 'Card number is required for card payments';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}