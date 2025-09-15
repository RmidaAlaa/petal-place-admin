import React from 'react';
import Navigation from '@/components/Navigation';
import UserProfile from '@/components/UserProfile';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <UserProfile />
    </div>
  );
};

export default Profile;