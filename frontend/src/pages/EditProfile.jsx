import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  IoPersonOutline,
  IoImageOutline,
  IoLockClosedOutline,
  IoArrowBackOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import AccountForm from '../components/editProfile/AccountForm';
import AvatarForm from '../components/editProfile/AvatarForm';
import CoverImageForm from '../components/editProfile/CoverImageForm';
import PasswordForm from '../components/editProfile/PasswordForm';

export default function EditProfile() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account Info', icon: <IoPersonOutline /> },
    { id: 'branding', label: 'Branding', icon: <IoImageOutline /> },
    { id: 'password', label: 'Security', icon: <IoLockClosedOutline /> },
  ];
  return (
    <div className="flex-1 bg-[#0f0f0f] text-white min-h-screen">
      {/* --- Header Section --- */}
      <div className="border-b border-neutral-800 p-4 md:px-10 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-neutral-800 rounded-full transition"
        >
          <IoArrowBackOutline size={24} />
        </button>
        <h1 className="text-xl font-bold">Channel Customization</h1>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-10 flex flex-col md:flex-row gap-10">
        {/* --- Sidebar Navigation --- */}
        <aside className="w-full md:w-64 flex md:flex-col gap-2 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* --- Dynamic Form Content --- */}
        <main className="flex-1 bg-neutral-900/40 p-6 md:p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm">
          {activeTab === 'account' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-2xl font-bold mb-1">Basic Information</h2>
              <p className="text-neutral-500 text-sm mb-8">
                Update your name and email address.
              </p>
              <AccountForm user={userInfo} />
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-2xl font-bold mb-1">Branding</h2>
              <p className="text-neutral-500 text-sm mb-8">
                Customize your profile picture and banner image.
              </p>
              <div className="space-y-12">
                <div className="border-b border-neutral-800 pb-10">
                  <h3 className="text-xl font-semibold mb-6">
                    Profile Picture
                  </h3>
                  <AvatarForm user={userInfo} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-6">Banner Image</h3>
                  <CoverImageForm user={userInfo} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-2xl font-bold mb-1">Security</h2>
              <p className="text-neutral-500 text-sm mb-8">
                Ensure your account is using a secure password.
              </p>
              <PasswordForm />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
