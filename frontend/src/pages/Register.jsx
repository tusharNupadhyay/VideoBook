import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { registerUser } from '../features/auth/authActions.js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  clearError,
  clearSuccess,
} from '../features/auth/authSlice.js';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //error is what backend will send if login or registration failed
  const { loading, success, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      navigate('/auth/login');
      dispatch(clearSuccess());
      dispatch(clearError());
    }
  }, [navigate, success, dispatch]);

  const onSubmit = async (data) => {
    const formData = new FormData(); //formData is needed for file uploads

    formData.append('fullName', data.fullName);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('avatar', data.avatar[0]);
    if (data?.coverImage?.[0]) {
      formData.append('coverImage', data.coverImage[0]);
    }
    dispatch(registerUser(formData));
  };

  const registerOptions = {
    name: { required: 'Name is required' },
    username: { required: 'Username is required' },
    email: { required: 'Email is required' },
    password: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must have at least 8 characters',
      },
    },
  };

  return (
    <>
      {error && (
        <div className="text-red-600 p-2 bg-red-100 border border-red-300 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4 max-w-md w-full"
      >
        {errors.name && (
          <small className="text-red-500 mb-0 ">{errors.name.message}</small>
        )}
        <input
          type="text"
          placeholder="Full Name"
          className="border p-2 w-full"
          {...register('fullName', registerOptions.name)}
        />

        {errors.username && (
          <small className="text-red-500 mb-0 ">
            {errors.username.message}
          </small>
        )}
        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full"
          {...register('username', registerOptions.username)}
        />

        {errors.email && (
          <small className="text-red-500 mb-0 ">{errors.email.message}</small>
        )}
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          {...register('email', registerOptions.email)}
        />

        {errors.password && (
          <small className="text-red-500 mb-0 ">
            {errors.password.message}
          </small>
        )}
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          {...register('password', registerOptions.password)}
        />

        <label className="font-semibold mb-0">Avatar (required)</label>
        <input
          type="file"
          accept="image/*"
          className="border p-2"
          {...register('avatar', { required: 'Profile picture is required' })}
        />
        {errors.avatar && (
          <small className="text-red-500 mt-0">{errors.avatar.message}</small>
        )}
        <label className="font-semibold mb-0">Cover Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          className="border p-2"
          {...register('coverImage')}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      <p className="p-2 font-medium">OR</p>
      <button
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full"
        onClick={() => {
          dispatch(clearError());
          dispatch(clearSuccess());
          navigate('/auth/login');
        }}
      >
        Login
      </button>
    </>
  );
}
