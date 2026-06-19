import React from 'react';
import { Wallet, Loader2 } from 'lucide-react';

interface WalletOptionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  isConnecting?: boolean;
}

export default function WalletOptionButton({
  onClick,
  disabled = false,
  label,
  isConnecting = false,
}: WalletOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isConnecting}
      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50"
    >
      {isConnecting ? (
        <Loader2 size={14} className="animate-spin text-primary" />
      ) : (
        <Wallet size={14} className="text-primary" />
      )}
      <span>{label}</span>
    </button>
  );
}
