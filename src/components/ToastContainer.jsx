import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
export const ToastContainer = () => {
    const { toasts, removeToast } = useAdmin();
    if (toasts.length === 0)
        return null;
    return (<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
            const getIcon = () => {
                switch (toast.type) {
                    case 'success':
                        return <CheckCircle2 className="w-5 h-5 text-[#4A7A5E] shrink-0"/>;
                    case 'warning':
                        return <AlertTriangle className="w-5 h-5 text-[#B8863F] shrink-0"/>;
                    case 'danger':
                        return <AlertCircle className="w-5 h-5 text-[#A5432F] shrink-0"/>;
                    case 'info':
                    default:
                        return <Info className="w-5 h-5 text-[#5B7C99] shrink-0"/>;
                }
            };
            const getBorderColor = () => {
                switch (toast.type) {
                    case 'success':
                        return 'border-[#4A7A5E]/40 bg-white/95';
                    case 'warning':
                        return 'border-[#B8863F]/40 bg-white/95';
                    case 'danger':
                        return 'border-[#A5432F]/40 bg-white/95';
                    case 'info':
                    default:
                        return 'border-[#5B7C99]/40 bg-white/95';
                }
            };
            return (<div key={toast.id} className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg shadow-black/5 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 ${getBorderColor()}`}>
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-[#1A1A1A] leading-tight">
                {toast.title}
              </div>
              {toast.message && (<div className="text-xs text-[#6B6864] mt-1 leading-relaxed">
                  {toast.message}
                </div>)}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-[#6B6864] hover:text-[#1A1A1A] transition-colors p-1 -mr-1 -mt-1" aria-label="Dismiss notification">
              <X className="w-4 h-4"/>
            </button>
          </div>);
        })}
    </div>);
};
