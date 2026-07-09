import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ArrowLeft, Clock, Award, Activity, Shield, Dices } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { StudyLog } from '../types';

interface RecordsViewProps {
  logs: StudyLog[];
  onBack: () => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({ logs, onBack }) => {
  const [activePeriod, setActivePeriod] = useState<'today' | 'week' | 'month'>('week');

  const getFilteredLogs = (period: 'today' | 'week' | 'month') => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let cutoff = now - oneDay;
    
    if (period === 'week') {
      cutoff = now - 7 * oneDay;
    } else if (period === 'month') {
      cutoff = now - 30 * oneDay;
    } else {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      cutoff = todayStart.getTime();
    }
    return logs.filter(log => log.timestamp >= cutoff);
  };

  const getStats = (period: 'today' | 'week' | 'month') => {
    const filtered = getFilteredLogs(period);
    const totalTime = filtered.reduce((acc, log) => acc + log.durationSeconds, 0);
    const totalCount = filtered.length;
    const correctCount = filtered.filter(log => log.isCorrect).length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    // 妖精（モンスター）ごとの集計
    const getEnemyStats = (icon: 'slime' | 'golem' | 'demon' | 'dragon') => {
      const enemyLogs = filtered.filter(log => log.enemyIcon === icon);
      const enemyCount = enemyLogs.length;
      const enemyCorrect = enemyLogs.filter(log => log.isCorrect).length;
      const enemyAccuracy = enemyCount > 0 ? Math.round((enemyCorrect / enemyCount) * 100) : 0;
      return { count: enemyCount, accuracy: enemyAccuracy };
    };

    const slimeStats = getEnemyStats('slime');
    const golemStats = getEnemyStats('golem');
    const demonStats = getEnemyStats('demon');
    const dragonStats = getEnemyStats('dragon');

    // レーダーチャート用データ
    const chartData = [
      { subject: 'たし算 (スライム)', accuracy: slimeStats.accuracy },
      { subject: 'ひき算 (ゴーレム)', accuracy: golemStats.accuracy },
      { subject: 'かけ算 (ミミック)', accuracy: demonStats.accuracy },
      { subject: 'わり算 (ドラゴン)', accuracy: dragonStats.accuracy },
    ];

    return {
      totalTime,
      totalCount,
      accuracy,
      slime: slimeStats,
      golem: golemStats,
      demon: demonStats,
      dragon: dragonStats,
      chartData
    };
  };

  const currentStats = getStats(activePeriod);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}分 ${secs}秒`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}時間 ${remainingMins}分 ${secs}秒`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-start p-4 md:p-6 overflow-y-auto"
    >
      {/* 上部ヘッダー */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームへ戻る
        </button>
        <h2 className="text-sm md:text-lg font-black tracking-wider text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          魔導の学習記録
        </h2>
        <div className="w-12 md:w-24" /> {/* バランス保持用 */}
      </div>

      {/* 期間選択タブ */}
      <div className="flex bg-slate-900 p-1 rounded-xl mb-6 shadow-inner border border-slate-800">
        {(['today', 'week', 'month'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activePeriod === period
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {period === 'today' && '今日'}
            {period === 'week' && '一週間'}
            {period === 'month' && '一ヶ月'}
          </button>
        ))}
      </div>

      {/* 集計グリッド */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        
        {/* 左：基本統計数値 */}
        <div className="md:col-span-4 flex flex-col gap-4">
          
          {/* 総学習時間 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">総学習時間</p>
              <p className="text-base md:text-lg font-black text-white mt-0.5">{formatTime(currentStats.totalTime)}</p>
            </div>
          </div>

          {/* 正答率 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">魔導正答率</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{currentStats.accuracy}%</p>
            </div>
          </div>

          {/* 総解答数 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">総解答数</p>
              <p className="text-xl font-black text-sky-400 mt-0.5">{currentStats.totalCount} 回</p>
            </div>
          </div>

        </div>

        {/* 中：レーダーチャート */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between items-center relative min-h-[300px]">
          <div className="w-full">
            <h3 className="text-xs font-black text-slate-300 tracking-wider">苦手系統分析（レーダーチャート）</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">
              チャートが凹んでいる部分が苦手な系統です。重点的に修行して魔導を極めましょう！
            </p>
          </div>

          {currentStats.totalCount > 0 ? (
            <div className="w-full h-60 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentStats.chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                  <Radar
                    name="正答率"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    fill="#4f46e5"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Dices className="w-12 h-12 stroke-1 mb-2 animate-bounce" />
              <p className="text-xs font-bold">まだ魔術修行ログがありません。</p>
              <p className="text-[10px] text-slate-400 mt-1">ストーリーモードで計算問題を解くと自動で集計されます！</p>
            </div>
          )}
        </div>

      </div>

      {/* 下：妖精ごとの詳細進捗 */}
      <div className="w-full max-w-4xl bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-lg mb-6">
        <h3 className="text-sm font-black text-white tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          各妖精モンスターの学習攻略
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. スライム */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                <svg viewBox="0 0 100 100" className="w-7 h-7">
                  <path d="M15,70 C15,40 35,25 50,25 C65,25 85,40 85,70 C85,85 70,90 50,90 C30,90 15,85 15,70 Z" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-white">ひよっこスライム</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">たし算魔道</p>
              </div>
            </div>
            <div className="text-right flex-1 max-w-[140px]">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                <span className="text-teal-400">正答率 {currentStats.slime.accuracy}%</span>
                <span className="text-slate-400 font-mono text-[9px]">{currentStats.slime.count}回</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${currentStats.slime.accuracy}%` }} />
              </div>
            </div>
          </div>

          {/* 2. ゴーレム */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400 border border-slate-500/20">
                <svg viewBox="0 0 100 100" className="w-7 h-7">
                  <rect x="30" y="20" width="40" height="25" rx="6" fill="currentColor" />
                  <rect x="20" y="50" width="60" height="35" rx="8" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-white">ゴーレムパズル</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">ひき算魔道</p>
              </div>
            </div>
            <div className="text-right flex-1 max-w-[140px]">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                <span className="text-slate-300">正答率 {currentStats.golem.accuracy}%</span>
                <span className="text-slate-400 font-mono text-[9px]">{currentStats.golem.count}回</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${currentStats.golem.accuracy}%` }} />
              </div>
            </div>
          </div>

          {/* 3. ミミック */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <svg viewBox="0 0 100 100" className="w-7 h-7">
                  <polygon points="30,25 70,25 75,65 50,85 25,65" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-white">トリックミミック</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">かけ算魔道</p>
              </div>
            </div>
            <div className="text-right flex-1 max-w-[140px]">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                <span className="text-amber-400">正答率 {currentStats.demon.accuracy}%</span>
                <span className="text-slate-400 font-mono text-[9px]">{currentStats.demon.count}回</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${currentStats.demon.accuracy}%` }} />
              </div>
            </div>
          </div>

          {/* 4. ドラゴン */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                <svg viewBox="0 0 120 120" className="w-7 h-7">
                  <ellipse cx="60" cy="75" rx="25" ry="30" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-white">カオスドラゴン</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">わり算魔道</p>
              </div>
            </div>
            <div className="text-right flex-1 max-w-[140px]">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                <span className="text-red-400">正答率 {currentStats.dragon.accuracy}%</span>
                <span className="text-slate-400 font-mono text-[9px]">{currentStats.dragon.count}回</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${currentStats.dragon.accuracy}%` }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
