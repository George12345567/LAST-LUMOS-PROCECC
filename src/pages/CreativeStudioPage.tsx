// ============================================
// CREATIVE STUDIO PAGE
// ============================================
// Main page wrapper for the Creative Studio

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CreativeStudio from '@/features/creative-studio/CreativeStudio';
import { toast } from 'sonner';

const CreativeStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  // Get params from URL
  const projectId = searchParams.get('projectId') || undefined;
  const clientId = searchParams.get('clientId') || undefined;
  const userId = searchParams.get('userId') || undefined;
  const initialTool = (searchParams.get('tool') as 'logo' | 'app') || 'logo';

  useEffect(() => {
    // Small delay for smooth transition
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Navigate back to the appropriate dashboard
    if (clientId) {
      navigate('/client-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSave = () => {
    toast.success('تم الحفظ بنجاح');
  };

  if (!isReady) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-white font-medium">جاري تحميل Creative Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <CreativeStudio
      projectId={projectId}
      clientId={clientId}
      userId={userId}
      initialTool={initialTool}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};

export default CreativeStudioPage;
