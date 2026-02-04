import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { registerUser } from '../features/auth/authActions.js';
import { useNavigate, Link } from 'react-router-dom';
import { clearError, clearSuccess } from '../features/auth/authSlice.js';
import { useEffect, useState } from 'react';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  //error is what backend will send if login or registration failed
  const { loading, error } = useAppSelector((state) => state.auth);

  // Local state for image previews
  const [avatarPreview, setAvatarPreview] = useState(null);

  //watch avatar field to generate preview
  const avatarFile = watch('avatar');

  useEffect(() => {
    if (avatarFile && avatarFile[0]) {
      const url = URL.createObjectURL(avatarFile[0]);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'avatar' || key === 'coverImage') {
        if (data[key][0]) formData.append(key, data[key][0]);
      } else {
        formData.append(key, data[key]);
      }
    });
    try {
      await dispatch(registerUser(formData)).unwrap();
      navigate('/auth/login');
    } catch (err) {
      
      window.scrollTo({ top: 0, behavior: 'smooth' }); //if we are at the end of page, error at the top will be invisible to us so it will move to the top if we catch an error
    }
  };


  return (
    <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Create Account
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-6 animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Avatar Preview & Input */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden mb-2 relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs text-center p-2">
                Photo
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="text-xs text-neutral-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            {...register('avatar', { required: 'Avatar is required' })}
          />
          {errors.avatar && (
            <span className="text-red-500 text-[10px] mt-1">
              {errors.avatar.message}
            </span>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Full Name"
            name="fullName"
            type="text"
            register={register}
            errors={errors}
            validation={{ required: 'Full name is required' }}
          />

          <InputField
            label="Username"
            name="username"
            type="text"
            register={register}
            errors={errors}
            validation={{ required: 'Username is required' }}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
            validation={{
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
            }}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            errors={errors}
            validation={{
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-neutral-400 text-center mt-6 text-sm">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-blue-500 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}

// Reusable Input Sub-component
function InputField({ label, name, type, register, errors, validation }) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type={type}
        placeholder={label}
        className={`bg-neutral-800 border ${errors[name] ? 'border-red-500' : 'border-neutral-700'} text-white p-3 rounded-xl outline-none focus:border-blue-500 transition text-sm`}
        {...register(name, validation)}
      />
      {errors[name] && (
        <span className="text-red-500 text-[10px] pl-1">
          {errors[name].message}
        </span>
      )}
    </div>
  );
}
