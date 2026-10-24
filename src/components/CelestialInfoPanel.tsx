import React, { useState } from 'react';
import { CelestialBody, InteractionMode } from '../types/celestial';
import { 
  X, 
  ExternalLink, 
  Flame, 
  Layers, 
  Moon, 
  BarChart2, 
  Compass, 
  Thermometer, 
  Weight, 
  Maximize, 
  Clock, 
  Wind,
  Sparkles,
  Info,
  Move,
  Rocket
} from 'lucide-react';

interface CelestialInfoPanelProps {
  body: CelestialBody | null;
  onClose: () => void;
  onFocusBody: (body: CelestialBody) => void;
  onTriggerSupernova: () => void;
  onSelectInteractionMode: (mode: InteractionMode) => void;
}

export const CelestialInfoPanel: React.FC<CelestialInfoPanelProps> = ({
  body,
  onClose,
  onFocusBody,
  onTriggerSupernova,
  onSelectInteractionMode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'internal' | 'moons' | 'compare' | 'facts'>('overview');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!body) return null;

  const earthDiameter = 12742;
  const earthGravity = 9.807;
  const diamRatio = (body.diameterKm / earthDiameter).toFixed(2);
  const gravRatio = (body.gravityMPerS2 / earthGravity).toFixed(2);

  // If minimized, render a sleek small floating pill that never obscures the 3D celestial view!
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-30 pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-400/60 shadow-2xl backdrop-blur-md animate-in fade-in">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: body.colorHex }} />
        <span className="font-bold text-xs text-white">{body.nameVi}</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="px-2 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 hover:text-white font-mono cursor-pointer transition-colors"
          title="Mở rộng bảng chi tiết"
        >
          Chi tiết ▴
        </button>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer transition-colors"
          title="Đóng"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <aside className="fixed top-18 right-3 bottom-24 z-30 w-full max-w-sm sm:max-w-md pointer-events-auto flex flex-col bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div 
        className="p-4 relative border-b border-slate-800"
        style={{
          background: `linear-gradient(135deg, ${body.colorHex}25 0%, rgba(2, 6, 23, 0.95) 75%)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 border border-white/20"
              style={{ backgroundColor: body.colorHex }}
            >
              <span className="text-slate-950 font-black text-xs">
                {body.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">{body.nameVi}</h2>
                <span className="text-xs font-mono text-slate-400">({body.name})</span>
              </div>
              <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 mt-0.5">
                {body.typeLabelVi}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 text-xs font-mono transition-colors cursor-pointer"
              title="Thu nhỏ để không che màn hình 3D"
            >
              Thu nhỏ —
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng bảng thông tin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Actions Quick Bar */}
      <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onSelectInteractionMode('drag_body')}
          className="flex-1 py-1.5 px-2 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Kéo thiên thể này va chạm vào thiên thể khác"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Kéo va chạm</span>
        </button>

        <button
          onClick={() => onSelectInteractionMode('asteroid_cannon')}
          className="flex-1 py-1.5 px-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Bắn pháo thiên thạch vào thiên thể này"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Bắn thiên thạch</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 px-3 bg-slate-950/50 overflow-x-auto scrollbar-none text-xs font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Tổng quan
        </button>

        {body.internalLayers && body.internalLayers.length > 0 && (
          <button
            onClick={() => setActiveTab('internal')}
            className={`py-2.5 px-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'internal'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cấu trúc nội tại
          </button>
        )}

        {body.moonsList && body.moonsList.length > 0 && (
          <button
            onClick={() => setActiveTab('moons')}
            className={`py-2.5 px-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'moons'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Vệ tinh ({body.moonsCount || body.moonsList.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('compare')}
          className={`py-2.5 px-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'compare'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          So sánh Trái Đất
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          className={`py-2.5 px-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'facts'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dữ kiện ({body.funFactsVi.length})
        </button>
      </div>

      {/* Content Area with Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              {body.descriptionVi}
            </p>

            {/* Scientific Spec Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-mono">Đường kính</span>
                </div>
                <span className="font-bold font-mono text-slate-100 text-xs">
                  {body.diameterKm.toLocaleString()} km
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Weight className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-mono">Khối lượng</span>
                </div>
                <span className="font-bold font-mono text-slate-100 text-xs">
                  {body.massKg}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-mono">Nhiệt độ bề mặt</span>
                </div>
                <span className="font-bold font-mono text-slate-100 text-xs">
                  {body.surfaceTempC}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-mono">Trọng lực</span>
                </div>
                <span className="font-bold font-mono text-slate-100 text-xs">
                  {body.gravityMPerS2} m/s²
                </span>
              </div>

              {body.orbitalPeriodDays !== undefined && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] uppercase font-mono">Chu kỳ quỹ đạo</span>
                  </div>
                  <span className="font-bold font-mono text-slate-100 text-xs">
                    {body.orbitalPeriodDays > 365 
                      ? `${(body.orbitalPeriodDays / 365.25).toFixed(1)} năm`
                      : `${body.orbitalPeriodDays} ngày`}
                  </span>
                </div>
              )}

              {body.rotationPeriodHours !== undefined && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] uppercase font-mono">Chu kỳ tự quay</span>
                  </div>
                  <span className="font-bold font-mono text-slate-100 text-xs">
                    {body.rotationPeriodHours > 24 
                      ? `${(body.rotationPeriodHours / 24).toFixed(1)} ngày`
                      : `${body.rotationPeriodHours} giờ`}
                  </span>
                </div>
              )}
            </div>

            {/* Atmosphere spec */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px] mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span>Thành phần Khí quyển / Môi trường:</span>
              </div>
              <p className="text-slate-300">
                {body.atmosphereSummaryVi}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Internal Structure Layers */}
        {activeTab === 'internal' && body.internalLayers && (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs">
              Mô hình cắt lớp cấu trúc địa chất / vật lý bên trong của {body.nameVi}:
            </p>
            <div className="space-y-2">
              {body.internalLayers.map((layer, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3"
                >
                  <span 
                    className="w-4 h-4 rounded-full mt-0.5 shrink-0 shadow"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{layer.nameVi}</span>
                      <span className="text-cyan-400 font-mono text-[10px]">
                        ~{layer.thicknessKm.toLocaleString()} km
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{layer.name}</div>
                    <p className="text-slate-300 text-[11px] mt-1">{layer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Moons List */}
        {activeTab === 'moons' && body.moonsList && (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs">
              Hệ thống {body.moonsCount || body.moonsList.length} vệ tinh tự nhiên quay quanh {body.nameVi}:
            </p>
            <div className="space-y-2">
              {body.moonsList.map((moon, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold text-slate-200">{moon.nameVi}</div>
                      <div className="text-[10px] text-slate-400">{moon.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-mono text-[11px]">Ø {moon.diameterKm.toLocaleString()} km</div>
                    {moon.discoveryYear && (
                      <div className="text-slate-500 text-[10px]">Phát hiện: {moon.discoveryYear}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Compare with Earth */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-xs">
              So sánh tỷ lệ thực tế giữa {body.nameVi} và Trái Đất (Earth = 1.0x):
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-slate-300">Đường kính ({diamRatio}x)</span>
                  <span className="text-cyan-400">{body.diameterKm.toLocaleString()} km vs 12,742 km</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, parseFloat(diamRatio) * 50))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-slate-300">Trọng lực bề mặt ({gravRatio}x)</span>
                  <span className="text-cyan-400">{body.gravityMPerS2} m/s² vs 9.8 m/s²</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (body.gravityMPerS2 / earthGravity) * 50))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-cyan-300 font-bold block mb-1">Cân nặng của bạn tại đây:</span>
              <p className="text-slate-300">
                Nếu bạn nặng 60 kg trên Trái Đất, trọng lượng cơ thể bạn trên {body.nameVi} sẽ tương đương{' '}
                <strong className="text-white font-mono text-sm">
                  {(60 * (body.gravityMPerS2 / earthGravity)).toFixed(1)} kg
                </strong>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Fun Facts & Science Highlights */}
        {activeTab === 'facts' && (
          <div className="space-y-3">
            <div className="space-y-2">
              {body.funFactsVi.map((fact, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-slate-200 text-xs">{fact}</p>
                </div>
              ))}
            </div>

            {body.scientificHighlightsVi && body.scientificHighlightsVi.length > 0 && (
              <div className="mt-3">
                <span className="text-cyan-400 font-mono text-[11px] uppercase tracking-wider block mb-2">
                  Ý nghĩa nghiên cứu thiên văn:
                </span>
                <div className="space-y-2">
                  {body.scientificHighlightsVi.map((hl, idx) => (
                    <div key={idx} className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-3 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-xs">{hl}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onFocusBody(body)}
          className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-600/30 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Khám phá / Bay tới</span>
        </button>

        {body.type === 'star' && (
          <button
            onClick={onTriggerSupernova}
            className="py-2 px-3 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Thử nghiệm vụ nổ Siêu tân tinh"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Nổ sao</span>
          </button>
        )}
      </div>
    </aside>
  );
};
