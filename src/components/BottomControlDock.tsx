import React, { useState } from 'react';
import { GraphicsQuality, ScaleMode, InteractionMode } from '../types/celestial';
import { 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Sliders, 
  Clock, 
  Flame, 
  Globe2,
  Ratio,
  Move,
  Rocket,
  Compass,
  RotateCcw,
  Orbit,
  Sparkles
} from 'lucide-react';

interface BottomControlDockProps {
  simSpeed: number;
  onSetSimSpeed: (speed: number) => void;
  scaleMode: ScaleMode;
  onToggleScaleMode: () => void;
  interactionMode: InteractionMode;
  onSetInteractionMode: (mode: InteractionMode) => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showHabitableZone: boolean;
  onToggleHabitableZone: () => void;
  showAsteroidBelt: boolean;
  onToggleAsteroidBelt: () => void;
  graphicsQuality: GraphicsQuality;
  onSetGraphicsQuality: (quality: GraphicsQuality) => void;
  onTriggerSupernova: () => void;
  onResetUniverse: () => void;
  collisionCount: number;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  simSpeed,
  onSetSimSpeed,
  scaleMode,
  onToggleScaleMode,
  interactionMode,
  onSetInteractionMode,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  showGrid,
  onToggleGrid,
  showHabitableZone,
  onToggleHabitableZone,
  showAsteroidBelt,
  onToggleAsteroidBelt,
  graphicsQuality,
  onSetGraphicsQuality,
  onTriggerSupernova,
  onResetUniverse,
  collisionCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'interaction' | 'timeline' | 'layers' | 'settings'>('interaction');
  const [savedSpeed, setSavedSpeed] = useState(1);

  const isPaused = simSpeed === 0;

  const handlePlayPause = () => {
    if (isPaused) {
      onSetSimSpeed(savedSpeed > 0 ? savedSpeed : 1);
    } else {
      setSavedSpeed(simSpeed);
      onSetSimSpeed(0);
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-3 pointer-events-none transition-all duration-300">
      {/* Collapse / Expand Tab */}
      <div className="flex justify-center pointer-events-auto mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-slate-950/85 border-t border-x border-cyan-500/30 text-xs font-mono text-cyan-400 hover:text-cyan-200 shadow-md backdrop-blur-md cursor-pointer transition-colors"
          title={isCollapsed ? 'Mở bảng điều khiển' : 'Thu gọn điều khiển (Chế độ Điện ảnh)'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hiện điều khiển</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Ẩn điều khiển</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Control Dock */}
      {!isCollapsed && (
        <div className="pointer-events-auto bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-cyan-950/40 backdrop-blur-md flex flex-col gap-2.5">
          {/* Top Row: Category Tabs & Scale Mode */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('interaction')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'interaction'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                <span>Tương tác & Va chạm</span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'timeline'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Thời gian</span>
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'layers'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lớp hiển thị</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cài đặt</span>
              </button>
            </div>

            {/* Quick Actions (Reset Universe & Scale Mode) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onResetUniverse}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Khôi phục toàn bộ quỹ đạo và các hành tinh đã va chạm về ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tái tạo vũ trụ</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-xl p-0.5">
                <button
                  onClick={onToggleScaleMode}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                    scaleMode === 'visual'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tỷ lệ trực quan"
                >
                  <Ratio className="w-3 h-3" />
                  <span className="hidden sm:inline">Trực quan</span>
                </button>
                <button
                  onClick={onToggleScaleMode}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                    scaleMode === 'scientific'
                      ? 'bg-indigo-500 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tỷ lệ khoa học"
                >
                  <Globe2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Khoa học</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB: Interaction Modes & Planetary Smash Tools */}
          {activeTab === 'interaction' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => onSetInteractionMode('navigate')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    interactionMode === 'navigate'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Xoay và quan sát không gian tự do"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>1. Khám phá tự do</span>
                </button>

                <button
                  onClick={() => onSetInteractionMode('drag_body')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    interactionMode === 'drag_body'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Nhấp giữ hành tinh bất kỳ để kéo và thả va chạm vào thiên thể khác!"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>2. Nhấc & Kéo va chạm hành tinh</span>
                </button>

                <button
                  onClick={() => onSetInteractionMode('asteroid_cannon')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    interactionMode === 'asteroid_cannon'
                      ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Nhấp và kéo lùi để bắn pháo thiên thạch siêu tốc vào các hành tinh!"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>3. Pháo Bắn Tiểu Hành Tinh</span>
                </button>

                <button
                  onClick={() => onSetInteractionMode('gravity_well')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    interactionMode === 'gravity_well'
                      ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Hiển thị lưới độ cong không-thời gian Einstein quanh các hành tinh"
                >
                  <Orbit className="w-3.5 h-3.5" />
                  <span>4. Hố hấp dẫn Spacetime</span>
                </button>
              </div>

              {collisionCount > 0 && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-xl">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{collisionCount} vụ va chạm</span>
                </div>
              )}
            </div>
          )}

          {/* TAB: Timeline & Simulation Speed */}
          {activeTab === 'timeline' && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                  }`}
                  title={isPaused ? 'Tiếp tục mô phỏng' : 'Tạm dừng mô phỏng'}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
                  {[0.2, 1, 5, 20, 100].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => onSetSimSpeed(spd)}
                      className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                        simSpeed === spd
                          ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span>Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded ${isPaused ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'}`}>
                  {isPaused ? 'TẠM DỪNG' : `ĐANG MÔ PHỎNG (${simSpeed}x)`}
                </span>
              </div>
            </div>
          )}

          {/* TAB: Layers & Filters */}
          {activeTab === 'layers' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={onToggleOrbits}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showOrbits
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <span>Quỹ đạo</span>
              </button>
              <button
                onClick={onToggleLabels}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showLabels
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <span>Nhãn tên</span>
              </button>
              <button
                onClick={onToggleGrid}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showGrid
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <span>Lưới thiên cầu</span>
              </button>
              <button
                onClick={onToggleHabitableZone}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showHabitableZone
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <span>Vùng sự sống (Goldilocks)</span>
              </button>
              <button
                onClick={onToggleAsteroidBelt}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showAsteroidBelt
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <span>Vành đai tiểu hành tinh</span>
              </button>
            </div>
          )}

          {/* TAB: Settings & Supernova Action */}
          {activeTab === 'settings' && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">Đồ họa:</span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                  {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => onSetGraphicsQuality(q)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                        graphicsQuality === q
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {q === 'low' ? 'Thấp' : q === 'medium' ? 'Vừa' : 'Cao'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onTriggerSupernova}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:brightness-110 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
                title="Kích hoạt hiệu ứng vụ nổ siêu tân tinh hạt vật lý"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Kích hoạt Siêu Tân Tinh (Supernova)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
