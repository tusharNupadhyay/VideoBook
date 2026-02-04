import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useForm } from 'react-hook-form';
import { updatePassword } from '../../features/user/userActions';
import PasswordField from './PasswordField';

export default function PasswordForm() {
  const dispatch = useAppDispatch();
  const { myProfileLoading, myProfileError } = useAppSelector(
    (state) => state.user
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Watch the "newPassword" field to compare it with "confirmPassword"
  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      // We only send oldPassword and newPassword to the backend
      await dispatch(
        updatePassword({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        })
      ).unwrap();

      alert('Password updated successfully!');
      reset(); // Clear the form on success
    } catch (error) {
      console.error('Password update failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6 ">
      {myProfileError && (
        <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {myProfileError}
        </p>
      )}

      {/* Old Password */}
      <PasswordField
        label="Current Password"
        name="oldPassword"
        register={register}
        errors={errors}
        validation={{ required: 'Current password is required' }}
      />

      <hr className="border-neutral-800 my-2" />

      {/* New Password */}
      <PasswordField
        label="New Password"
        name="newPassword"
        register={register}
        errors={errors}
        validation={{
          required: 'New password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        }}
      />

      {/* Confirm Password */}
      <PasswordField
        label="Confirm New Password"
        name="confirmPassword"
        register={register}
        errors={errors}
        validation={{
          required: 'Please confirm your password',
          validate: (value) =>
            value === newPasswordValue || 'Passwords do not match',
        }}
      />

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isDirty || myProfileLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 px-8 py-3 rounded-full font-bold transition-all active:scale-95"
        >
          {myProfileLoading ? 'Updating...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
