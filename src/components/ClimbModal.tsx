import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, XCircle } from 'lucide-react';

interface ClimbModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClimbModal: React.FC<ClimbModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 border-2 border-amber-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-black text-amber-400 tracking-wider">CLIMB MODE</h3>
            <p className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-1">Under Development</p>
            
            <p className="text-slate-300 text-sm mt-4 leading-relaxed">
              【クライムモード】は現在、大賢者マシスが禁忌の魔導書を解析して開発を進めています。<br />
              無限に強くなるモンスターと戦う、超極限の数式タワー。次回の魔術アップデートをお楽しみに！
            </p>
            
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              閉じる
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
