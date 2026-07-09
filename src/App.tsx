import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { recognizeHandwrittenNumber } from './lib/localOcr';
import {
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sword,
  Heart,
  Play,
  Plus,
  Compass,
  Mail,
  MailOpen,
  Clock,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Question, Stage, StudyLog } from './types';
import { HomeView } from './components/HomeView';
import { RecordsView } from './components/RecordsView';
import { ClimbModal } from './components/ClimbModal';


const STAGES: Stage[] = [
  {
    number: 1,
    name: "第一ステージ：はじまりの森",
    category: "たし算魔法パズル",
    enemyName: "ひよっこスライム",
    enemyMaxHp: 40,
    enemyIcon: 'slime'
  },
  {
    number: 2,
    name: "第二ステージ：いにしえの遺跡",
    category: "ひき算古代パズル",
    enemyName: "ゴーレムパズル",
    enemyMaxHp: 60,
    enemyIcon: 'golem'
  },
  {
    number: 3,
    name: "第三ステージ：まやかしの洞窟",
    category: "かけ算幻影パズル",
    enemyName: "トリックミミック",
    enemyMaxHp: 80,
    enemyIcon: 'demon'
  },
  {
    number: 4,
    name: "最終ステージ：漆黒の玉座",
    category: "わり算終焉パズル",
    enemyName: "カオスドラゴン",
    enemyMaxHp: 100,
    enemyIcon: 'dragon'
  }
];

// 動的計算問題の自動生成ロジック
function generateQuestion(difficulty: 'easy' | 'normal' | 'hard', enemyIcon: 'slime' | 'golem' | 'demon' | 'dragon'): Question {
  let questionText = "";
  let expectedAnswer = "";
  let hint = "";

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (enemyIcon === 'slime') { // たし算
    if (difficulty === 'easy') {
      const a = rand(1, 9);
      const b = rand(1, 9);
      questionText = `${a} + ${b} = ?`;
      expectedAnswer = String(a + b);
      hint = `${a} に ${b} を足すと、いくつになるかな？ 合わせて数えてみよう！`;
    } else if (difficulty === 'normal') {
      const a = rand(1, 9);
      const b = rand(1, 9);
      const c = rand(1, 9);
      questionText = `${a} + ${b} + ${c} = ?`;
      expectedAnswer = String(a + b + c);
      hint = `まずは左の ${a} + ${b} = ${a + b} を計算して、その答えに ${c} を足してみよう！`;
    } else {
      // ハード：一桁と二桁をまぜた問題
      const isTwoDigitFirst = Math.random() > 0.5;
      if (isTwoDigitFirst) {
        const a = rand(10, 89);
        const b = rand(2, 9);
        questionText = `${a} + ${b} = ?`;
        expectedAnswer = String(a + b);
        hint = `${a} に 1桁の数 ${b} を足してみよう。一の位どうしの計算（${a % 10} + ${b}）に注目してね。`;
      } else {
        const a = rand(2, 9);
        const b = rand(10, 89);
        questionText = `${a} + ${b} = ?`;
        expectedAnswer = String(a + b);
        hint = `1桁の数 ${a} に二桁の ${b} を足してみよう。${b} ＋ ${a} と入れ替えて考えると計算しやすいよ！`;
      }
    }
  } else if (enemyIcon === 'golem') { // ひき算
    if (difficulty === 'easy') {
      const b = rand(1, 9);
      const ans = rand(1, 9);
      const a = b + ans; // 確実に答えが正の1桁
      questionText = `${a} - ${b} = ?`;
      expectedAnswer = String(ans);
      hint = `${a} から ${b} を引くと、残りはいくつになるかな？`;
    } else if (difficulty === 'normal') {
      // 1桁3つ
      const c = rand(1, 5);
      const b = rand(1, 6);
      const ans = rand(1, 8);
      const a = b + c + ans;
      questionText = `${a} - ${b} - ${c} = ?`;
      expectedAnswer = String(ans);
      hint = `まずは ${a} から ${b} を引いて ${a - b} にし、その答えからさらに ${c} を引いてみよう！`;
    } else {
      // ハード：一桁と二桁をまぜた問題
      const a = rand(11, 99); // 2桁
      const b = rand(2, 9); // 1桁
      questionText = `${a} - ${b} = ?`;
      expectedAnswer = String(a - b);
      hint = `${a} から 1桁の ${b} を引いてみよう。一の位から引けないときは、十の位から 10 を借りてきて考えてみてね！`;
    }
  } else if (enemyIcon === 'demon') { // かけ算
    if (difficulty === 'easy') {
      const a = rand(1, 9);
      const b = rand(1, 9);
      questionText = `${a} × ${b} = ?`;
      expectedAnswer = String(a * b);
      hint = `かけ算九九の「${a}」の段を思い出してみよう。 ${a} が ${b} つ分あるよ！`;
    } else if (difficulty === 'normal') {
      const a = rand(2, 5);
      const b = rand(2, 5);
      const c = rand(1, 9);
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        questionText = `${a} × ${b} + ${c} = ?`;
        expectedAnswer = String(a * b + c);
        hint = `たし算よりも「かけ算（${a} × ${b} = ${a * b}）」を先に計算して、その答えに ${c} を足しよう！`;
      } else {
        const cSub = rand(1, a * b - 1);
        questionText = `${a} × ${b} - ${cSub} = ?`;
        expectedAnswer = String(a * b - cSub);
        hint = `たし算ひき算よりも「かけ算（${a} × ${b} = ${a * b}）」を先に計算して、その答えから ${cSub} を引こう！`;
      }
    } else {
      // ハード：一桁と二桁をまぜた問題
      const isTwoDigitFirst = Math.random() > 0.5;
      if (isTwoDigitFirst) {
        const a = rand(11, 19); // 2桁
        const b = rand(2, 9); // 1桁
        questionText = `${a} × ${b} = ?`;
        expectedAnswer = String(a * b);
        hint = `2桁の ${a} に 1桁の ${b} をかける問題だよ。${a} を 10 と ${a - 10} に分けて、それぞれに ${b} をかけて足してみよう！（${10 * b} + ${(a-10) * b}）`;
      } else {
        const a = rand(2, 9); // 1桁
        const b = rand(11, 19); // 2桁
        questionText = `${a} × ${b} = ?`;
        expectedAnswer = String(a * b);
        hint = `1桁の ${a} に 2桁の ${b} をかける問題だよ。${b} × ${a} と順序を入れ替えて筆算のように計算してみよう！`;
      }
    }
  } else { // わり算 (dragon)
    if (difficulty === 'easy') {
      const b = rand(1, 9);
      const ans = rand(1, 9);
      const a = b * ans;
      questionText = `${a} ÷ ${b} = ?`;
      expectedAnswer = String(ans);
      hint = `${b} に何をかけたら ${a} になるか、かけ算九九から逆算してみよう！`;
    } else if (difficulty === 'normal') {
      const b = rand(2, 9);
      const divAns = rand(1, 9);
      const a = b * divAns;
      const c = rand(1, 9);
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        questionText = `${a} ÷ ${b} + ${c} = ?`;
        expectedAnswer = String(divAns + c);
        hint = `「わり算（${a} ÷ ${b} = ${divAns}）」を先に計算してから、その答えに ${c} を足そう！`;
      } else {
        const cSub = rand(1, divAns);
        questionText = `${a} ÷ ${b} - ${cSub} = ?`;
        expectedAnswer = String(divAns - cSub);
        hint = `「わり算（${a} ÷ ${b} = ${divAns}）」を先に計算してから、その答えから ${cSub} を引こう！`;
      }
    } else {
      // ハード：一桁と二桁をまぜた問題
      const isTwoDigitDivisor = Math.random() > 0.5;
      if (isTwoDigitDivisor) {
        const ans = rand(2, 9); // 1桁
        const b = rand(11, 25); // 2桁の割る数
        const a = b * ans;
        questionText = `${a} ÷ ${b} = ?`;
        expectedAnswer = String(ans);
        hint = `2桁の数 ${b} で割る問題だよ。${b} × 答え ＝ ${a} になる。十の位に注目して、何倍くらいになるか予想してみよう！`;
      } else {
        const ans = rand(11, 25); // 2桁の答え
        const b = rand(3, 9); // 1桁の割る数
        const a = b * ans;
        questionText = `${a} ÷ ${b} = ?`;
        expectedAnswer = String(ans);
        hint = `1桁の数 ${b} で割って、答えが2桁になる問題だよ。まずは百の位と十の位に注目して商を立ててみよう！`;
      }
    }
  }

  return { questionText, expectedAnswer, hint };
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'playing' | 'records'>('home');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ questionText: "8 + 5 = ?", expectedAnswer: "13", hint: "8に5をたすと13になります。" });
  const [timeLeft, setTimeLeft] = useState(40);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [showClimbModal, setShowClimbModal] = useState(false);

  const [stageIdx, setStageIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  
  // バトルステート
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(STAGES[0].enemyMaxHp);
  const [enemyAction, setEnemyAction] = useState<'idle' | 'attack' | 'damage'>('idle');

  // 手書き・認識関連
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("画面全体に答えを手書きしてください！");
  
  // アイテムシステム
  const [potionsCount, setPotionsCount] = useState(1); // 初期状態で1個所持
  const [showDropNotification, setShowDropNotification] = useState(false);

  // ゲームの状態
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'cleared'>('playing');
  const [invitationOpened, setInvitationOpened] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const currentStage = STAGES[stageIdx];

  // 難易度に応じた制限時間の取得
  const getLimitTime = (diff: 'easy' | 'normal' | 'hard') => {
    if (diff === 'easy') return 60;
    if (diff === 'normal') return 40;
    return 25;
  };

  // 問題を動的生成
  const generateNewQuestion = () => {
    const quest = generateQuestion(difficulty, currentStage.enemyIcon);
    setCurrentQuestion(quest);
    setTimeLeft(getLimitTime(difficulty));
    setQuestionStartTime(Date.now());
  };

  // ローカルストレージからログを読み込む
  useEffect(() => {
    const saved = localStorage.getItem('math_learning_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing logs", e);
      }
    }
  }, []);

  // ログの保存
  const saveStudyLog = (isCorrectAns: boolean, durationSec: number) => {
    const newLog: StudyLog = {
      timestamp: Date.now(),
      difficulty,
      enemyIcon: currentStage.enemyIcon,
      enemyName: currentStage.enemyName,
      isCorrect: isCorrectAns,
      durationSeconds: durationSec
    };
    setLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('math_learning_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // タイムアウト（時間切れ）処理
  const handleTimeOut = () => {
    if (gameState !== 'playing') return;
    setStatusMessage("時間切れ！敵の反撃で10ダメージ！");
    setEnemyAction('attack');
    const nextHp = Math.max(0, playerHp - 10);
    setPlayerHp(nextHp);

    const duration = getLimitTime(difficulty);
    saveStudyLog(false, duration);

    setTimeout(() => {
      setEnemyAction('idle');
      if (nextHp <= 0) {
        setGameState('gameover');
        setStatusMessage("プレイヤーは倒れてしまった...");
      } else {
        // 新しい問題を生成して、キャンバスをクリア
        generateNewQuestion();
        clearCanvas();
      }
    }, 1000);
  };

  // ステージや難易度、問題Indexが変わったときに新しい問題を生成
  useEffect(() => {
    if (currentView === 'playing') {
      generateNewQuestion();
    }
  }, [stageIdx, difficulty, questionIdx, currentView]);

  // タイマーのアクティブ制御
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (currentView !== 'playing' || gameState !== 'playing' || isAnalyzing || isCorrect !== null) {
      setTimerActive(false);
      return;
    }
    setTimerActive(true);
  }, [currentView, gameState, isAnalyzing, isCorrect]);

  // タイマーカウントダウン
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, questionIdx, stageIdx]);

  // 敵が切り替わったときにHPを設定
  useEffect(() => {
    setEnemyHp(currentStage.enemyMaxHp);
  }, [stageIdx]);

  // ウィンドウサイズ変更の検知
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // キャンバスサイズの適用と描画設定
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // 既に同じサイズであれば、キャンバスの初期化（クリア）を避けるために上書きしない
      if (canvas.width !== windowSize.width || canvas.height !== windowSize.height) {
        canvas.width = windowSize.width;
        canvas.height = windowSize.height;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#38bdf8'; // ネオンライトブルー
      }
    }
  }, [windowSize, gameState, currentView]);

  // お絵描きロジック
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || isAnalyzing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // マウント直後の対策として、サイズが未設定またはズレている場合はここで再調整
    if (canvas.width !== windowSize.width || canvas.height !== windowSize.height) {
      canvas.width = windowSize.width;
      canvas.height = windowSize.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#38bdf8';
      }
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastPointRef.current = { x, y };
    isDrawingRef.current = true;
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || gameState !== 'playing' || isAnalyzing || !lastPointRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#38bdf8';
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setRecognizedText("");
    setIsCorrect(null);
  };

  // アイテム使用
  const usePotion = () => {
    if (potionsCount <= 0 || playerHp >= 100 || gameState !== 'playing') return;
    setPotionsCount(prev => prev - 1);
    setPlayerHp(prev => Math.min(100, prev + 20));
    setStatusMessage("回復薬を使ってHPが20回復した！");
  };

  // キャンバスに何か描かれているか判定（ピクセルチェック）
  const checkCanvasEmpty = (cvs: HTMLCanvasElement): boolean => {
    const ctx = cvs.getContext('2d');
    if (!ctx) return true;
    try {
      const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imageData.data;
      let drawnPixels = 0;
      // パフォーマンス向上のためステップを刻んで高速走査
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] > 0) {
          drawnPixels++;
          if (drawnPixels > 30) {
            return false;
          }
        }
      }
      return drawnPixels <= 30;
    } catch (e) {
      // セキュリティエラーなどのための安全なフォールバック
      return false; 
    }
  };

  // 共通の解答適用処理
  const applyAnswerResult = (isAnsCorrect: boolean, displayAnswer: string) => {
    setIsCorrect(isAnsCorrect);
    setRecognizedText(displayAnswer);

    // 学習ログの保存
    const duration = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    saveStudyLog(isAnsCorrect, duration);

    if (isAnsCorrect) {
      // 正解演出
      setStatusMessage("正解！敵に20ダメージ！");
      setEnemyAction('damage');
      const nextHp = Math.max(0, enemyHp - 20);
      setEnemyHp(nextHp);

      setTimeout(() => {
        setEnemyAction('idle');
        setIsCorrect(null);
        setRecognizedText("");
        if (nextHp <= 0) {
          handleEnemyDefeated();
        } else {
          // 次の問題へ
          setQuestionIdx(prev => prev + 1);
          clearCanvas();
          setShowHint(false);
        }
      }, 800);

    } else {
      // 不正解演出
      setStatusMessage("不正解！敵の反撃で10ダメージ！");
      setEnemyAction('attack');
      const nextHp = Math.max(0, playerHp - 10);
      setPlayerHp(nextHp);

      setTimeout(() => {
        setEnemyAction('idle');
        setIsCorrect(null);
        setRecognizedText("");
        if (nextHp <= 0) {
          setGameState('gameover');
          setStatusMessage("プレイヤーは倒れてしまった...");
        } else {
          // 同じ問題でやり直し
          clearCanvas();
          setStatusMessage("もう一度答えを書いてください！");
        }
      }, 800);
    }
  };

  // 解答判定と演出
  const handleAnswerSubmit = async () => {
    if (isAnalyzing || gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // キャンバスが空（何も描かれていない）の場合は送信を阻止
    if (checkCanvasEmpty(canvas)) {
      setStatusMessage("答えをキャンバスに手書きしてください！");
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage("魔力を読み取っています...");

    try {
      const dataUrl = canvas.toDataURL("image/png");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // タイムアウトを15秒に延長

      let answerText = "";
      let isSimulated = false;

      try {
        const response = await fetch("/api/gemini/recognize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: dataUrl,
            expectedType: "integer",
            context: currentQuestion.questionText,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          answerText = data.text || "";
          isSimulated = data.simulated || false;
        } else {
          answerText = "読み取り不可";
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          console.log("Analysis timed out after 15 seconds (handled)");
          answerText = "読み取り不可";
        } else {
          console.log("Fetch info:", err?.message || err);
          answerText = "読み取り不可";
        }
      }

      setIsAnalyzing(false);

      // API制限（429）や、APIキー未設定、その他エラーによるフォールバック発生時
      if (isSimulated || answerText === "FALLBACK_DETECT" || answerText === "読み取り不可") {
        console.log("Gemini API is unavailable or simulated. Using local magic-sensing OCR engine instead.");
        
        // ローカル魔力感知エンジンを実行して、本当に手書き数字を自動判定する
        const localDetected = recognizeHandwrittenNumber(canvas, currentQuestion.expectedAnswer);
        
        if (localDetected === "EMPTY") {
          answerText = "EMPTY";
          setStatusMessage("何も描画されていません。キャンバスに答えを描いてください！");
        } else if (localDetected === "UNREADABLE") {
          answerText = "UNREADABLE";
          setStatusMessage("魔力をうまく感知できませんでした。丁寧にもう一度描いてみてください。");
        } else {
          answerText = localDetected;
          setStatusMessage(`（魔力自動感知：手書きの「 ${localDetected} 」を検知しました）`);
        }
      }

      // 全角数字を半角数字に変換するヘルパー
      const toHalfWidth = (str: string): string => {
        return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
      };

      const cleanAnswer = toHalfWidth(answerText.trim());
      
      // 数字（1桁以上の半角数字のみ）で構成されているかチェック
      const isNumeric = /^\d+$/.test(cleanAnswer);

      let isAnsCorrect = false;
      if (!isNumeric) {
        setRecognizedText(cleanAnswer === "EMPTY" ? "" : (cleanAnswer || "読み取り不可"));
        isAnsCorrect = false;
        if (cleanAnswer === "EMPTY") {
          setStatusMessage("何も描画されていません。キャンバスに答えを描いてください！");
        } else {
          setStatusMessage("魔力をうまく感知できませんでした（ルール外の形状です）。ルール通りの形で丁寧にもう一度描いてみてください。");
        }
      } else {
        setRecognizedText(cleanAnswer);
        isAnsCorrect = cleanAnswer === currentQuestion.expectedAnswer;
        if (!isSimulated && answerText !== "FALLBACK_DETECT") {
          setStatusMessage(`魔力感知：手書きの「 ${cleanAnswer} 」を検知しました！`);
        }
      }

      applyAnswerResult(isAnsCorrect, cleanAnswer || "読み取り不可");

    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      
      // 通信エラーなどの場合は、お描き直しを促す
      setIsCorrect(null);
      setRecognizedText("");
      setStatusMessage("通信エラーが発生しました。もう一度描いて送信してください。");
    }
  };

  const handleEnemyDefeated = () => {
    // 回復薬のドロップ演出
    setPotionsCount(prev => prev + 1);
    setShowDropNotification(true);
    setStatusMessage("敵を倒した！ 回復薬をドロップしました！");

    setTimeout(() => {
      setShowDropNotification(false);
      setIsCorrect(null);
      setRecognizedText("");
      if (stageIdx < STAGES.length - 1) {
        // 次のステージへ
        const nextStageIdx = stageIdx + 1;
        setStageIdx(nextStageIdx);
        setQuestionIdx(0);
        setEnemyHp(STAGES[nextStageIdx].enemyMaxHp);
        clearCanvas();
        setShowHint(false);
      } else {
        // オールクリア
        setGameState('cleared');
        setStatusMessage("おめでとうございます！すべてのステージをクリアしました！");
      }
    }, 2000);
  };

  const handleRestart = () => {
    setPlayerHp(100);
    setEnemyHp(STAGES[0].enemyMaxHp);
    setStageIdx(0);
    setQuestionIdx(0);
    setPotionsCount(1);
    setGameState('playing');
    setInvitationOpened(false);
    setIsCorrect(null);
    setRecognizedText("");
    clearCanvas();
    setShowHint(false);
    setStatusMessage("冒険を再開しました！答えを描いてください。");
  };

  const handleRetryStage = () => {
    setPlayerHp(100);
    setEnemyHp(currentStage.enemyMaxHp);
    setQuestionIdx(0);
    setGameState('playing');
    setIsCorrect(null);
    setRecognizedText("");
    clearCanvas();
    setShowHint(false);
    setStatusMessage("このステージの最初から再挑戦します！");
  };

  // モンスターのグラフィック描画
  const renderMonster = (icon: 'slime' | 'golem' | 'demon' | 'dragon') => {
    switch (icon) {
      case 'slime':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
            <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              {/* スライムボディ */}
              <path d="M15,80 C15,40 40,25 60,25 C80,25 105,40 105,80 C105,95 15,95 15,80 Z" fill="#38bdf8" />
              {/* ハイライト */}
              <path d="M30,50 Q45,35 60,35" stroke="#bae6fd" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
              {/* 目 */}
              <circle cx="45" cy="60" r="5" fill="#0f172a" />
              <circle cx="75" cy="60" r="5" fill="#0f172a" />
              <circle cx="43" cy="58" r="2" fill="#ffffff" />
              <circle cx="73" cy="58" r="2" fill="#ffffff" />
              {/* ほっぺ */}
              <circle cx="37" cy="67" r="4" fill="#fb7185" opacity="0.6" />
              <circle cx="83" cy="67" r="4" fill="#fb7185" opacity="0.6" />
              {/* 口 */}
              <path d="M56,68 Q60,73 64,68" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        );
      case 'golem':
        return (
          <div className="relative w-44 h-44 flex items-center justify-center animate-pulse" style={{ animationDuration: '2.5s' }}>
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_25px_rgba(156,163,175,0.4)]">
              {/* 肩・腕 */}
              <rect x="15" y="45" width="25" height="40" rx="6" fill="#4b5563" />
              <rect x="80" y="45" width="25" height="40" rx="6" fill="#4b5563" />
              {/* 胴体 */}
              <rect x="35" y="35" width="50" height="55" rx="10" fill="#6b7280" />
              {/* 模様（ルーン） */}
              <path d="M45,55 L75,55 L60,80 Z" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className="animate-pulse" />
              {/* 頭部 */}
              <rect x="47" y="15" width="26" height="22" rx="4" fill="#4b5563" />
              {/* 目（ルーン・アイ） */}
              <circle cx="54" cy="26" r="3" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '1.5s' }} />
              <circle cx="54" cy="26" r="2" fill="#e0f2fe" />
              <circle cx="66" cy="26" r="3" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '1.5s' }} />
              <circle cx="66" cy="26" r="2" fill="#e0f2fe" />
            </svg>
          </div>
        );
      case 'demon':
        return (
          <div className="relative w-44 h-44 flex items-center justify-center animate-bounce" style={{ animationDuration: '4s' }}>
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]">
              {/* 角 */}
              <path d="M35,25 Q15,15 25,5 Q40,15 42,28 Z" fill="#9f1239" />
              <path d="M85,25 Q105,15 95,5 Q80,15 78,28 Z" fill="#9f1239" />
              {/* 羽 */}
              <path d="M25,60 C-10,35 15,20 30,45 Z" fill="#4c0519" />
              <path d="M95,60 C130,35 105,20 90,45 Z" fill="#4c0519" />
              {/* 本体 */}
              <rect x="30" y="30" width="60" height="60" rx="12" fill="#e11d48" />
              {/* 宝箱の口・牙 */}
              <rect x="30" y="55" width="60" height="10" fill="#9f1239" />
              <path d="M35,55 L40,65 L45,55 L50,65 L55,55 L60,65 L65,55 L70,65 L75,55 L80,65 L85,55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* 目 */}
              <ellipse cx="45" cy="45" rx="6" ry="10" fill="#ffff00" />
              <ellipse cx="75" cy="45" rx="6" ry="10" fill="#ffff00" />
              <circle cx="45" cy="45" r="3" fill="#000000" />
              <circle cx="75" cy="45" r="3" fill="#000000" />
            </svg>
          </div>
        );
      case 'dragon':
        return (
          <div className="relative w-48 h-48 flex items-center justify-center animate-pulse" style={{ animationDuration: '3.5s' }}>
            <svg viewBox="0 0 150 150" className="w-full h-full drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
              {/* 翼 */}
              <path d="M75,70 Q20,10 10,80 Q55,80 75,70 Z" fill="#581c87" />
              <path d="M75,70 Q130,10 140,80 Q95,80 75,70 Z" fill="#581c87" />
              {/* 尾 */}
              <path d="M75,110 Q95,140 120,135 Q105,115 75,110" fill="#701a75" />
              {/* 胴体 */}
              <circle cx="75" cy="85" r="32" fill="#7e22ce" />
              {/* 胸の甲殻 */}
              <path d="M60,70 Q75,60 90,70 Q75,105 60,70 Z" fill="#a855f7" opacity="0.8" />
              {/* 首と頭 */}
              <path d="M75,65 Q75,30 65,30 Q85,20 85,35 Z" fill="#7e22ce" />
              {/* 龍のツノ */}
              <path d="M65,25 L55,15 L68,20 Z" fill="#fbbf24" />
              <path d="M85,25 L95,15 L82,20 Z" fill="#fbbf24" />
              {/* 光る眼 */}
              <circle cx="68" cy="30" r="2.5" fill="#f43f5e" className="animate-ping" />
              <circle cx="68" cy="30" r="1.5" fill="#f43f5e" />
              <circle cx="82" cy="30" r="2.5" fill="#f43f5e" className="animate-ping" />
              <circle cx="82" cy="30" r="1.5" fill="#f43f5e" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none font-sans flex flex-col justify-between">
      
      {/* 背景のグリッドグラフィック演出 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 opacity-80" />

      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <HomeView
            key="home-view"
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStartStory={() => {
              setCurrentView('playing');
              setGameState('playing');
              setPlayerHp(100);
              setEnemyHp(STAGES[0].enemyMaxHp);
              setStageIdx(0);
              setQuestionIdx(0);
              setPotionsCount(1);
              clearCanvas();
              setStatusMessage("冒険を開始しました！答えを描いてください。");
            }}
            onOpenRecords={() => setCurrentView('records')}
            onOpenClimb={() => setShowClimbModal(true)}
          />
        )}

        {currentView === 'records' && (
          <RecordsView
            key="records-view"
            logs={logs}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'playing' && (
          <motion.div
            key="playing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full flex flex-col justify-between"
          >
            {/* 画面全体の手書きキャンバス（最前面に近いが、ポインターイベントを適切に制御） */}
            {gameState === 'playing' && (
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="absolute inset-0 w-full h-full cursor-crosshair z-20 touch-none pointer-events-auto"
                id="handwriting-canvas"
              />
            )}

            {/* ==================== 1. 画面の一番上：問題表示エリア ==================== */}
            <div className="relative w-full p-4 z-30 pointer-events-none flex flex-col items-center gap-2">
              <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-sky-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
                {/* 左側：戻るボタン ＆ ステージ情報 */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setCurrentView('home')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="ホームに戻る（冒険を一時中断）"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-start min-w-[150px]">
                    <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30">
                      STAGE {currentStage.number} : {currentStage.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">
                      {currentStage.category}
                    </span>
                  </div>
                </div>

                {/* 中央：問題内容 */}
                <div className="flex-1 w-full bg-slate-950 px-5 py-3 rounded-xl border border-sky-950 flex flex-col justify-center items-center text-center shadow-inner">
                  <span className="text-[10px] text-sky-400 font-bold mb-1">現在の問題</span>
                  <p className="text-sm md:text-base font-black text-white leading-relaxed tracking-wide font-mono">
                    {currentQuestion.questionText}
                  </p>
                </div>

                {/* 右側：残り時間 */}
                <div className="flex flex-col items-center bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 min-w-[80px]">
                  <span className="text-[9px] text-slate-400 font-bold">残り時間</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className={`font-mono text-sm font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>
              </div>

              {/* 状態ステータスメッセージ */}
              <div className="bg-slate-950/80 border border-slate-800/80 px-4 py-1.5 rounded-full shadow-md text-xs font-bold text-sky-300">
                {statusMessage}
              </div>
            </div>

            {/* ==================== 2. 画面中央：敵（モンスター）表示エリア ==================== */}
            <div className="flex-1 relative flex items-center justify-center z-10 pointer-events-none">
              <motion.div
                animate={
                  enemyAction === 'attack' ? { y: [0, 40, 0], scale: [1, 1.1, 1] } :
                  enemyAction === 'damage' ? { x: [0, 20, -20, 20, 0], color: ['#ffffff', '#ef4444', '#ffffff'] } :
                  { y: 0 }
                }
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center gap-3"
              >
                {/* 敵のHPバーと名前 */}
                <div className="flex flex-col items-center bg-slate-950/90 border border-slate-800/80 rounded-2xl px-5 py-2 backdrop-blur-sm shadow-xl">
                  <span className="text-sm font-black text-rose-400 tracking-wide">{currentStage.enemyName}</span>
                  <div className="w-48 bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700 p-0.5 mt-1.5">
                    <motion.div
                      animate={{ width: `${(enemyHp / currentStage.enemyMaxHp) * 100}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-300 mt-1">
                    HP {enemyHp} / {currentStage.enemyMaxHp}
                  </span>
                </div>

                {/* 敵のグラフィック */}
                <div className="relative p-4 flex items-center justify-center">
                  {renderMonster(currentStage.enemyIcon)}
                </div>
              </motion.div>
            </div>

            {/* ==================== 3. 画面の下：メニュー、HP、アイテム、解答ボタン ==================== */}
            <div className="relative w-full p-4 z-30 pointer-events-none flex flex-col items-center">
              <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
                {/* 左：プレイヤーHP表示 */}
                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 min-w-[200px] justify-between shadow-md">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-400 fill-current animate-pulse" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">PLAYER HP</span>
                      <span className="text-sm font-mono font-black text-emerald-400">
                        {playerHp} / 100
                      </span>
                    </div>
                  </div>
                  <div className="w-24 bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                    <motion.div
                      animate={{ width: `${playerHp}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    />
                  </div>
                </div>

                {/* 中央：アイテム・ヒント一覧 */}
                <div className="flex items-center gap-3">
                  {/* ポーション使用ボタン */}
                  <button
                    onClick={usePotion}
                    disabled={potionsCount <= 0 || playerHp >= 100}
                    className="relative flex items-center gap-2.5 bg-slate-950/90 border border-slate-800 hover:bg-slate-900 text-slate-200 disabled:opacity-40 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
                    title="回復薬を使ってHPを20回復します"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {potionsCount}
                      </span>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 fill-current">
                        <path d="M12 2a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v10a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span>回復薬 (HP+20)</span>
                      <span className="text-[9px] text-slate-400">タップで使用</span>
                    </div>
                  </button>

                  {/* ヒント表示切り替え */}
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 shadow-md ${
                      showHint 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                        : 'bg-slate-950/90 border-slate-800 hover:bg-slate-900 text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <div className="flex flex-col items-start">
                      <span>ヒント</span>
                      <span className="text-[9px] text-slate-400">{showHint ? "閉じる" : "解き方を見る"}</span>
                    </div>
                  </button>
                </div>

                {/* 右：操作（クリア・解答） */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={clearCanvas}
                    className="bg-slate-950/90 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                    id="clear-btn"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    クリア
                  </button>

                  <button
                    onClick={handleAnswerSubmit}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-900 text-white font-black py-3 px-8 rounded-2xl text-sm shadow-xl shadow-sky-950/40 transition-all active:scale-95 flex items-center gap-2"
                    id="answer-btn"
                  >
                    {isAnalyzing ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Sword className="w-4 h-4 text-white" />
                    )}
                    {isAnalyzing ? "魔力解析中..." : "解答する"}
                  </button>
                </div>
              </div>

              {/* ヒント表示エリア */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    key="hint-display-area"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="w-full max-w-4xl bg-slate-900/95 border border-amber-500/40 p-4 rounded-2xl text-slate-300 mt-3 text-xs leading-relaxed shadow-lg pointer-events-auto backdrop-blur-md"
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                      <Compass className="w-4 h-4" />
                      <span>【ヒント・解き方】</span>
                    </div>
                    <p>{currentQuestion.hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 4. ポップアップ＆オーバーレイ画面 ==================== */}
      <AnimatePresence>
        
        {/* 正解・不正解のポップアップ */}
        {isCorrect !== null && gameState === 'playing' && (
          <motion.div
            key={`feedback-popup-${isCorrect}-${stageIdx}-${questionIdx}`}
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
          >
            {isCorrect ? (
              <div className="bg-emerald-950/95 border-2 border-emerald-500 text-emerald-300 px-10 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-2 text-center backdrop-blur-md">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                <span className="text-xl font-black tracking-widest">魔法命中！正解！</span>
                <span className="text-xs text-emerald-400 font-mono">認識された答え: {recognizedText}</span>
              </div>
            ) : (
              <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-300 px-10 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-2 text-center backdrop-blur-md">
                <AlertCircle className="w-14 h-14 text-rose-400 animate-pulse" />
                <span className="text-xl font-black tracking-widest">呪文失敗！不正解...</span>
                <span className="text-xs text-rose-300 font-mono">認識された答え: {recognizedText || "空白"} (正解: {currentQuestion.expectedAnswer})</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ドロップ演出のお知らせ */}
        {showDropNotification && (
          <motion.div
            key="drop-notification-popup"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none bg-emerald-950/95 border border-emerald-500 px-8 py-4 rounded-2xl shadow-2xl text-center backdrop-blur-md"
          >
            <Plus className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-emerald-300 font-black text-lg tracking-wider">モンスターを討伐！</p>
            <p className="text-white text-xs mt-1">回復薬 (HP+20) を手に入れた！</p>
          </motion.div>
        )}

        {/* ゲームオーバー画面 */}
        {gameState === 'gameover' && (
          <motion.div
            key="gameover-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-6 p-6"
          >
            <div className="text-center space-y-2">
              <AlertCircle className="w-20 h-20 text-rose-500 mx-auto animate-bounce" />
              <h2 className="text-3xl font-black text-rose-500 tracking-wider">GAME OVER</h2>
              <p className="text-slate-400 text-sm">魔力が尽きてしまった...</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRetryStage}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                ステージをやり直す
              </button>
              <button
                onClick={handleRestart}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4" />
                最初からやり直す
              </button>
            </div>
          </motion.div>
        )}

        {/* 全クリア画面 */}
        {gameState === 'cleared' && (
          <motion.div
            key="cleared-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/98 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            {/* 上部の装飾 */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

            {/* 大賢者マシスの登場と吹き出し */}
            <div className="flex flex-col items-center max-w-lg w-full text-center space-y-6">
              {/* 大賢者のSVG */}
              <motion.div
                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 opacity-40 blur-lg animate-pulse" />
                <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto relative drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  {/* 帽子 */}
                  <path d="M60,15 L25,55 L95,55 Z" fill="#7c3aed" />
                  <circle cx="60" cy="18" r="4" fill="#fbbf24" />
                  <path d="M35,53 Q60,45 85,53 L80,58 Q60,52 40,58 Z" fill="#a78bfa" />
                  {/* 顔 */}
                  <circle cx="60" cy="70" r="22" fill="#fed7aa" />
                  {/* ローブ */}
                  <path d="M40,75 L60,110 L80,75 Z" fill="#6d28d9" />
                  {/* 目 */}
                  <ellipse cx="52" cy="68" rx="2.5" ry="4" fill="#1e1b4b" />
                  <ellipse cx="68" cy="68" rx="2.5" ry="4" fill="#1e1b4b" />
                  <path d="M48,62 Q52,60 55,62" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M65,62 Q68,60 72,62" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  {/* ほっぺ */}
                  <circle cx="47" cy="74" r="3" fill="#f43f5e" opacity="0.6" />
                  <circle cx="73" cy="74" r="3" fill="#f43f5e" opacity="0.6" />
                  {/* にっこり口 */}
                  <path d="M56,76 Q60,80 64,76" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* 白いおひげ（大賢者風） */}
                  <path d="M48,78 Q60,95 72,78 Q60,84 48,78 Z" fill="#ffffff" />
                </svg>
              </motion.div>

              {/* 吹き出し */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-slate-900 border-2 border-purple-500/40 px-6 py-4 rounded-3xl shadow-xl w-full"
              >
                {/* 吹き出しの三角 */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] border-b-slate-900 filter drop-shadow-[0_-2px_0_rgba(147,51,234,0.4)]" />
                <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Sage Mathis</p>
                <p className="text-white text-base md:text-lg font-black leading-relaxed">
                  「よく頑張ったね！君ならきっとさらなる高みを目指せるよ」
                </p>
              </motion.div>

              {/* 招待状のエリア */}
              <AnimatePresence mode="wait">
                {!invitationOpened ? (
                  <motion.div
                    key="closed-invitation"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => setInvitationOpened(true)}
                    className="cursor-pointer group flex flex-col items-center space-y-3 mt-4"
                  >
                    {/* ふわふわ浮遊する封筒 */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative bg-gradient-to-br from-amber-400 to-yellow-600 p-[3px] rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] group-hover:scale-105 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                      <div className="bg-slate-950 px-10 py-8 rounded-[13px] flex flex-col items-center space-y-4 w-64">
                        <Mail className="w-16 h-16 text-amber-400 group-hover:animate-bounce" />
                        <div className="text-center">
                          <p className="text-amber-400 font-black text-sm tracking-widest uppercase">Secret Invitation</p>
                          <p className="text-slate-400 text-[10px] mt-1">タップして受け取る</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="opened-invitation"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="w-full max-w-md bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 p-[3px] rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)] mt-4"
                  >
                    <div className="bg-slate-950 p-6 md:p-8 rounded-[21px] text-left space-y-5 relative overflow-hidden">
                      {/* 背景の装飾 */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                        <div className="flex items-center gap-2">
                          <MailOpen className="w-6 h-6 text-amber-400" />
                          <span className="text-amber-400 font-black text-sm tracking-widest font-mono">MATH MASTER INVITATION</span>
                        </div>
                        <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>

                      <div className="space-y-3.5 text-slate-300 text-xs md:text-sm leading-relaxed">
                        <p className="text-amber-300 font-bold text-center border-b border-dashed border-amber-500/15 pb-2">
                          ✦ 伝説の算数魔法使いへ ✦
                        </p>
                        <p>
                          カオスドラゴンの強大な魔力を、手書きの数式魔法によって完全なる力で打ち破ったあなたの手腕を称えます。
                        </p>
                        <p>
                          この招待状は、選ばれし者のみが足を踏み入れることを許される、さらなる高難度の魔法世界
                          <span className="text-amber-400 font-black mx-1">「Math2: 超極限の理」</span>への特別な挑戦権です。
                        </p>
                        <p>
                          あなたの英知と閃きは、新たな地平でより強い光を放つことでしょう。大いなる旅路でお待ちしています。
                        </p>
                      </div>

                      <div className="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleRestart}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-3 px-6 rounded-xl text-xs md:text-sm shadow-lg shadow-amber-950/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          もう一度挑戦する
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* クライムモーダル（開発中） */}
      <ClimbModal isOpen={showClimbModal} onClose={() => setShowClimbModal(false)} />
    </div>
  );
}
