import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { loginUser } from '../features/auth/authActions.js';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { clearError, clearSuccess } from '../features/auth/authSlice.js';

export default function Login() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Clear state on mount and unmount
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    return () => dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const userInfo = {
        identifier: data.identifier,
        password: data.password,
      };

      await dispatch(loginUser(userInfo)).unwrap();
      // Check if there was a "previous page", otherwise go to home
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    } catch (err) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Welcome Back
      </h2>
      <p className="text-neutral-400 text-sm text-center mb-8">
        Please enter your details
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-6 animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          label="Username or Email"
          name="identifier"
          type="text"
          register={register}
          errors={errors}
          validation={{ required: 'Username or email is required' }}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          errors={errors}
          validation={{ required: 'Password is required' }}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
        <p className="text-neutral-400 text-sm">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-blue-500 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function InputField({ label, name, type, register, errors, validation }) {
  return (
    <div className="flex flex-col gap-1.5">
      <input
        type={type}
        placeholder={label}
        className={`bg-neutral-800 border ${
          errors[name] ? 'border-red-500' : 'border-neutral-700'
        } text-white p-3 rounded-xl outline-none focus:border-blue-500 transition text-sm`}
        {...register(name, validation)}
      />
      {errors[name] && (
        <span className="text-red-500 text-[10px] pl-1 font-medium">
          {errors[name].message}
        </span>
      )}
    </div>
  );
}
