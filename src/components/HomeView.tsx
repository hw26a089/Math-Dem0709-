import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sword, Flame, Lock, History, Activity, Trophy } from 'lucide-react';

interface HomeViewProps {
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (diff: 'easy' | 'normal' | 'hard') => void;
  onStartStory: () => void;
  onOpenRecords: () => void;
  onOpenClimb: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  difficulty,
  setDifficulty,
  onStartStory,
  onOpenRecords,
  onOpenClimb
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto"
    >
      {/* 難易度選択パネル（ホーム上部） */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-5 mb-8 shadow-2xl backdrop-blur-sm">
        <p className="text-[10px] text-center text-sky-400 font-bold uppercase tracking-widest mb-3.5">
          ✦ 魔導難易度の設定 ✦
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'normal', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`py-2 px-3 rounded-xl text-xs font-black tracking-wider border transition-all cursor-pointer ${
                difficulty === diff
                  ? diff === 'easy'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : diff === 'normal'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                    : 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {diff === 'easy' && 'イージー'}
              {diff === 'normal' && 'ノーマル'}
              {diff === 'hard' && 'ハード'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-3.5 leading-relaxed font-mono">
          {difficulty === 'easy' && '制限時間 60秒 ｜ 1桁・2つのやさしい計算（かっこ無し）'}
          {difficulty === 'normal' && '制限時間 40秒 ｜ 1桁・3つの組み合わせ計算'}
          {difficulty === 'hard' && '制限時間 25秒 ｜ 1桁と2桁が混ざった高難度計算'}
        </p>
      </div>

      {/* タイトルと装飾 */}
      <div className="text-center mb-8 relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 opacity-20 blur-xl" />
        <div className="flex items-center justify-center gap-2 text-sky-400 mb-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs uppercase font-black tracking-widest font-mono">MAGIC MATH ADVENTURE</span>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white bg-clip-text bg-gradient-to-b from-white to-slate-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          魔導計算パズル
        </h1>
        <p className="text-xs text-slate-400 mt-2 tracking-wide">
          手書きで数式を描き、古代の魔物たちと戦う魔法使いの物語。
        </p>
      </div>

      {/* メニューボタン一覧 */}
      <div className="w-full max-w-sm flex flex-col gap-3.5">
        {/* ストーリーモード */}
        <button
          onClick={onStartStory}
          className="group relative w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 p-0.5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="bg-slate-950 group-hover:bg-transparent transition-colors px-6 py-4 rounded-[14px] flex items-center justify-between text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                <Sword className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-white text-base tracking-wide">ストーリーモード</h2>
                <p className="text-[10px] text-slate-400 group-hover:text-sky-100 transition-colors mt-0.5">
                  妖精たちの計算魔物と手書き魔法で戦う
                </p>
              </div>
            </div>
            <Trophy className="w-5 h-5 text-sky-400 group-hover:text-white group-hover:scale-110 transition-all opacity-70 group-hover:opacity-100" />
          </div>
        </button>

        {/* クライムモード (ロック中) */}
        <button
          onClick={onOpenClimb}
          className="group w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-0.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <div className="px-6 py-4 rounded-2xl flex items-center justify-between text-left">
            <div className="flex items-center gap-4 opacity-50">
              <div className="p-3 rounded-xl bg-slate-950 text-slate-500">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-400 text-base tracking-wide">クライムモード</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  無限の数式タワーを登る (開発中)
                </p>
              </div>
            </div>
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
        </button>

        {/* 学習記録 */}
        <button
          onClick={onOpenRecords}
          className="group relative w-full bg-slate-900 border border-slate-800 hover:border-sky-500/30 p-0.5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="bg-slate-950 group-hover:bg-slate-900/40 transition-colors px-6 py-4 rounded-[14px] flex items-center justify-between text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-white text-base tracking-wide">学習記録</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  学習時間、妖精の正答率、苦手チャートを見る
                </p>
              </div>
            </div>
            <Activity className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-all opacity-70 group-hover:opacity-100" />
          </div>
        </button>
      </div>
    </motion.div>
  );
};
