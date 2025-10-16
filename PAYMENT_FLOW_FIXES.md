# Urban Waste Management System - Payment & Wallet Flow Fixes

## Overview
This document outlines the fixes applied to the Urban Waste Management System to properly handle wallet storage after waste selling and payment processing for waste collection using SOLID principles.

## Issues Fixed

### 1. Payment Model Issues
- **Fixed**: `Payment.java` had incorrect `@Document(collection = "wallets")` annotation
- **Fixed**: Missing `@Id` annotation for MongoDB
- **Solution**: Changed to `@Document(collection = "payments")` and added proper `@Id` annotation

### 2. Payment Processing Architecture
- **Issue**: Payment processing was tightly coupled and violated SOLID principles
- **Solution**: Implemented Strategy Pattern with PaymentProcessor interface
- **Created**: 
  - `PaymentProcessor` interface
  - `WalletPaymentProcessor` for wallet payments
  - `CardPaymentProcessor` for card payments  
  - `CashPaymentProcessor` for cash payments
  - `PaymentProcessorFactory` for processor selection

### 3. Waste Selling Flow
- **Issue**: No dedicated service for waste selling income
- **Solution**: Created separate `WasteSellingService` and `WasteSellingController`
- **Benefits**: 
  - Clear separation of concerns
  - Proper transaction handling
  - Audit trail for waste selling income

### 4. SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
- `PaymentService`: Handles payment processing only
- `WasteSellingService`: Handles waste selling income only
- `WalletService`: Handles wallet operations only
- Each payment processor handles one payment method

#### Open/Closed Principle (OCP)
- Payment processing is open for extension (new payment methods) but closed for modification
- New payment processors can be added without changing existing code

#### Liskov Substitution Principle (LSP)
- All payment processors implement the same interface and can be substituted

#### Interface Segregation Principle (ISP)
- Clean interfaces with focused responsibilities
- No client forced to depend on unused methods

#### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions (interfaces)
- Dependency injection used throughout

## API Endpoints

### Waste Selling
```
POST /api/waste/sell/{userId}?amount={amount}&wasteType={type}
```
- Adds money to user's wallet from waste selling
- Creates payment record for audit trail

### Payment Processing
```
POST /api/payments/process
```
- Processes payments using wallet, card, or cash
- Automatically selects appropriate processor

### Wallet Management
```
GET /api/payments/wallet/{userId}
```
- Returns current wallet balance

### Payment History
```
GET /api/payments/history/{userId}
```
- Returns payment history with proper categorization
- Distinguishes between income (waste selling) and expenses (payments)

## Flow Examples

### Waste Selling Flow
1. User sells waste → `WasteSellingController.sellWaste()`
2. Money added to wallet → `WalletService.updateWalletBalance()`
3. Payment record created → `PaymentRepository.save()`
4. Response returned with updated balance

### Payment Flow
1. User makes payment → `PaymentController.processPayment()`
2. Payment created → `Payment` entity
3. Appropriate processor selected → `PaymentProcessorFactory`
4. Payment processed → `WalletPaymentProcessor`/`CardPaymentProcessor`/`CashPaymentProcessor`
5. Payment saved → `PaymentRepository.save()`
6. Response returned

## Database Collections
- `wallets`: Stores user wallet information
- `payments`: Stores all payment transactions (both income and expenses)

## Key Benefits
1. **Clean Architecture**: Proper separation of concerns
2. **Maintainable Code**: Easy to add new payment methods
3. **Testable**: Each component can be tested independently
4. **Audit Trail**: Complete transaction history
5. **SOLID Compliance**: Follows all SOLID principles
6. **No Data Loss**: Proper transaction handling ensures data consistency

## Testing
- Created `PaymentFlowTest` to verify the complete flow
- Tests waste selling, wallet balance checking, and payment processing
- Verifies wallet balance updates correctly after transactions
