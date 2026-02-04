import { updateAccountDetails } from '../../features/user/userActions';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import React from 'react';
import { useForm } from 'react-hook-form';

export default function AccountForm({ user }) {
  const dispatch = useAppDispatch();
  const { myProfileLoading: loading ,myProfileError} = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    // The "Values" approach: Automatically syncs when Redux user data loads
    values: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // data contains { fullName, email }
      await dispatch(updateAccountDetails(data)).unwrap();
      alert('Account details updated!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        {myProfileError && (
        <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {myProfileError}
        </p>
      )}
      {/* Username Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-400">Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">@</span>
          <input
            type="text"
            className="w-full bg-black border border-neutral-700 pl-8 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            {...register('username', { required: "Username is required" })}
          />
        </div>
      </div>
      {/* Full Name Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-400">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          className={`bg-black border ${errors.fullName ? 'border-red-500' : 'border-neutral-700'} p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition`}
          {...register('fullName', {
            required: 'Full name is required',
            minLength: { value: 3, message: 'Name is too short' },
          })}
        />
        {errors.fullName && (
          <span className="text-red-500 text-xs">
            {errors.fullName.message}
          </span>
        )}
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-400">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className={`bg-black border ${errors.email ? 'border-red-500' : 'border-neutral-700'} p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition`}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={!isDirty || loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 px-8 py-3 rounded-full font-bold transition-all active:scale-95"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
