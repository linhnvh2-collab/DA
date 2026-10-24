/**
 * Cosmic Explorer - 3D Universe Exploration Simulator
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CosmicScaleLevel, CelestialBody, GraphicsQuality, ScaleMode, InteractionMode, CollisionEvent } from './types/celestial';
import { CELESTIAL_BODIES } from './data/celestialData';
import { CosmicCanvas } from './components/CosmicCanvas';
import { NavigationHeader } from './components/NavigationHeader';
import { CelestialInfoPanel } from './components/CelestialInfoPanel';
import { BottomControlDock } from './components/BottomControlDock';
import { LearnModal } from './components/LearnModal';
import { cosmicAudio } from './utils/audioSynthesizer';
import { 
  AlertTriangle, 
  MousePointerClick, 
  Info, 
  X, 
  Flame, 
  RotateCcw, 
  Move, 
  Rocket, 
  Orbit, 
  Zap, 
  History
} from 'lucide-react';

export default function App() {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Core Simulation & Navigation State
  const [currentScale, setCurrentScale] = useState<CosmicScaleLevel>('solar_system');
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('visual');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('navigate');

  // Layers & Toggles
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showHabitableZone, setShowHabitableZone] = useState(false);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');

  // Triggers
  const [supernovaTrigger, setSupernovaTrigger] = useState(0);
  const [resetUniverseTrigger, setResetUniverseTrigger] = useState(0);

  // Collisions History
  const [collisionEvents, setCollisionEvents] = useState<CollisionEvent[]>([]);
  const [latestCollision, setLatestCollision] = useState<CollisionEvent | null>(null);
  const [showCollisionLog, setShowCollisionLog] = useState(false);

  // Modals & UI
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const resetViewRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handleSelectScale = (scale: CosmicScaleLevel) => {
    setCurrentScale(scale);
    let representative: CelestialBody | undefined;
    if (scale === 'earth_moon') representative = CELESTIAL_BODIES.find((b) => b.id === 'earth');
    else if (scale === 'solar_system') representative = CELESTIAL_BODIES.find((b) => b.id === 'sun');
    else if (scale === 'stellar_neighborhood') representative = CELESTIAL_BODIES.find((b) => b.id === 'proxima_centauri');
    else if (scale === 'milky_way') representative = CELESTIAL_BODIES.find((b) => b.id === 'milky_way');
    else if (scale === 'local_group') representative = CELESTIAL_BODIES.find((b) => b.id === 'andromeda_galaxy');
    else if (scale === 'observable_universe') representative = CELESTIAL_BODIES.find((b) => b.id === 'observable_universe');

    setSelectedBody(representative || null);
  };

  const handleSelectBody = (body: CelestialBody | null) => {
    setSelectedBody(body);
    if (body) {
      setCurrentScale(body.scaleLevel);
    }
  };

  const handleToggleScaleMode = () => {
    const nextMode = scaleMode === 'visual' ? 'scientific' : 'visual';
    setScaleMode(nextMode);
    if (nextMode === 'scientific') {
      showToast('Đã bật Tỷ lệ khoa học: Kích thước hành tinh & khoảng cách thực tế chuẩn xác.');
    } else {
      showToast('Đã bật Tỷ lệ trực quan: Phóng to kích thước hành tinh để dễ quan sát.');
    }
  };

  const handleSetInteractionMode = (mode: InteractionMode) => {
    setInteractionMode(mode);
    if (mode === 'drag_body') {
      showToast('🖐️ Chế độ Nhấc Hành Tinh: Nhấp và giữ chuột vào hành tinh bất kỳ để kéo và thả va chạm!');
    } else if (mode === 'asteroid_cannon') {
      showToast('☄️ Chế độ Pháo Bắn Thiên Thạch: Nhấp và kéo lùi chuột trên mặt phẳng để ngắm và bắn thiên thạch!');
    } else if (mode === 'gravity_well') {
      showToast('🌌 Đã bật lưới cong Không - Thời gian Einstein theo thuyết tương đối tổng quát!');
    } else {
      showToast('🛰️ Chế độ Khám phá tự do: Xoay và zoom quan sát vũ trụ.');
    }
  };

  const handleTriggerSupernova = () => {
    setSupernovaTrigger((prev) => prev + 1);
    showToast('💥 Sóng xung kích Siêu tân tinh (Supernova) đã bùng nổ!');
  };

  const handleResetUniverse = () => {
    setResetUniverseTrigger((prev) => prev + 1);
    setLatestCollision(null);
    showToast('✨ Vũ trụ đã được tái tạo! Tất cả hành tinh đã quay về quỹ đạo ban đầu.');
  };

  const handleCollision = (event: CollisionEvent) => {
    setCollisionEvents((prev) => [event, ...prev.slice(0, 19)]);
    setLatestCollision(event);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  const handleNavigateFromTour = (bodyId: string, scaleLevel: CosmicScaleLevel) => {
    setCurrentScale(scaleLevel);
    const body = CELESTIAL_BODIES.find((b) => b.id === bodyId);
    if (body) {
      setSelectedBody(body);
    }
  };

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-200 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Trình duyệt không hỗ trợ WebGL</h1>
        <p className="max-w-md text-sm text-slate-400 mb-6">
          Để trải nghiệm mô phỏng vũ trụ 3D Cosmic Explorer, vui lòng bật tăng tốc phần cứng (Hardware Acceleration) hoặc sử dụng trình duyệt hiện đại như Chrome, Firefox, Edge, hoặc Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 text-white font-sans">
      {/* 3D WebGL Canvas Layer */}
      <CosmicCanvas
        currentScale={currentScale}
        selectedBody={selectedBody}
        onSelectBody={handleSelectBody}
        scaleMode={scaleMode}
        interactionMode={interactionMode}
        simSpeed={simSpeed}
        showOrbits={showOrbits}
        showLabels={showLabels}
        showGrid={showGrid}
        showHabitableZone={showHabitableZone}
        showAsteroidBelt={showAsteroidBelt}
        graphicsQuality={graphicsQuality}
        supernovaTrigger={supernovaTrigger}
        resetUniverseTrigger={resetUniverseTrigger}
        onCollision={handleCollision}
        onResetViewRef={resetViewRef}
      />

      {/* Top Header & Cosmic Hierarchy */}
      <NavigationHeader
        currentScale={currentScale}
        onSelectScale={handleSelectScale}
        onSelectBody={(body) => handleSelectBody(body)}
        onOpenLearnModal={() => setIsLearnModalOpen(true)}
        onResetView={() => {
          if (resetViewRef.current) resetViewRef.current();
        }}
      />

      {/* Selected Celestial Info Slide-out Panel */}
      <CelestialInfoPanel
        body={selectedBody}
        onClose={() => setSelectedBody(null)}
        onFocusBody={(b) => handleSelectBody(b)}
        onTriggerSupernova={handleTriggerSupernova}
        onSelectInteractionMode={handleSetInteractionMode}
      />

      {/* Bottom Unified Control Dock */}
      <BottomControlDock
        simSpeed={simSpeed}
        onSetSimSpeed={setSimSpeed}
        scaleMode={scaleMode}
        onToggleScaleMode={handleToggleScaleMode}
        interactionMode={interactionMode}
        onSetInteractionMode={handleSetInteractionMode}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits(!showOrbits)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showHabitableZone={showHabitableZone}
        onToggleHabitableZone={() => setShowHabitableZone(!showHabitableZone)}
        showAsteroidBelt={showAsteroidBelt}
        onToggleAsteroidBelt={() => setShowAsteroidBelt(!showAsteroidBelt)}
        graphicsQuality={graphicsQuality}
        onSetGraphicsQuality={setGraphicsQuality}
        onTriggerSupernova={handleTriggerSupernova}
        onResetUniverse={handleResetUniverse}
        collisionCount={collisionEvents.length}
      />

      {/* Interactive Mode Floating Banner */}
      {interactionMode !== 'navigate' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/95 border border-cyan-400 shadow-2xl backdrop-blur-md animate-in fade-in">
          {interactionMode === 'drag_body' && (
            <>
              <Move className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-xs font-mono">
                <span className="text-amber-300 font-bold">Chế độ Nhấc & Kéo va chạm: </span>
                <span className="text-slate-200">Nhấp giữ một hành tinh để di chuyển hoặc kéo đập vào hành tinh khác!</span>
              </div>
            </>
          )}

          {interactionMode === 'asteroid_cannon' && (
            <>
              <Rocket className="w-4 h-4 text-rose-400 animate-bounce" />
              <div className="text-xs font-mono">
                <span className="text-rose-300 font-bold">Chế độ Pháo Bắn Tiểu Hành Tinh: </span>
                <span className="text-slate-200">Kéo lùi chuột trên không gian để ngắm và thả tay để bắn!</span>
              </div>
            </>
          )}

          {interactionMode === 'gravity_well' && (
            <>
              <Orbit className="w-4 h-4 text-indigo-400 animate-spin" />
              <div className="text-xs font-mono">
                <span className="text-indigo-300 font-bold">Hố hấp dẫn Spacetime: </span>
                <span className="text-slate-200">Lưới biến dạng không-thời gian Einstein quanh các hành tinh lớn.</span>
              </div>
            </>
          )}

          <button
            onClick={() => handleSetInteractionMode('navigate')}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors ml-2 cursor-pointer font-mono"
          >
            Thoát
          </button>
        </div>
      )}

      {/* Dramatic Collision Alert Toast */}
      {latestCollision && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-lg w-full px-3">
          <div className="bg-gradient-to-r from-red-950/95 via-slate-950/95 to-amber-950/95 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl shadow-rose-950/60 backdrop-blur-md flex flex-col gap-2 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-rose-300">
                  Cảnh báo: Thảm họa va chạm thiên thể!
                </span>
              </div>
              <button
                onClick={() => setLatestCollision(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-200">
              <strong className="text-white">{latestCollision.body1Name}</strong> 💥 <strong className="text-white">{latestCollision.body2Name}</strong>
            </div>

            <p className="text-xs text-rose-200/90 font-mono bg-black/40 p-2.5 rounded-xl border border-rose-900/40">
              {latestCollision.consequenceVi}
              <br />
              <span className="text-amber-400 mt-1 block">Năng lượng giải phóng: {latestCollision.energyJoules}</span>
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowCollisionLog(true)}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Xem lịch sử ({collisionEvents.length})</span>
              </button>

              <button
                onClick={handleResetUniverse}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục lại hành tinh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collision History Drawer / Modal */}
      {showCollisionLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border border-rose-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200 max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Nhật Ký Các Vụ Va Chạm Vũ Trụ</h3>
              </div>
              <button
                onClick={() => setShowCollisionLog(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {collisionEvents.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-xs font-mono">
                  Chưa ghi nhận vụ va chạm nào. Hãy kéo các hành tinh vào nhau hoặc bắn thiên thạch!
                </div>
              ) : (
                collisionEvents.map((ev) => (
                  <div key={ev.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                      <span className="text-rose-400 font-bold">{ev.body1Name} 💥 {ev.body2Name}</span>
                      <span>{ev.timestamp}</span>
                    </div>
                    <p className="text-slate-300">{ev.consequenceVi}</p>
                    <div className="text-amber-400 font-mono text-[11px]">Năng lượng: {ev.energyJoules}</div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleResetUniverse}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tái tạo & Khôi phục quỹ đạo</span>
              </button>
              <button
                onClick={() => setShowCollisionLog(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learn Mode Modal */}
      <LearnModal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        onNavigateToBody={handleNavigateFromTour}
      />

      {/* Quick Navigation Guide Tooltip (Dismissible) */}
      {showGuide && (
        <div className="hidden md:flex fixed bottom-22 left-6 z-20 pointer-events-auto items-center gap-3 bg-slate-950/90 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 shadow-xl backdrop-blur-md">
          <MousePointerClick className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Xoay chuột • Cuộn để zoom • Chọn chế độ "Nhấc & Kéo va chạm" hoặc "Pháo bắn thiên thạch" để tạo vụ nổ</span>
          <button
            onClick={() => setShowGuide(false)}
            className="text-slate-500 hover:text-white ml-2 transition-colors cursor-pointer"
            title="Đóng hướng dẫn"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none bg-slate-900/95 border border-cyan-400/60 rounded-xl px-4 py-2 text-xs font-mono text-cyan-200 shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
