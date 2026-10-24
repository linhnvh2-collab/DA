import React, { useState } from 'react';
import { CelestialBody, CosmicScaleLevel } from '../types/celestial';
import { GUIDED_TOUR_STEPS, COSMIC_QUIZ, CELESTIAL_BODIES } from '../data/celestialData';
import { cosmicAudio } from '../utils/audioSynthesizer';
import { 
  X, 
  GraduationCap, 
  Compass, 
  Scale, 
  Zap, 
  Sun, 
  Moon, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  Presentation,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBody: (bodyId: string, scaleLevel: CosmicScaleLevel) => void;
}

export const LearnModal: React.FC<LearnModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBody,
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'size_compare' | 'light_time' | 'eclipse' | 'quiz' | 'classroom'>('tour');

  // Tour State
  const [currentTourStepIdx, setCurrentTourStepIdx] = useState(0);

  // Light time destination
  const [lightDestId, setLightDestId] = useState<string>('earth');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const currentTourStep = GUIDED_TOUR_STEPS[currentTourStepIdx];

  const handleNextTourStep = () => {
    if (currentTourStepIdx < GUIDED_TOUR_STEPS.length - 1) {
      const nextIdx = currentTourStepIdx + 1;
      setCurrentTourStepIdx(nextIdx);
      const step = GUIDED_TOUR_STEPS[nextIdx];
      onNavigateToBody(step.targetId, step.scaleLevel);
    }
  };

  const handlePrevTourStep = () => {
    if (currentTourStepIdx > 0) {
      const prevIdx = currentTourStepIdx - 1;
      setCurrentTourStepIdx(prevIdx);
      const step = GUIDED_TOUR_STEPS[prevIdx];
      onNavigateToBody(step.targetId, step.scaleLevel);
    }
  };

  const handleStartTour = () => {
    setCurrentTourStepIdx(0);
    const step = GUIDED_TOUR_STEPS[0];
    onNavigateToBody(step.targetId, step.scaleLevel);
  };

  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted[questionId]) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));

    const q = COSMIC_QUIZ.find((item) => item.id === questionId);
    if (q) {
      const isCorrect = q.correctIndex === optionIdx;
      cosmicAudio.playChime(isCorrect);
    }
  };

  // Planets for size comparison
  const planetsForComparison = CELESTIAL_BODIES.filter(
    (b) => b.type === 'planet' || b.id === 'sun' || b.id === 'moon' || b.id === 'betelgeuse'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Trung Tâm Học Tập & Thí Nghiệm Vũ Trụ
              </h2>
              <p className="text-xs text-cyan-300 font-mono">
                Cosmic Learning & Astrophysical Simulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 px-3 bg-slate-900/50 overflow-x-auto scrollbar-none text-xs font-mono">
          <button
            onClick={() => setActiveTab('tour')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tour'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Tour có hướng dẫn</span>
          </button>

          <button
            onClick={() => setActiveTab('size_compare')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'size_compare'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>So sánh kích thước</span>
          </button>

          <button
            onClick={() => setActiveTab('light_time')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'light_time'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Thời gian ánh sáng</span>
          </button>

          <button
            onClick={() => setActiveTab('eclipse')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'eclipse'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Nhật thực & Nguyệt thực</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Trắc nghiệm vũ trụ ({COSMIC_QUIZ.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`py-3 px-3.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'classroom'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>Chế độ Giáo viên</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm">
          {/* TAB 1: Guided Cosmic Tour */}
          {activeTab === 'tour' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider block">
                    Hành trình vũ trụ
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {currentTourStep.titleVi}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
                  {currentTourStep.stepNumber} / {GUIDED_TOUR_STEPS.length}
                </span>
              </div>

              {/* Narrative Card */}
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                <p className="text-slate-200 text-base leading-relaxed">
                  {currentTourStep.narrativeVi}
                </p>

                <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-3.5 text-xs text-cyan-200 font-mono flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">🔬 Dữ kiện:</span>
                  <span>{currentTourStep.scientificFactVi}</span>
                </div>
              </div>

              {/* Tour Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevTourStep}
                  disabled={currentTourStepIdx === 0}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 disabled:opacity-40 disabled:hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Bước trước</span>
                </button>

                <button
                  onClick={handleStartTour}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Bắt đầu lại
                </button>

                <button
                  onClick={handleNextTourStep}
                  disabled={currentTourStepIdx === GUIDED_TOUR_STEPS.length - 1}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs font-mono flex items-center gap-2 transition-colors shadow-md shadow-cyan-600/30 cursor-pointer disabled:opacity-40"
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Size Comparison Tool */}
          {activeTab === 'size_compare' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">So sánh kích thước thiên thể tương đối</h3>
                <p className="text-xs text-slate-400">
                  Quan sát sự chênh lệch kích thước ngoạn mục từ Mặt Trăng, Trái Đất đến Mặt Trời và siêu sao Betelgeuse.
                </p>
              </div>

              <div className="space-y-3">
                {planetsForComparison.map((body) => {
                  // Normalize bar width relative to Sun (1,392,700 km) or logarithmic scale
                  const maxLog = Math.log10(1234000000); // Betelgeuse
                  const minLog = Math.log10(3474); // Moon
                  const curLog = Math.log10(body.diameterKm);
                  const pct = Math.max(5, ((curLog - minLog) / (maxLog - minLog)) * 100);

                  return (
                    <div key={body.id} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: body.colorHex }} />
                          <span className="font-bold text-slate-100">{body.nameVi}</span>
                          <span className="text-slate-400 text-[11px]">({body.typeLabelVi})</span>
                        </div>
                        <span className="text-cyan-400 font-bold">
                          Ø {body.diameterKm.toLocaleString()} km
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: body.colorHex,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Light Speed & Distance Calculator */}
          {activeTab === 'light_time' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Thời gian di chuyển của Ánh sáng</h3>
                <p className="text-xs text-slate-400">
                  Vận tốc ánh sáng trong chân không là c ≈ 299,792 km/giây. Hãy chọn một thiên thể đích để tính thời gian một photon cần để đến đó từ Mặt Trời hoặc Trái Đất.
                </p>
              </div>

              {/* Destination Selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'earth', name: 'Trái Đất (1 AU)', timeVi: '8 phút 20 giây', distVi: '149.6 triệu km' },
                  { id: 'moon', name: 'Mặt Trăng (từ Trái Đất)', timeVi: '1.28 giây', distVi: '384,400 km' },
                  { id: 'mars', name: 'Sao Hỏa', timeVi: '12 phút 40 giây', distVi: '227.9 triệu km' },
                  { id: 'jupiter', name: 'Sao Mộc', timeVi: '43 phút 15 giây', distVi: '778.5 triệu km' },
                  { id: 'pluto', name: 'Sao Diêm Vương', timeVi: '5.5 giờ', distVi: '5.9 tỷ km' },
                  { id: 'proxima', name: 'Proxima Centauri', timeVi: '4.24 năm', distVi: '40 nghìn tỷ km' },
                  { id: 'milkyway', name: 'Tâm Dải Ngân Hà (Sagittarius A*)', timeVi: '26,673 năm', distVi: '2.5 × 10¹⁷ km' },
                  { id: 'andromeda', name: 'Thiên hà Tiên Nữ', timeVi: '2.537 triệu năm', distVi: '2.4 × 10¹⁹ km' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLightDestId(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                      lightDestId === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Visual Result Card */}
              {(() => {
                const target = [
                  { id: 'earth', name: 'Trái Đất', timeVi: '8 phút 20 giây', distVi: '149,600,000 km (~1.0 AU)', jetTime: '19 năm', rocketTime: '150 ngày' },
                  { id: 'moon', name: 'Mặt Trăng', timeVi: '1.28 giây', distVi: '384,400 km', jetTime: '17 ngày', rocketTime: '3 ngày' },
                  { id: 'mars', name: 'Sao Hỏa', timeVi: '12 phút 40 giây', distVi: '227,900,000 km (~1.52 AU)', jetTime: '29 năm', rocketTime: '7 tháng' },
                  { id: 'jupiter', name: 'Sao Mộc', timeVi: '43 phút 15 giây', distVi: '778,500,000 km (~5.2 AU)', jetTime: '98 năm', rocketTime: '6 năm' },
                  { id: 'pluto', name: 'Sao Diêm Vương', timeVi: '5 giờ 30 phút', distVi: '5,906,000,000 km (~39.5 AU)', jetTime: '750 năm', rocketTime: '9.5 năm (Tàu New Horizons)' },
                  { id: 'proxima', name: 'Proxima Centauri', timeVi: '4.24 năm ánh sáng', distVi: '40,140,000,000,000 km', jetTime: '5.1 triệu năm', rocketTime: '73,000 năm (Tàu Voyager 1)' },
                  { id: 'milkyway', name: 'Tâm Ngân Hà', timeVi: '26,673 năm ánh sáng', distVi: '252,000,000,000,000,000 km', jetTime: '32 tỷ năm', rocketTime: '450 triệu năm' },
                  { id: 'andromeda', name: 'Thiên hà Tiên Nữ', timeVi: '2,537,000 năm ánh sáng', distVi: '2.4 × 10¹⁹ km', jetTime: '3 nghìn tỷ năm', rocketTime: '42 tỷ năm' },
                ].find((t) => t.id === lightDestId)!;

                return (
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950/70 border border-cyan-500/40 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-mono uppercase">Mục tiêu</span>
                        <h4 className="text-xl font-bold text-white">{target.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Khoảng cách</span>
                        <div className="text-cyan-300 font-mono font-bold text-xs">{target.distVi}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 text-center">
                        <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Tia sáng (Photon)</div>
                        <div className="text-cyan-300 font-bold text-sm mt-1">{target.timeVi}</div>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-lg mx-auto mb-1">🚀</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Tàu vũ trụ nhanh nhất</div>
                        <div className="text-slate-200 font-bold text-sm mt-1">{target.rocketTime}</div>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-lg mx-auto mb-1">✈️</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Máy bay phản lực (900 km/h)</div>
                        <div className="text-slate-200 font-bold text-sm mt-1">{target.jetTime}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: Eclipse Simulator */}
          {activeTab === 'eclipse' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Cơ chế Nhật thực & Nguyệt thực</h3>
                <p className="text-xs text-slate-400">
                  Hiện tượng thiên văn kỳ thú khi ba thiên thể Mặt Trời, Trái Đất và Mặt Trăng thẳng hàng trên mặt phẳng hoàng đạo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Solar Eclipse */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-bold text-amber-300">Nhật thực (Solar Eclipse)</h4>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Xảy ra vào ban ngày khi <strong>Mặt Trăng nằm giữa Mặt Trời và Trái Đất</strong>, che khuất một phần hoặc toàn bộ đĩa Mặt Trời.
                  </p>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="text-amber-400 font-bold">Thứ tự thẳng hàng:</div>
                    <div>Mặt Trời ☀️ ──▶ Mặt Trăng 🌑 ──▶ Trái Đất 🌍</div>
                    <div className="text-slate-400 text-[10px] pt-1">
                      • Vùng bóng tối (Umbra): Thấy Nhật thực toàn phần.
                      <br />• Vùng bóng nửa tối (Penumbra): Thấy Nhật thực một phần.
                    </div>
                  </div>
                </div>

                {/* Lunar Eclipse */}
                <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-rose-400" />
                    <h4 className="text-base font-bold text-rose-300">Nguyệt thực (Lunar Eclipse)</h4>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Xảy ra vào đêm trăng tròn khi <strong>Trái Đất nằm giữa Mặt Trời và Mặt Trăng</strong>. Bầu khí quyển Trái Đất bẻ cong ánh sáng đỏ chiếu lên Mặt Trăng tạo ra "Trăng Máu".
                  </p>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="text-rose-400 font-bold">Thứ tự thẳng hàng:</div>
                    <div>Mặt Trời ☀️ ──▶ Trái Đất 🌍 ──▶ Mặt Trăng 🔴</div>
                    <div className="text-slate-400 text-[10px] pt-1">
                      • Ánh sáng xanh bị tán xạ trong khí quyển Trái Đất.
                      <br />• Ánh sáng đỏ bị khúc xạ chiếu sáng Mặt Trăng thành màu đỏ gạch.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Cosmic Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Trắc nghiệm Thiên văn học</h3>
                  <p className="text-xs text-slate-400">
                    Kiểm tra kiến thức khoa học vũ trụ với 8 câu hỏi thú vị kèm lời giải thích chi tiết.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {COSMIC_QUIZ.map((q) => {
                  const isSubmitted = quizSubmitted[q.id];
                  const chosen = quizAnswers[q.id];

                  return (
                    <div key={q.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="font-semibold text-slate-100 text-sm flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-center shrink-0">
                          {q.id}
                        </span>
                        <span>{q.questionVi}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsVi.map((opt, oIdx) => {
                          const isSelected = chosen === oIdx;
                          const isCorrect = q.correctIndex === oIdx;

                          let btnStyle = 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300';
                          if (isSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectQuizOption(q.id, oIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {isSubmitted && (
                        <div className="bg-slate-950/60 border border-cyan-900/40 rounded-xl p-3 text-xs text-cyan-200/90 font-mono">
                          <strong className="text-cyan-400">💡 Giải thích: </strong>
                          {q.explanationVi}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: Teacher & Classroom Mode */}
          {activeTab === 'classroom' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Chế độ Giảng dạy & Lớp học</h3>
                <p className="text-xs text-slate-400">
                  Tài liệu và công cụ hỗ trợ giáo viên thuyết trình trực quan các khái niệm thiên văn học trên máy chiếu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Bài giảng 1: Quy luật Kepler & Quỹ đạo</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Mọi hành tinh chuyển động theo quỹ đạo elip với Mặt Trời nằm ở một tiêu điểm. Bật lớp hiển thị "Quỹ đạo" và "Lưới thiên cầu" để học sinh thấy độ nghiêng mặt phẳng hoàng đạo.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Bài giảng 2: Vùng ở được (Goldilocks Zone)</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Khu vực quanh một ngôi sao nơi nước có thể duy trì ở thể lỏng trên bề mặt hành tinh. Bật nút "Vùng sự sống" ở thanh điều khiển để làm nổi bật khoảng cách từ 0.95 đến 1.4 AU.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Bài giảng 3: Sự tiến hóa của Sao & Siêu tân tinh</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Giải thích chu kỳ vòng đời từ Tinh vân phát xạ (như Orion) đến sao siêu khổng lồ đỏ (Betelgeuse) và vụ nổ Supernova bằng nút "Kích hoạt Siêu tân tinh" mô phỏng sóng xung kích.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Bài giảng 4: Thang đo khoảng cách Vũ trụ</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Sử dụng thanh chọn cấp độ ở đầu trang để chuyển tiếp mượt mà từ Trái Đất (km) → Hệ Mặt Trời (AU) → Sao lân cận (năm ánh sáng) → Vũ trụ quan sát được (tỷ năm ánh sáng).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Nguồn dữ liệu: NASA Planetary Fact Sheets, ESA, IAU Astronomy Database</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
