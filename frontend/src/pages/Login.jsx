import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { loginUser } from '../features/auth/authActions.js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  clearError,
  clearSuccess,
} from '../features/auth/authSlice.js';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { loading, success, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      navigate('/');
      dispatch(clearSuccess());
      dispatch(clearError());
    }
  }, [navigate, success, dispatch]);

  const onSubmit = async (data) => {
    const userInfo = {
      identifier: data.identifier,
      password: data.password,
    };

    dispatch(loginUser(userInfo));
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
        {errors.identifier && (
          <small className="text-red-500 mb-0 ">
            {errors.identifier.message}
          </small>
        )}
        <input
          placeholder="Username or Email"
          className="border p-2 w-full"
          {...register('identifier', {
            required: 'username or email is required',
          })}
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
          {...register('password', { required: 'password is required' })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="p-2 font-medium">OR</p>
      <button
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full"
        onClick={() => {
          dispatch(clearError());
          dispatch(clearSuccess());
          navigate('/auth/register');
        }}
      >
        Register
      </button>
    </>
  );
}
