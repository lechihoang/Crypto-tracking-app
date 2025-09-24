'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader } from 'lucide-react';

const AddHoldingSchema = z.object({
  coinId: z.string().min(1, 'Vui lòng chọn coin'),
  coinSymbol: z.string().min(1, 'Symbol không được để trống'),
  coinName: z.string().min(1, 'Tên coin không được để trống'),
  quantity: z.number().min(0.00000001, 'Số lượng phải lớn hơn 0'),
  averageBuyPrice: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type AddHoldingFormData = z.infer<typeof AddHoldingSchema>;

interface AddHoldingFormProps {
  isSubmitting: boolean;
  onSubmit: (data: AddHoldingFormData) => void;
  onCancel: () => void;
  setValue: (field: keyof AddHoldingFormData, value: string | number) => void;
}

export default function AddHoldingForm({
  isSubmitting,
  onSubmit,
  onCancel,
  setValue: setFormValue
}: AddHoldingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddHoldingFormData>({
    resolver: zodResolver(AddHoldingSchema),
  });

  // Sync with parent setValue
  React.useEffect(() => {
    Object.assign(setValue, setFormValue);
  }, [setValue, setFormValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng
        </label>
        <input
          {...register('quantity', { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="0.00000000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
        )}
      </div>

      {/* Average Buy Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giá mua trung bình (USD) - Tùy chọn
        </label>
        <input
          {...register('averageBuyPrice', { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.averageBuyPrice && (
          <p className="mt-1 text-sm text-red-600">{errors.averageBuyPrice.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú - Tùy chọn
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Thêm ghi chú về holding này..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <Loader className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            'Thêm Holding'
          )}
        </button>
      </div>
    </form>
  );
}