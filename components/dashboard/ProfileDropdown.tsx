'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Camera, Loader2, X, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/Toast';

export default function ProfileDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || '');
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Sync state with props when user data changes (e.g. after update + refresh)
  useEffect(() => {
    setName(user.name || '');
    setImage(user.image || '');
  }, [user.name, user.image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
        showToast('File size too large. Please select an image under 2MB.', 'error');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await authClient.updateUser({
        name: name,
        image: image,
      });
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
      router.refresh();
    } catch (error) {
      console.error('Update profile error:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 border-[3px] border-black bg-white hover:bg-brutalist-yellow transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <div className="w-10 h-10 border-[2px] border-black bg-brutalist-cyan overflow-hidden flex items-center justify-center">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-black" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[10px] font-black uppercase opacity-60 leading-none">Account</p>
          <p className="text-xs font-black uppercase truncate max-w-[100px]">{user.name || 'User'}</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
          >
            {!isEditing ? (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-[3px] border-black">
                  <div className="w-16 h-16 border-[3px] border-black bg-brutalist-yellow flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase leading-none">{user.name || 'User'}</h3>
                    <p className="text-xs font-bold opacity-60 mt-1">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center gap-3 p-3 border-[3px] border-black font-black uppercase text-xs hover:bg-brutalist-cyan transition-colors"
                  >
                    <Settings size={18} />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 border-[3px] border-black font-black uppercase text-xs hover:bg-brutalist-magenta hover:text-white transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-brutalist-yellow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl uppercase tracking-tighter">Edit Profile</h3>
                  <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-white border-[2px] border-transparent hover:border-black">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4 py-4 border-b-[3px] border-black">
                    <div className="w-24 h-24 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden flex items-center justify-center relative group">
                      {image ? (
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="opacity-20" />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                      )}
                    </div>
                    
                    <label className="cursor-pointer brutalist-button bg-white text-xs py-2 px-4 flex items-center gap-2 hover:bg-brutalist-cyan">
                      <Camera size={16} />
                      {image ? 'CHANGE PHOTO' : 'CHOOSE PHOTO'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-2 border-[3px] border-black text-xs font-bold outline-none focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full brutalist-button bg-black text-white py-3 flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Check size={18} />
                        SAVE CHANGES
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
