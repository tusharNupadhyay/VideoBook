import { useState } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'; // Install react-icons if you haven't


export default function PasswordField({ label, name, register, errors, validation }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-400">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full bg-black border border-neutral-700 p-3 pr-12 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
          {...register(name, validation)}
        />
        {/* The Manual Eye Icon */}
        <button
          type="button" // Important: prevents form submission
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
        >
          {show ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
        </button>
      </div>
      {errors[name] && (
        <span className="text-red-500 text-xs">{errors[name].message}</span>
      )}
    </div>
  );
}