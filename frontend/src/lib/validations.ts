import { z } from 'zod';

// Auth schemas
export const SignInSchema = z.object({
  email: z.string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z.string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const SignUpSchema = z.object({
  fullName: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  email: z.string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
  confirmPassword: z.string()
    .min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const ForgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
});

export const ResetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
  confirmPassword: z.string()
    .min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
  confirmPassword: z.string()
    .min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// Portfolio schemas
export const AddPortfolioItemSchema = z.object({
  coinId: z.number()
    .positive('Coin ID phải là số dương'),
  coinSymbol: z.string()
    .min(1, 'Symbol không được để trống')
    .max(20, 'Symbol không được quá 20 ký tự'),
  coinName: z.string()
    .min(1, 'Tên coin không được để trống')
    .max(100, 'Tên coin không được quá 100 ký tự'),
  quantity: z.number()
    .positive('Số lượng phải lớn hơn 0'),
  avgPrice: z.number()
    .positive('Giá trung bình phải lớn hơn 0'),
});

export const UpdatePortfolioItemSchema = z.object({
  quantity: z.number()
    .positive('Số lượng phải lớn hơn 0')
    .optional(),
  avgPrice: z.number()
    .positive('Giá trung bình phải lớn hơn 0')
    .optional(),
});

// Watchlist schemas
export const AddWatchlistItemSchema = z.object({
  coinId: z.number()
    .positive('Coin ID phải là số dương'),
  coinSymbol: z.string()
    .min(1, 'Symbol không được để trống')
    .max(20, 'Symbol không được quá 20 ký tự'),
  coinName: z.string()
    .min(1, 'Tên coin không được để trống')
    .max(100, 'Tên coin không được quá 100 ký tự'),
});

// Price Alert schemas
export const CreatePriceAlertSchema = z.object({
  coinId: z.number()
    .positive('Coin ID phải là số dương'),
  coinSymbol: z.string()
    .min(1, 'Symbol không được để trống')
    .max(20, 'Symbol không được quá 20 ký tự'),
  coinName: z.string()
    .min(1, 'Tên coin không được để trống')
    .max(100, 'Tên coin không được quá 100 ký tự'),
  condition: z.enum(['above', 'below'], {
    message: 'Điều kiện phải là "trên" hoặc "dưới"',
  }),
  targetPrice: z.number()
    .positive('Giá mục tiêu phải lớn hơn 0'),
});

export const UpdatePriceAlertSchema = z.object({
  condition: z.enum(['above', 'below'], {
    message: 'Điều kiện phải là "trên" hoặc "dưới"',
  }).optional(),
  targetPrice: z.number()
    .positive('Giá mục tiêu phải lớn hơn 0')
    .optional(),
  isActive: z.boolean().optional(),
});

// Type exports
export type SignInFormData = z.infer<typeof SignInSchema>;
export type SignUpFormData = z.infer<typeof SignUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
export type AddPortfolioItemFormData = z.infer<typeof AddPortfolioItemSchema>;
export type UpdatePortfolioItemFormData = z.infer<typeof UpdatePortfolioItemSchema>;
export type AddWatchlistItemFormData = z.infer<typeof AddWatchlistItemSchema>;
export type CreatePriceAlertFormData = z.infer<typeof CreatePriceAlertSchema>;
export type UpdatePriceAlertFormData = z.infer<typeof UpdatePriceAlertSchema>;