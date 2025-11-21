import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import {
  BookOpen,
  Users,
  Clock,
  Share2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  ChevronRight,
  Map as MapIcon,
  Search,
  Settings,
  Layout,
  ScrollText,
  Palette,
  MapPin,
  MoreVertical,
  X,
  Maximize2,
  Image as ImageIcon,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  FileText,
  ChevronDown,
  Menu,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  PanelRightOpen,
  PanelRightClose,
  MoveUp,
  MoveDown,
  AlignJustify,
  Crop,
  Globe,
  Type,
  ZoomIn,
  ZoomOut,
  Download,
  UploadCloud,
  MousePointer2,
  Tag,
  AlertTriangle,
  LayoutTemplate
} from "lucide-react";

// --- Types ---

type ThemeColor = "indigo" | "rose" | "emerald" | "amber" | "violet" | "cyan" | "slate";

interface World {
  id: string;
  name: string;
  description: string; // Legacy string description
  descriptionBlocks?: LoreBlock[]; // New Rich Text Description
  coverImage?: string; 
  genre: string; 
  rules: string; // Legacy rules string
  concepts: LoreArticle[]; // New Structured Concepts
  theme: ThemeColor; 
  customBackground?: string; 
  customFontColor?: string; 
  panelOpacity?: number; 
  panelColor?: string; // New: Floating Panel Base Color
  timeUnit?: string; 
  characters: Character[];
  timeline: TimelineEvent[];
  timelineTracks: TimelineTrack[];
  relations: Relation[];
  lore: LoreArticle[]; 
  maps: WorldMap[]; 
  lastModified: number;
}

interface LoreArticle {
  id: string;
  title: string;
  category: string; 
  content: string; // Legacy content string
  image?: string; 
  blocks?: LoreBlock[]; 
}

interface LoreBlock {
    id: string;
    type: 'text' | 'image';
    content: string;
}

interface Character {
  id: string;
  name: string;
  role: string;
  race: string;
  description: string;
  avatar?: string; 
}

interface TimelineTrack {
    id: string;
    name: string;
    color: string; 
}

interface TimelineEvent {
  id: string;
  year: string;
  endYear?: string; 
  trackId?: string; 
  title: string;
  description: string;
  image?: string; 
}

interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
}

interface WorldMap {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string; 
  backgroundImage?: string; 
  markers: MapMarker[];
}

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
  type: string; 
  customColor?: string; 
}

// --- Constants & Mock Data ---

const DEFAULT_WORLD: World = {
  id: "world-1",
  name: "艾瑟瑞亚 (Aetheria)",
  description: "一个漂浮在巨大水晶之上的天空世界，人们依靠飞空艇往来于各个浮岛之间。魔法与蒸汽朋克科技共存。",
  descriptionBlocks: [
      { id: 'b1', type: 'text', content: "一个漂浮在巨大水晶之上的天空世界，人们依靠飞空艇往来于各个浮岛之间。魔法与蒸汽朋克科技共存。" }
  ],
  genre: "奇幻/蒸汽朋克",
  rules: "",
  concepts: [
      { id: "cp1", title: "核心法则", category: "自然规律", content: "", blocks: [{id:'b1', type:'text', content: "重力由核心水晶控制；魔法需要消耗名为'以太'的矿石。"}] },
      { id: "cp2", title: "社会阶层", category: "社会结构", content: "", blocks: [{id:'b2', type:'text', content: "居住在越高浮岛的人地位越高，底层被称为'尘民'。"}] }
  ],
  theme: "indigo",
  customBackground: "#0f172a",
  customFontColor: "#e2e8f0",
  panelOpacity: 0.7,
  panelColor: "#1e293b",
  timeUnit: "年",
  characters: [
    { id: "c1", name: "艾琳·风行者", role: "飞艇船长", race: "人类", description: "前皇家空军王牌飞行员，因违抗命令被放逐，现在经营着一艘走私飞艇。" },
    { id: "c2", name: "索尔·铁锤", role: "首席技师", race: "矮人", description: "性格暴躁但手艺精湛的技师，能修理任何机械装置。" }
  ],
  timelineTracks: [
      { id: "track-1", name: "主世界历史", color: "#6366f1" }, 
      { id: "track-2", name: "皇家编年史", color: "#ec4899" }  
  ],
  timeline: [
    { id: "t1", trackId: "track-1", year: "AE 102", endYear: "AE 105", title: "大崩坏", description: "地面世界崩塌，幸存者逃往浮空岛。" },
    { id: "t2", trackId: "track-1", year: "AE 350", title: "以太引擎发明", description: "标志着大航海时代的开始。" },
    { id: "t3", trackId: "track-2", year: "AE 355", endYear: "AE 360", title: "第一次天空战争", description: "三大商会为了争夺航路爆发的冲突。" }
  ],
  relations: [
    { id: "r1", sourceId: "c1", targetId: "c2", type: "挚友/搭档" }
  ],
  lore: [
    { id: "l1", title: "以太水晶", category: "魔法物品", content: "支撑浮空岛悬浮的核心动力源，也是施法者必需的媒介。", blocks: [
        { id: 'b1', type: 'text', content: "支撑浮空岛悬浮的核心动力源，也是施法者必需的媒介。" }
    ]},
    { id: "l2", title: "天空海盗法典", category: "组织/规则", content: "所有在非航线区域航行的船只必须遵守的不成文规定。", blocks: [
        { id: 'b2', type: 'text', content: "所有在非航线区域航行的船只必须遵守的不成文规定。" }
    ]}
  ],
  maps: [
    { 
      id: "m1", 
      name: "中央空域", 
      width: 800, 
      height: 600, 
      color: "#1e293b",
      markers: [
        { id: "mk1", x: 400, y: 300, label: "皇家空港", description: "最大的贸易枢纽", type: "城市" },
        { id: "mk2", x: 200, y: 150, label: "风暴眼", description: "极其危险的永恒风暴区", type: "遗迹" }
      ] 
    }
  ],
  lastModified: Date.now()
};

const THEMES: Record<ThemeColor, { bg: string, text: string, border: string, hover: string, ring: string, gradient: string }> = {
  indigo: { bg: "bg-indigo-600", text: "text-indigo-400", border: "border-indigo-500", hover: "hover:bg-indigo-500", ring: "focus:ring-indigo-500", gradient: "from-indigo-500 to-purple-600" },
  rose: { bg: "bg-rose-600", text: "text-rose-400", border: "border-rose-500", hover: "hover:bg-rose-500", ring: "focus:ring-rose-500", gradient: "from-rose-500 to-orange-600" },
  emerald: { bg: "bg-emerald-600", text: "text-emerald-400", border: "border-emerald-500", hover: "hover:bg-emerald-500", ring: "focus:ring-emerald-500", gradient: "from-emerald-500 to-teal-600" },
  amber: { bg: "bg-amber-600", text: "text-amber-400", border: "border-amber-500", hover: "hover:bg-amber-500", ring: "focus:ring-amber-500", gradient: "from-amber-500 to-yellow-600" },
  violet: { bg: "bg-violet-600", text: "text-violet-400", border: "border-violet-500", hover: "hover:bg-violet-500", ring: "focus:ring-violet-500", gradient: "from-violet-500 to-fuchsia-600" },
  cyan: { bg: "bg-cyan-600", text: "text-cyan-400", border: "border-cyan-500", hover: "hover:bg-cyan-500", ring: "focus:ring-cyan-500", gradient: "from-cyan-500 to-blue-600" },
  slate: { bg: "bg-slate-600", text: "text-slate-400", border: "border-slate-500", hover: "hover:bg-slate-500", ring: "focus:ring-slate-500", gradient: "from-slate-500 to-gray-600" },
};

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Enhanced color generator for tags
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 50%)`;
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 30, g: 41, b: 59 }; // Default slate-800-ish
}

// --- Components ---

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, worldName }: any) => {
    const [input, setInput] = useState("");
    useEffect(() => { if (isOpen) setInput(""); }, [isOpen]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-red-900/50 rounded-xl p-6 w-full max-w-md space-y-5 shadow-2xl ring-1 ring-red-900/20">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><AlertTriangle className="text-red-500" size={24}/> 删除世界</h3>
                <div className="space-y-2">
                    <p className="text-slate-300 text-sm leading-relaxed">您正在尝试删除 <span className="font-bold text-white">{worldName}</span>。此操作将永久清除所有数据。</p>
                </div>
                <input value={input} onChange={e => setInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:border-red-500 outline-none text-sm" placeholder={worldName} autoFocus />
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 font-medium transition-colors">取消</button>
                    <button disabled={input !== worldName} onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50">确认删除</button>
                </div>
            </div>
        </div>
    )
}

const App = () => {
  const [worlds, setWorlds] = useState<World[]>([DEFAULT_WORLD]);
  const [activeWorldId, setActiveWorldId] = useState<string>(DEFAULT_WORLD.id);
  const [activeTab, setActiveTab] = useState<"overview" | "lore" | "characters" | "timeline" | "maps" | "relations">("overview");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, worldName: string}>({isOpen: false, worldName: ''});

  const activeWorld = worlds.find((w) => w.id === activeWorldId) || worlds[0];
  const theme = THEMES[activeWorld.theme || 'indigo'];

  const updateWorld = (updates: Partial<World>) => {
    setWorlds((prev) => prev.map((w) => (w.id === activeWorldId ? { ...w, ...updates, lastModified: Date.now() } : w)));
  };

  const createNewWorld = () => {
    const newWorld: World = {
      id: `world-${Date.now()}`,
      name: "新世界项目",
      description: "在这里描述你的新世界...",
      descriptionBlocks: [{ id: `b-${Date.now()}`, type: 'text', content: "在这里描述你的新世界..." }],
      genre: "未定义",
      rules: "",
      concepts: [],
      theme: "indigo",
      customBackground: "#0f172a",
      customFontColor: "#e2e8f0",
      panelColor: "#1e293b",
      timeUnit: "年",
      characters: [],
      timeline: [],
      timelineTracks: [{ id: "track-default", name: "默认时间线", color: "#6366f1" }],
      relations: [],
      lore: [],
      maps: [],
      lastModified: Date.now()
    };
    setWorlds([...worlds, newWorld]);
    setActiveWorldId(newWorld.id);
    setActiveTab("overview");
  };

  const initiateDeleteWorld = () => {
      if (worlds.length <= 1) { alert("至少保留一个世界项目"); return; }
      setDeleteModal({ isOpen: true, worldName: activeWorld.name });
  };

  const confirmDeleteWorld = () => {
      const newWorlds = worlds.filter(w => w.id !== activeWorldId);
      setWorlds(newWorlds);
      setActiveWorldId(newWorlds[0].id);
      setDeleteModal({ isOpen: false, worldName: '' });
  };

  const exportWorld = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeWorld, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${activeWorld.name}_export.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const importWorld = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json && json.id && json.name) {
                  const newWorld = { ...json, id: `world-${Date.now()}` };
                  setWorlds([...worlds, newWorld]);
                  setActiveWorldId(newWorld.id);
                  alert("导入成功！");
              } else { alert("无效的世界数据文件"); }
          } catch (err) { alert("文件解析失败"); }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  // --- AI Helper ---
  const generateContent = async (prompt: string, field: string, context?: any) => {
    if (!process.env.API_KEY) { alert("请设置 API_KEY"); return; }
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let systemInstruction = "你是一个专业的世界观架构师和小说家助手。请用中文回答。保持回答简洁、富有创意且逻辑严密。";
      let finalPrompt = prompt;

      if (field === 'description') {
        finalPrompt = `为名为"${activeWorld.name}"的${activeWorld.genre}世界生成一段引人入胜的世界观简介。`;
      } else if (field === 'rules') {
        finalPrompt = `为"${activeWorld.name}"设计独特的概念设定。类别：${context || '综合'}。风格：${activeWorld.genre}。`;
      } else if (field === 'character') {
        finalPrompt = `基于世界观"${activeWorld.name}"，生成一个角色的详细设定。角色名/职业参考：${context || '随机'}。`;
      } else if (field === 'lore') {
        finalPrompt = `为"${activeWorld.name}"世界生成一篇关于"${context}"的背景设定（传说、物品、组织或历史）。`;
      }

      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: finalPrompt, config: { systemInstruction } });
      const text = response.text;
      
      if (text) {
        if (field === 'character' || field === 'lore' || field === 'rules' || field === 'description') { return text; } 
        else { 
            // @ts-ignore
            updateWorld({ [field]: text }); 
        }
      }
    } catch (e) { console.error(e); alert("生成失败，请重试。"); } 
    finally { setLoadingAI(false); }
  };

  // Dynamic Glass Color
  const panelRgb = hexToRgb(activeWorld.panelColor || '#1e293b');

  return (
    <div 
      className="flex h-screen overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500"
      style={{ backgroundColor: activeWorld.customBackground || '#0f172a', color: 'var(--custom-text-color)' }}
    >
      <style>{`
        :root {
          --custom-text-color: ${activeWorld.customFontColor || '#e2e8f0'};
          --panel-opacity: ${activeWorld.panelOpacity || 0.7};
          --glass-bg: rgba(${panelRgb.r}, ${panelRgb.g}, ${panelRgb.b}, var(--panel-opacity));
        }
        .glass-panel {
          background-color: var(--glass-bg) !important;
          backdrop-filter: blur(12px);
        }
        .theme-text-body { color: var(--custom-text-color); opacity: 0.9; }
        .theme-text-muted { color: var(--custom-text-color); opacity: 0.6; }
      `}</style>

      <DeleteConfirmModal isOpen={deleteModal.isOpen} worldName={deleteModal.worldName} onClose={() => setDeleteModal({isOpen: false, worldName: ''})} onConfirm={confirmDeleteWorld} />

      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900/80 border-r border-slate-800 flex flex-col z-20 transition-all duration-300 backdrop-blur-md shrink-0`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
             <div className="flex items-center gap-2 overflow-hidden">
                <Layout className={theme.text} size={20} />
                <h1 className="font-bold text-lg tracking-tight text-white whitespace-nowrap">世界架构师</h1>
             </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-1 rounded hover:bg-slate-700 text-slate-400 ${!sidebarOpen ? 'mx-auto' : ''}`}>
            {sidebarOpen ? <PanelLeftClose size={18}/> : <PanelLeftOpen size={18}/>}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {sidebarOpen && <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">我的世界项目</div>}
          {worlds.map((w) => {
            const wTheme = THEMES[w.theme || 'indigo'];
            const isActive = activeWorldId === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWorldId(w.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center group transition-colors relative ${
                  isActive ? `${wTheme.bg} bg-opacity-20 ${wTheme.text} border ${wTheme.border} border-opacity-30` : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                } ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
                title={w.name}
              >
                {sidebarOpen ? (
                    <><span className="truncate">{w.name}</span>{isActive && <ChevronRight size={14} />}</>
                ) : ( <div className={`w-2 h-2 rounded-full ${isActive ? wTheme.bg : 'bg-slate-600'}`}></div> )}
              </button>
            );
          })}
          <button onClick={createNewWorld} className={`w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-md border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all text-sm ${!sidebarOpen ? 'aspect-square px-0' : ''}`} title="新建世界">
            <Plus size={14} /> {sidebarOpen && <span>新建</span>}
          </button>
        </div>

        <div className="p-4 border-t border-slate-800">
           {sidebarOpen ? (
                <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-1 p-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer">
                        <UploadCloud size={14}/> 导入 <input type="file" className="hidden" accept=".json" onChange={importWorld}/>
                    </label>
                    <button onClick={exportWorld} className="flex items-center justify-center gap-1 p-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"><Download size={14}/> 导出</button>
                </div>
           ) : ( <button onClick={exportWorld} title="导出当前世界" className="w-full flex justify-center text-slate-500 hover:text-white"><Download size={16}/></button> )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4 overflow-hidden">
            <h2 className="text-xl font-bold text-white truncate max-w-[200px]">{activeWorld.name}</h2>
            <div className="h-6 w-px bg-slate-700 mx-2 shrink-0 hidden md:block"></div>
            <nav className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg overflow-x-auto no-scrollbar">
              <TabButton id="overview" label="概览" icon={BookOpen} active={activeTab} set={setActiveTab} theme={theme} />
              <TabButton id="lore" label="背景设定" icon={ScrollText} active={activeTab} set={setActiveTab} theme={theme} />
              <TabButton id="timeline" label="时间线" icon={Clock} active={activeTab} set={setActiveTab} theme={theme} />
              <TabButton id="maps" label="地理" icon={MapIcon} active={activeTab} set={setActiveTab} theme={theme} />
              <TabButton id="characters" label="角色" icon={Users} active={activeTab} set={setActiveTab} theme={theme} />
              <TabButton id="relations" label="关系图" icon={Share2} active={activeTab} set={setActiveTab} theme={theme} />
            </nav>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
                <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors border border-transparent ${showSettings ? 'bg-slate-800 text-white border-slate-700' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Settings size={18} /> <span className="hidden md:inline text-sm font-medium">设置</span>
                </button>
                
                {showSettings && (
                    <div className="absolute top-full right-0 mt-3 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 overflow-hidden cursor-default" onClick={(e)=>e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2"><Settings size={16}/> 世界全局设置</h3>
                            <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                        </div>
                        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Palette size={12}/> UI 主题色</h3>
                                <div className="grid grid-cols-7 gap-2">
                                {(Object.keys(THEMES) as ThemeColor[]).map((c) => (
                                    <button key={c} onClick={() => updateWorld({ theme: c })} className={`w-full aspect-square rounded-full border-2 transition-all ${THEMES[c].bg} ${activeWorld.theme === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`} title={c} />
                                ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Globe size={12}/> 全局背景色</h3>
                                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
                                    <input type="color" value={activeWorld.customBackground || "#0f172a"} onChange={(e) => updateWorld({ customBackground: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                    <div className="text-xs text-slate-400 flex-1 font-mono uppercase">{activeWorld.customBackground || "#0f172a"}</div>
                                    <button onClick={() => updateWorld({ customBackground: "#0f172a" })} className="text-xs text-slate-500 hover:text-white underline">重置</button>
                                </div>
                            </div>
                             <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Type size={12}/> 界面样式</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
                                        <span className="text-xs text-slate-300">全局字体颜色</span>
                                        <input type="color" value={activeWorld.customFontColor || "#e2e8f0"} onChange={(e) => updateWorld({ customFontColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
                                        <span className="text-xs text-slate-300">浮窗底色</span>
                                        <input type="color" value={activeWorld.panelColor || "#1e293b"} onChange={(e) => updateWorld({ panelColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                                    </div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-700">
                                        <div className="flex justify-between text-xs text-slate-300 mb-1"><span>浮窗不透明度</span><span>{Math.round((activeWorld.panelOpacity || 0.7) * 100)}%</span></div>
                                        <input type="range" min="0.1" max="1" step="0.05" value={activeWorld.panelOpacity || 0.7} onChange={(e) => updateWorld({ panelOpacity: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Clock size={12}/> 时间轴单位</h3>
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-900 border border-slate-700 rounded-lg flex-1 flex items-center px-3 py-2">
                                        <Type size={14} className="text-slate-500 mr-2"/>
                                        <input type="text" value={activeWorld.timeUnit || "年"} onChange={(e) => updateWorld({ timeUnit: e.target.value })} className="bg-transparent text-sm text-white w-full focus:outline-none" placeholder="例如: 年, AE" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="p-6 max-w-[1440px] mx-auto min-h-full">
            {activeTab === "overview" && <OverviewModule world={activeWorld} updateWorld={updateWorld} loadingAI={loadingAI} generateContent={generateContent} theme={theme} initiateDeleteWorld={initiateDeleteWorld} exportWorld={exportWorld} />}
            {activeTab === "lore" && <LoreModule world={activeWorld} updateWorld={updateWorld} loadingAI={loadingAI} generateContent={generateContent} theme={theme} />}
            {activeTab === "characters" && <CharactersModule world={activeWorld} updateWorld={updateWorld} loadingAI={loadingAI} generateContent={generateContent} theme={theme} />}
            {activeTab === "timeline" && <TimelineModule world={activeWorld} updateWorld={updateWorld} theme={theme} />}
            {activeTab === "maps" && <MapsModule world={activeWorld} updateWorld={updateWorld} theme={theme} />}
            {activeTab === "relations" && <RelationsModule world={activeWorld} updateWorld={updateWorld} theme={theme} />}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const ImageEditorModal = ({ src, isOpen, onClose, onConfirm, aspect = 1, theme, outputWidth = 600 }: any) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeAspect = useMemo(() => (!aspect || isNaN(aspect) || !isFinite(aspect) || aspect <= 0) ? 1 : aspect, [aspect]);
  const accentColor = useMemo(() => theme?.bg?.split('-')[1] || 'indigo', [theme]);
  const containerWidth = 300;
  const containerHeight = containerWidth / safeAspect;

  useEffect(() => { if(isOpen) { setScale(1); setPos({x:0, y:0}); setImageLoaded(false); } }, [isOpen, src]);

  const handleMouseDown = (e: React.MouseEvent) => { if (!imageLoaded) return; setDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if(dragging && imageLoaded) { setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); } };
  const handleMouseUp = () => setDragging(false);
  const handleWheel = (e: React.WheelEvent) => { if (!imageLoaded) return; e.stopPropagation(); setScale(Math.min(5, Math.max(0.1, scale - e.deltaY * 0.001))); };

  const handleSave = () => {
      if(!imgRef.current || !imageLoaded) return;
      try {
          const canvas = document.createElement('canvas');
          canvas.width = outputWidth || 600;
          const calculatedHeight = canvas.width / safeAspect;
          canvas.height = isFinite(calculatedHeight) && calculatedHeight > 0 ? calculatedHeight : Math.max(1, canvas.width);
          const ctx = canvas.getContext('2d');
          if(!ctx) return;
          ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.translate(canvas.width/2, canvas.height/2);
          const ratio = canvas.width / containerWidth;
          ctx.translate(pos.x * ratio, pos.y * ratio);
          ctx.scale(scale, scale);
          if (imgRef.current.naturalWidth > 0 && imgRef.current.naturalHeight > 0) {
              const drawWidth = canvas.width;
              const drawHeight = drawWidth / (imgRef.current.naturalWidth / imgRef.current.naturalHeight);
              ctx.drawImage(imgRef.current, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
          }
          onConfirm(canvas.toDataURL('image/png')); onClose();
      } catch (e) { alert("图片处理失败，请重试"); }
  };

  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md flex flex-col gap-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-white font-bold flex items-center gap-2 text-lg"><Crop size={20}/> 编辑图片</h3>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="flex justify-center bg-black/40 p-6 rounded-lg border border-slate-800/50 relative min-h-[200px] items-center overflow-hidden">
                {!imageLoaded && src && <div className="absolute inset-0 flex items-center justify-center z-20 text-indigo-500"><div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div></div>}
                {src ? (
                     <div ref={containerRef} className={`relative overflow-hidden shadow-2xl ring-1 ring-slate-700 bg-slate-900 transition-opacity duration-300 ${imageLoaded ? 'opacity-100 cursor-move' : 'opacity-0'}`}
                        style={{ width: containerWidth, height: containerHeight }}
                        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img ref={imgRef} src={src} onLoad={() => setImageLoaded(true)} onError={() => alert("图片加载失败")} style={{ width: containerWidth + 'px', height: 'auto', transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }} className="max-w-none select-none pointer-events-auto transition-transform duration-75 origin-center" draggable={false} crossOrigin="anonymous"/>
                        </div>
                        <div className="absolute inset-0 border border-white/20 pointer-events-none z-10"></div>
                    </div>
                ) : <div className="text-slate-500">无法加载图片</div>}
            </div>
            <div className={`space-y-3 transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider"><span>缩放: {(scale * 100).toFixed(0)}%</span><button onClick={() => {setScale(1); setPos({x:0,y:0})}} className="text-indigo-400 hover:text-indigo-300">重置</button></div>
                <input type="range" min="0.1" max="4" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className={`w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-${accentColor}-500`} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={onClose} className="py-2.5 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition-colors">取消</button>
                <button onClick={handleSave} disabled={!imageLoaded} className={`py-2.5 text-white rounded-lg font-bold shadow-lg ${theme.bg} ${theme.hover} transition-transform active:scale-95 disabled:opacity-50`}>确认保存</button>
            </div>
        </div>
    </div>
  );
};

// --- New: Block Editor Component ---
const BlockEditor = ({ blocks, onChange, theme, loadingAI, onGenerateAI, placeholder }: any) => {
    const [editorState, setEditorState] = useState<{isOpen: boolean, src: string | null, id: string | null}>({ isOpen: false, src: null, id: null });

    const addBlock = (index: number, type: 'text' | 'image') => {
        const newBlock: LoreBlock = { id: `b-${Date.now()}`, type, content: "" };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onChange(newBlocks);
    };

    const updateBlock = (blockId: string, content: string) => {
        onChange(blocks.map((b: LoreBlock) => b.id === blockId ? { ...b, content } : b));
    };

    const deleteBlock = (blockId: string) => {
        onChange(blocks.filter((b: LoreBlock) => b.id !== blockId));
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= blocks.length) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[index + direction];
        newBlocks[index + direction] = temp;
        onChange(newBlocks);
    };

    return (
        <div className="space-y-1 relative pb-16">
             <ImageEditorModal 
                isOpen={editorState.isOpen}
                src={editorState.src}
                aspect={1.5}
                onClose={() => setEditorState({ ...editorState, isOpen: false })}
                onConfirm={(data: string) => { if (editorState.id) updateBlock(editorState.id, data); }}
                theme={theme}
            />
            {blocks.map((block: LoreBlock, index: number) => (
                <div key={block.id} className="group relative hover:bg-slate-800/30 rounded transition-colors p-2 -mx-2">
                     <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 items-center transition-opacity z-20">
                          <div className="flex flex-col bg-slate-800 rounded border border-slate-700 shadow-sm">
                              <button onClick={() => moveBlock(index, -1)} className="p-1 text-slate-500 hover:text-white"><MoveUp size={12}/></button>
                              <button onClick={() => moveBlock(index, 1)} className="p-1 text-slate-500 hover:text-white"><MoveDown size={12}/></button>
                              <button onClick={() => deleteBlock(block.id)} className="p-1 text-slate-500 hover:text-red-400 border-t border-slate-700"><Trash2 size={12}/></button>
                          </div>
                     </div>
                     {block.type === 'image' ? (
                         <div className="w-full relative group/img">
                             {block.content ? (
                                 <img src={block.content} className="max-w-full rounded-lg shadow-lg mx-auto block border border-slate-700 cursor-pointer" alt="Content" onClick={() => setEditorState({ isOpen: true, src: block.content, id: block.id })} title="点击编辑"/>
                             ) : (
                                 <div className="h-32 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500"><ImageIcon size={24} className="mr-2"/> 请上传图片</div>
                             )}
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity flex gap-2">
                                  <label className="cursor-pointer px-3 py-1.5 bg-black/70 hover:bg-black/90 text-xs text-white rounded-full backdrop-blur flex items-center gap-2">
                                      <Upload size={12}/> {block.content ? "更换" : "上传"}
                                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if(file) { const base64 = await fileToBase64(file); setEditorState({ isOpen: true, src: base64, id: block.id }); }
                                      }}/>
                                  </label>
                              </div>
                         </div>
                     ) : (
                         <textarea value={block.content}
                              onChange={(e) => { updateBlock(block.id, e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                              className="w-full bg-transparent text-slate-300 leading-relaxed focus:outline-none resize-none overflow-hidden p-1 text-lg min-h-[1.5em]"
                              placeholder={placeholder || "输入内容..."}
                              ref={ref => { if (ref) { ref.style.height = 'auto'; ref.style.height = ref.scrollHeight + 'px'; }}}
                         />
                     )}
                     <div className="absolute bottom-0 left-0 right-0 h-4 -mb-2 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                         <div className="bg-slate-800 rounded-full shadow-lg border border-slate-700 flex overflow-hidden transform scale-90">
                             <button onClick={() => addBlock(index, 'text')} className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white border-r border-slate-700" title="插入文本"><FileText size={14}/></button>
                             <button onClick={() => addBlock(index, 'image')} className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white" title="插入图片"><ImageIcon size={14}/></button>
                         </div>
                     </div>
                </div>
            ))}
            {blocks.length === 0 && (
                <div className="text-center py-10">
                    <button onClick={() => addBlock(-1, 'text')} className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto"><Plus size={16}/> 开始写作</button>
                </div>
            )}
            {onGenerateAI && <AIButton onClick={onGenerateAI} loading={loadingAI} label="AI 续写" theme={theme} className="absolute bottom-0 right-0 shadow-2xl z-20" />}
        </div>
    );
};

const TabButton = ({ id, label, icon: Icon, active, set, theme }: any) => (
  <button onClick={() => set(id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${active === id ? `${theme.bg} text-white shadow-lg shadow-black/20` : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"}`}>
    <Icon size={14} /> {label}
  </button>
);

// --- New: Timeline Overview Widget ---
const TimelineOverviewWidget = ({ world }: any) => {
    const tracks = world.timelineTracks || [];
    const events = world.timeline || [];
    const getYear = (y: string) => parseInt(y.replace(/[^0-9-]/g, '')) || 0;

    if (events.length === 0) return <div className="p-4 text-slate-500 text-center">暂无时间线数据</div>;

    const years = events.flatMap((e: TimelineEvent) => [getYear(e.year), e.endYear ? getYear(e.endYear) : getYear(e.year)]);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const span = Math.max(10, maxYear - minYear);

    return (
        <div className="w-full overflow-x-auto pb-2 no-scrollbar">
            <div className="min-w-[800px] relative py-6 space-y-6">
                 {/* Axis */}
                 <div className="flex justify-between text-xs text-slate-500 px-2 border-b border-slate-700 pb-2 mb-2 select-none font-mono">
                    <span>{minYear} {world.timeUnit}</span>
                    <span>{Math.floor(minYear + span * 0.25)}</span>
                    <span>{Math.floor(minYear + span * 0.5)}</span>
                    <span>{Math.floor(minYear + span * 0.75)}</span>
                    <span>{maxYear} {world.timeUnit}</span>
                 </div>

                 {tracks.map((track: TimelineTrack) => {
                     const trackEvents = events.filter((e: TimelineEvent) => e.trackId === track.id || (!e.trackId && track.id === tracks[0].id));
                     if(trackEvents.length === 0) return null;
                     return (
                         <div key={track.id} className="relative h-10 w-full bg-slate-800/30 rounded flex items-center group/track mb-2">
                             <div className="absolute -left-32 w-28 text-right text-xs text-slate-400 truncate flex items-center justify-end gap-2 pr-2 border-r border-slate-700/50 h-full">
                                 <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: track.color}}></div>
                                 <span className="truncate">{track.name}</span>
                             </div>
                             <div className="relative flex-1 h-full mx-2">
                                 {trackEvents.map((ev: TimelineEvent, index: number) => {
                                     const start = getYear(ev.year);
                                     const end = ev.endYear ? getYear(ev.endYear) : start;
                                     const left = ((start - minYear) / span) * 100;
                                     const width = Math.max(1, ((Math.max(0.5, end - start)) / span) * 100);

                                     // Visual Variation Logic
                                     const mod = index % 3;
                                     let filterStyle = 'brightness(100%)';
                                     let bgPattern = 'none';
                                     if (mod === 1) {
                                         filterStyle = 'brightness(110%) saturate(90%)';
                                         bgPattern = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)';
                                     } else if (mod === 2) {
                                         filterStyle = 'brightness(90%) saturate(110%)';
                                         bgPattern = 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 100%)';
                                     }

                                     return (
                                         <div key={ev.id}
                                            className="absolute top-1 bottom-1 rounded-md shadow-sm hover:scale-[1.02] transition-all cursor-default hover:z-20 hover:ring-1 hover:ring-white/70 overflow-hidden flex items-center px-1"
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                backgroundColor: track.color,
                                                filter: filterStyle,
                                                backgroundImage: bgPattern,
                                                minWidth: '10px'
                                            }}
                                            title={`${ev.title} (${ev.year}${ev.endYear ? '-' + ev.endYear : ''})`}
                                         >
                                            <span className="text-[10px] font-bold text-white truncate drop-shadow-md w-full block">
                                                {ev.title}
                                            </span>
                                         </div>
                                     )
                                 })}
                             </div>
                         </div>
                     )
                 })}
            </div>
        </div>
    )
}

const OverviewModule = ({ world, updateWorld, loadingAI, generateContent, theme, initiateDeleteWorld, exportWorld }: any) => {
  const [editorState, setEditorState] = useState<{isOpen: boolean, src: string | null}>({ isOpen: false, src: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [conceptSidebarOpen, setConceptSidebarOpen] = useState(true);

  // Migration for description
  const descriptionBlocks = world.descriptionBlocks || (world.description ? [{ id: 'legacy-desc', type: 'text', content: world.description }] : []);
  
  // Concepts Data
  const concepts = world.concepts || [];
  const categories: string[] = Array.from(new Set(concepts.map((c: LoreArticle) => c.category || "基本概念")));
  const selectedConcept = concepts.find((c: LoreArticle) => c.id === selectedConceptId);

  useEffect(() => {
      if (expandedCategories.size === 0 && categories.length > 0) setExpandedCategories(new Set(categories));
      if (!selectedConceptId && concepts.length > 0) setSelectedConceptId(concepts[0].id);
  }, [categories.length, concepts.length]);

  const toggleCategory = (cat: string) => {
      const newSet = new Set(expandedCategories);
      if (newSet.has(cat)) newSet.delete(cat); else newSet.add(cat);
      setExpandedCategories(newSet);
  };

  const addConcept = (category = "基本概念") => {
    const newConcept: LoreArticle = { id: `cp-${Date.now()}`, title: "新概念", category: category, content: "", blocks: [{ id: `b-${Date.now()}`, type: 'text', content: "" }] };
    updateWorld({ concepts: [...concepts, newConcept] });
    setSelectedConceptId(newConcept.id);
    const newSet = new Set(expandedCategories); newSet.add(category); setExpandedCategories(newSet);
  };
  
  const updateConcept = (id: string, updates: Partial<LoreArticle>) => {
      updateWorld({ concepts: concepts.map((c: LoreArticle) => c.id === id ? { ...c, ...updates } : c) });
  };

  const deleteConcept = (id: string) => {
      const newConcepts = concepts.filter((c: LoreArticle) => c.id !== id);
      updateWorld({ concepts: newConcepts });
      if (selectedConceptId === id) setSelectedConceptId(newConcepts[0]?.id || null);
  };

  const handleDescriptionAI = async () => {
      const text = await generateContent("", "description");
      if(text) {
          const newBlock: LoreBlock = { id: `b-${Date.now()}`, type: 'text', content: text };
          updateWorld({ descriptionBlocks: [...descriptionBlocks, newBlock] });
      }
  };

  const handleConceptAI = async () => {
      if(!selectedConcept) return;
      const text = await generateContent("", "rules", `${selectedConcept.title} (${selectedConcept.category})`);
      if(text) {
          const blocks = selectedConcept.blocks || [];
          updateConcept(selectedConcept.id, { blocks: [...blocks, { id: `b-${Date.now()}`, type: 'text', content: text }] });
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) { const base64 = await fileToBase64(file); setEditorState({ isOpen: true, src: base64 }); e.target.value = ''; }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] overflow-y-auto pb-10 pr-2">
       <ImageEditorModal 
          isOpen={editorState.isOpen} src={editorState.src} aspect={16/9} theme={theme}
          onClose={() => setEditorState({ ...editorState, isOpen: false })}
          onConfirm={(data: string) => updateWorld({ coverImage: data })}
       />

      {/* 1. World Overview Banner (Top Layer) */}
      <div className="glass-panel rounded-xl border border-slate-700 overflow-hidden shrink-0 relative group min-h-[200px] flex flex-col justify-end shadow-2xl">
           {/* Background Image */}
           <div className="absolute inset-0 bg-slate-900">
                {world.coverImage ? (
                    <img src={world.coverImage} className="w-full h-full object-cover opacity-50 blur-sm group-hover:blur-none transition-all duration-700"/> 
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
           </div>

           {/* Content */}
           <div className="relative p-8 flex flex-col md:flex-row justify-between items-end gap-6 z-10">
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-6">
                         <div className="w-24 h-24 rounded-lg border-2 border-white/20 shadow-2xl overflow-hidden bg-slate-800 shrink-0 group/icon cursor-pointer relative" onClick={() => fileInputRef.current?.click()} title="点击更换封面">
                             {world.coverImage ? <img src={world.coverImage} className="w-full h-full object-cover"/> : <ImageIcon className="text-slate-600 m-auto h-full w-1/2"/>}
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity"><Upload className="text-white"/></div>
                         </div>
                         <div className="flex-1 min-w-0">
                             <input type="text" value={world.name} onChange={(e)=>updateWorld({name: e.target.value})} className="bg-transparent text-4xl font-bold text-white focus:outline-none border-b border-transparent focus:border-slate-500 w-full placeholder-slate-500 truncate shadow-black/50 drop-shadow-lg" placeholder="未命名世界"/>
                             <input type="text" value={world.genre} onChange={(e)=>updateWorld({genre: e.target.value})} className="bg-transparent text-lg text-slate-300 focus:outline-none border-b border-transparent focus:border-slate-500 mt-1 w-full placeholder-slate-400" placeholder="设定类型 (如: 蒸汽朋克)"/>
                         </div>
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-3 shrink-0">
                    <button onClick={exportWorld} className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors"><Share2 size={16}/> 导出</button>
                    <button onClick={initiateDeleteWorld} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur border border-red-500/30 rounded-lg text-red-200 text-sm font-medium flex items-center gap-2 transition-colors"><Trash2 size={16}/> 删除</button>
                </div>
           </div>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}/>
      </div>

      {/* 2. World Description */}
      <SectionCard title="世界简介" icon={ScrollText} theme={theme}>
          <BlockEditor 
                blocks={descriptionBlocks}
                onChange={(newBlocks: LoreBlock[]) => updateWorld({ descriptionBlocks: newBlocks })}
                theme={theme}
                loadingAI={loadingAI}
                onGenerateAI={handleDescriptionAI}
                placeholder="在此处输入世界的核心介绍、起源故事或地理概貌..."
            />
      </SectionCard>

      {/* 3. Timeline Overview Widget */}
      <SectionCard title="时间线总览" icon={Clock} theme={theme}>
          <TimelineOverviewWidget world={world} />
      </SectionCard>

      {/* 4. World Concepts */}
      <div className="flex flex-col gap-4 h-[600px] shrink-0">
          <div className="flex items-center gap-2 text-white font-bold px-1">
               <LayoutTemplate size={20} className={theme.text}/>
               <h3 className="text-lg">世界概念</h3>
          </div>
         <div className="glass-panel rounded-xl border border-slate-700 flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className={`${conceptSidebarOpen ? 'w-60' : 'w-12'} bg-slate-900/50 border-r border-slate-700 flex flex-col shrink-0 transition-all duration-300`}>
                 <div className={`p-3 border-b border-slate-700 flex items-center ${conceptSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {conceptSidebarOpen && <h3 className="font-bold text-slate-200 text-sm truncate">目录</h3>}
                    <button onClick={() => setConceptSidebarOpen(!conceptSidebarOpen)} className="text-slate-500 hover:text-white">
                        {conceptSidebarOpen ? <PanelLeftClose size={16}/> : <PanelLeftOpen size={16}/>}
                    </button>
                 </div>
                 {conceptSidebarOpen ? (
                    <div className="flex-1 overflow-y-auto p-2">
                        {categories.sort().map(cat => (
                            <div key={cat} className="mb-1">
                                <div onClick={() => toggleCategory(cat)} className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                                    {expandedCategories.has(cat) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                    <span className="font-medium flex-1 truncate">{cat}</span>
                                </div>
                                {expandedCategories.has(cat) && (
                                    <div className="ml-4 pl-2 border-l border-slate-700/50 mt-1 space-y-0.5">
                                        {concepts.filter((c: LoreArticle) => c.category === cat).map((c: LoreArticle) => (
                                            <div key={c.id} onClick={() => setSelectedConceptId(c.id)} className={`flex items-center justify-between px-2 py-1 text-sm rounded cursor-pointer transition-all ${selectedConceptId === c.id ? `${theme.bg} bg-opacity-20 ${theme.text}` : "text-slate-400 hover:bg-slate-800/50"}`}>
                                                <span className="truncate">{c.title}</span>
                                            </div>
                                        ))}
                                        <button onClick={() => addConcept(cat)} className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500 hover:text-slate-300 w-full text-left"><Plus size={10}/> 新建...</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="p-2 border-t border-slate-800 mt-2">
                            <button onClick={() => addConcept()} className={`w-full flex items-center justify-center gap-2 p-1.5 text-xs text-white rounded ${theme.bg} ${theme.hover}`}><Plus size={12}/> 新建概念</button>
                        </div>
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center pt-4 gap-4">
                        <button onClick={() => addConcept()} className={`p-2 rounded-full ${theme.bg} text-white`} title="新建概念"><Plus size={16}/></button>
                    </div>
                 )}
            </div>
            {/* Editor */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#0b1121] relative">
                 {selectedConcept ? (
                     <div className="max-w-3xl mx-auto pb-20">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-700/50">
                            <div className="flex-1 space-y-2">
                                <input type="text" value={selectedConcept.title} onChange={(e) => updateConcept(selectedConcept.id, { title: e.target.value })} className="w-full bg-transparent text-3xl font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-slate-500 focus:outline-none pb-1 transition-colors" placeholder="概念标题" />
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">分类</span>
                                    <input type="text" value={selectedConcept.category} onChange={(e) => updateConcept(selectedConcept.id, { category: e.target.value })} className="bg-transparent border-b border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-slate-500 py-0.5" placeholder="输入分类..." />
                                </div>
                            </div>
                            <button onClick={() => deleteConcept(selectedConcept.id)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-slate-800 rounded" title="删除"><Trash2 size={18}/></button>
                        </div>
                        <BlockEditor 
                            blocks={selectedConcept.blocks || []}
                            onChange={(newBlocks: LoreBlock[]) => updateConcept(selectedConcept.id, { blocks: newBlocks })}
                            theme={theme}
                            loadingAI={loadingAI}
                            onGenerateAI={handleConceptAI}
                        />
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 select-none">
                        <LayoutTemplate size={64} className="opacity-10"/>
                        <p>从左侧选择一个世界概念，或创建一个新概念。</p>
                     </div>
                 )}
            </div>
         </div>
      </div>
    </div>
  );
};

const LoreModule = ({ world, updateWorld, loadingAI, generateContent, theme }: any) => {
  const [selectedLoreId, setSelectedLoreId] = useState<string | null>(world.lore?.[0]?.id || null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const lores: LoreArticle[] = world.lore || [];
  const selectedLore = lores.find((l: LoreArticle) => l.id === selectedLoreId);
  const categories: string[] = Array.from(new Set(lores.map((l: LoreArticle) => l.category || "未分类")));

  useEffect(() => { if (expandedCategories.size === 0 && categories.length > 0) setExpandedCategories(new Set(categories)); }, [categories.length]);

  const toggleCategory = (cat: string) => { const newSet = new Set(expandedCategories); if (newSet.has(cat)) newSet.delete(cat); else newSet.add(cat); setExpandedCategories(newSet); };
  const addLore = (category = "未分类") => {
    const newLore: LoreArticle = { id: `l-${Date.now()}`, title: "新设定", category: category, content: "", blocks: [{ id: `b-${Date.now()}`, type: 'text', content: "" }] };
    updateWorld({ lore: [...lores, newLore] }); setSelectedLoreId(newLore.id);
    const newSet = new Set(expandedCategories); newSet.add(category); setExpandedCategories(newSet);
  };
  const updateLore = (id: string, updates: Partial<LoreArticle>) => { updateWorld({ lore: lores.map((l: LoreArticle) => l.id === id ? { ...l, ...updates } : l) }); };
  const deleteLore = (id: string) => { updateWorld({ lore: lores.filter((l: LoreArticle) => l.id !== id) }); if (selectedLoreId === id) setSelectedLoreId(null); };

  const handleAIGen = async () => {
    if (!selectedLore) return;
    const content = await generateContent("", "lore", `${selectedLore.title} (${selectedLore.category})`);
    if (content) { updateLore(selectedLore.id, { blocks: [...(selectedLore.blocks || []), { id: `b-${Date.now()}`, type: 'text', content }] }); }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
       <div className="w-72 flex flex-col glass-panel rounded-xl border border-slate-700 overflow-hidden shrink-0">
         <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-200">设定集目录</h3>
            <button onClick={() => addLore()} className={`p-1 text-white rounded ${theme.bg} ${theme.hover}`} title="新建词条"><Plus size={16}/></button>
         </div>
         <div className="flex-1 overflow-y-auto p-2 select-none">
            {categories.sort().map(cat => (
                <div key={cat} className="mb-1">
                    <div onClick={() => toggleCategory(cat)} className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                        {expandedCategories.has(cat) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                        <Folder size={14} className="text-amber-500"/>
                        <span className="font-medium flex-1">{cat}</span>
                        <span className="text-xs text-slate-600 bg-slate-900 px-1.5 rounded-full">{lores.filter((l:LoreArticle)=>l.category===cat).length}</span>
                    </div>
                    {expandedCategories.has(cat) && (
                        <div className="ml-2 pl-2 border-l border-slate-700/50 mt-1 space-y-0.5">
                             {lores.filter((l: LoreArticle) => l.category === cat).map((l: LoreArticle) => (
                                 <div key={l.id} onClick={() => setSelectedLoreId(l.id)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded cursor-pointer transition-all ${selectedLoreId === l.id ? `${theme.bg} bg-opacity-20 ${theme.text}` : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"}`}>
                                     <FileText size={12} className={selectedLoreId === l.id ? theme.text : "text-slate-600"}/>
                                     <span className="truncate">{l.title}</span>
                                 </div>
                             ))}
                             <button onClick={() => addLore(cat)} className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500 hover:text-slate-300 w-full text-left ml-1"><Plus size={10}/> 新建...</button>
                        </div>
                    )}
                </div>
            ))}
         </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl border border-slate-700 p-8 overflow-y-auto flex flex-col min-w-0 relative bg-[#0b1121]">
        {selectedLore ? (
           <div className="max-w-3xl mx-auto w-full pb-20">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-700/50">
                  <div className="flex-1 space-y-4">
                      <input type="text" value={selectedLore.title} onChange={(e) => updateLore(selectedLore.id, { title: e.target.value })} className="w-full bg-transparent text-4xl font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-slate-500 focus:outline-none pb-2 transition-colors" placeholder="词条标题" />
                      <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">分类</span>
                          <input type="text" value={selectedLore.category} onChange={(e) => updateLore(selectedLore.id, { category: e.target.value })} className="bg-transparent border-b border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-slate-500 py-0.5" placeholder="输入分类..." />
                      </div>
                  </div>
                  <button onClick={() => deleteLore(selectedLore.id)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-slate-800 rounded transition-colors" title="删除词条"><Trash2 size={18}/></button>
              </div>
              <BlockEditor 
                  blocks={selectedLore.blocks || []}
                  onChange={(newBlocks: LoreBlock[]) => updateLore(selectedLore.id, { blocks: newBlocks })}
                  theme={theme}
                  loadingAI={loadingAI}
                  onGenerateAI={handleAIGen}
              />
           </div>
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 select-none"><ScrollText size={64} className="opacity-10"/><p>从左侧目录选择一个词条，或创建一个新词条。</p></div>
        )}
      </div>
    </div>
  );
};

const CharactersModule = ({ world, updateWorld, loadingAI, generateContent, theme }: any) => {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(world.characters[0]?.id || null);
  const [editorState, setEditorState] = useState<{isOpen: boolean, src: string | null}>({ isOpen: false, src: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedChar = world.characters.find((c: Character) => c.id === selectedCharId);

  const addCharacter = () => {
    const newChar: Character = { id: `c-${Date.now()}`, name: "未命名角色", role: "平民", race: "人类", description: "" };
    updateWorld({ characters: [...world.characters, newChar] }); setSelectedCharId(newChar.id);
  };
  const updateCharacter = (id: string, updates: Partial<Character>) => { updateWorld({ characters: world.characters.map((c: Character) => c.id === id ? { ...c, ...updates } : c) }); };
  const handleAIGen = async () => { if(!selectedChar) return; const desc = await generateContent(selectedChar.name, 'character', `${selectedChar.name} (${selectedChar.role})`); if(desc) updateCharacter(selectedChar.id, { description: desc }); };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file && selectedChar) { const base64 = await fileToBase64(file); setEditorState({ isOpen: true, src: base64 }); e.target.value = ''; } };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
       <ImageEditorModal isOpen={editorState.isOpen} src={editorState.src} aspect={1} onClose={() => setEditorState({ ...editorState, isOpen: false })} onConfirm={(data: string) => { if (selectedChar) updateCharacter(selectedChar.id, { avatar: data }); }} theme={theme} />
      <div className="w-72 flex flex-col glass-panel rounded-xl border border-slate-700 overflow-hidden shrink-0">
         <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-bold text-slate-200">角色列表</h3>
            <button onClick={addCharacter} className={`p-1 text-white rounded ${theme.bg} ${theme.hover}`}><Plus size={16}/></button>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {world.characters.map((c: Character) => (
                <div key={c.id} onClick={() => setSelectedCharId(c.id)} className={`p-3 rounded cursor-pointer border transition-all flex items-center gap-3 ${selectedCharId === c.id ? `bg-slate-800/80 ${theme.border} border` : "bg-slate-800/30 border-transparent hover:bg-slate-800"}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">{c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover"/> : <Users size={16} className="text-slate-500"/>}</div>
                    <div><div className="font-bold text-slate-200 text-sm">{c.name}</div><div className="text-xs text-slate-500">{c.race} • {c.role}</div></div>
                </div>
            ))}
         </div>
      </div>
      <div className="flex-1 glass-panel rounded-xl border border-slate-700 p-6 overflow-y-auto">
        {selectedChar ? (
            <div className="space-y-6">
                <div className="flex gap-8 items-start">
                    <div className="w-48 h-48 rounded-2xl bg-slate-800 border-4 border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-600 overflow-hidden cursor-pointer relative group shrink-0 shadow-2xl transition-all" onClick={() => fileInputRef.current?.click()}>
                        {selectedChar.avatar ? <img src={selectedChar.avatar} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2"><Users size={48} className="opacity-50"/><span className="text-xs font-medium">上传头像</span></div>}
                        <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"><Upload size={32} className="text-white mb-2"/><span className="text-sm text-white font-bold uppercase tracking-widest">更换/编辑</span></div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="flex-1 space-y-4 pt-2">
                        <input type="text" value={selectedChar.name} onChange={(e) => updateCharacter(selectedChar.id, { name: e.target.value })} className={`w-full bg-transparent text-4xl font-bold text-white border-b border-slate-700 focus:outline-none pb-2 focus:border-current ${theme.text}`} placeholder="角色名称" />
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                             <div className="space-y-1"><label className="text-xs text-slate-500 uppercase font-bold">种族</label><input type="text" value={selectedChar.race} onChange={(e) => updateCharacter(selectedChar.id, { race: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:border-slate-500 focus:outline-none" /></div>
                             <div className="space-y-1"><label className="text-xs text-slate-500 uppercase font-bold">职业 / 身份</label><input type="text" value={selectedChar.role} onChange={(e) => updateCharacter(selectedChar.id, { role: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:border-slate-500 focus:outline-none" /></div>
                        </div>
                    </div>
                </div>
                <div className="relative pt-4 border-t border-slate-700/50">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-3">背景故事 & 设定</label>
                     <textarea value={selectedChar.description} onChange={(e) => updateCharacter(selectedChar.id, { description: e.target.value })} className={`w-full h-80 bg-slate-900/50 border border-slate-700 rounded-lg p-6 theme-text-body focus:outline-none resize-none leading-loose text-base focus:border-current transition-colors ${theme.text}`} placeholder="输入详细的角色背景、性格特征和经历..." />
                     <AIButton onClick={handleAIGen} loading={loadingAI} label="AI 完善设定" className="absolute bottom-4 right-4" theme={theme} />
                </div>
            </div>
        ) : <div className="h-full flex items-center justify-center text-slate-500">选择或创建一个角色</div>}
      </div>
    </div>
  );
};

const TimelineModule = ({ world, updateWorld, theme }: any) => {
    const [viewMode, setViewMode] = useState<'chart' | 'axis' | 'grid'>('chart');
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [editorState, setEditorState] = useState<{isOpen: boolean, src: string | null}>({ isOpen: false, src: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const tracks = world.timelineTracks && world.timelineTracks.length > 0 ? world.timelineTracks : [{ id: 'default', name: '默认时间线', color: '#6366f1' }];
    const getYearNum = (yearStr: string) => { const num = parseInt(yearStr.replace(/[^0-9-]/g, '')); return isNaN(num) ? 0 : num; };
    const addEvent = () => { const newEvent: TimelineEvent = { id: `t-${Date.now()}`, year: "100", endYear: "", trackId: tracks[0].id, title: "新事件", description: "" }; updateWorld({ timeline: [...world.timeline, newEvent] }); setSelectedEventId(newEvent.id); };
    const updateEvent = (id: string, updates: Partial<TimelineEvent>) => { updateWorld({ timeline: world.timeline.map((t: TimelineEvent) => t.id === id ? { ...t, ...updates } : t) }); };
    const deleteEvent = (id: string) => { updateWorld({ timeline: world.timeline.filter((t: TimelineEvent) => t.id !== id) }); if (selectedEventId === id) setSelectedEventId(null); };
    const addTrack = () => { updateWorld({ timelineTracks: [...(world.timelineTracks || []), { id: `tr-${Date.now()}`, name: "新时间线", color: "#94a3b8" }] }); };
    const updateTrack = (id: string, updates: Partial<TimelineTrack>) => { updateWorld({ timelineTracks: tracks.map((t: TimelineTrack) => t.id === id ? { ...t, ...updates } : t) }); };
    const deleteTrack = (id: string) => { if (tracks.length <= 1) return; const newTracks = tracks.filter((t: TimelineTrack) => t.id !== id); updateWorld({ timeline: world.timeline.map((t: TimelineEvent) => t.trackId === id ? { ...t, trackId: newTracks[0].id } : t), timelineTracks: newTracks }); };

    const sortedTimeline = [...world.timeline].sort((a, b) => getYearNum(a.year) - getYearNum(b.year));
    const activeEvent = sortedTimeline.find(e => e.id === selectedEventId);
    const allYears = sortedTimeline.flatMap(e => [getYearNum(e.year), e.endYear ? getYearNum(e.endYear) : getYearNum(e.year)]);
    const minYear = allYears.length > 0 ? Math.min(...allYears) - 10 : 0;
    const maxYear = allYears.length > 0 ? Math.max(...allYears) + 10 : 100;
    const totalSpan = Math.max(50, maxYear - minYear);
    const pxPerYear = 10;
    const timeUnit = world.timeUnit || "年";

    return (
        <div className="flex h-[calc(100vh-140px)] gap-4">
             <ImageEditorModal isOpen={editorState.isOpen} src={editorState.src} aspect={16/9} onClose={() => setEditorState({ ...editorState, isOpen: false })} onConfirm={(data: string) => { if (activeEvent) updateEvent(activeEvent.id, { image: data }); }} theme={theme} />
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="glass-panel p-3 rounded-xl border border-slate-700 flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-4">
                        <h3 className={`text-lg font-bold text-white flex items-center gap-2`}><Clock size={20} className={theme.text} /> 历史时间线</h3>
                        <div className="bg-slate-800 rounded-lg p-0.5 flex items-center border border-slate-700">
                            <button onClick={() => setViewMode('chart')} className={`p-1.5 rounded transition-all ${viewMode === 'chart' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><Layout size={14}/></button>
                            <button onClick={() => setViewMode('axis')} className={`p-1.5 rounded transition-all ${viewMode === 'axis' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><ListIcon size={14}/></button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><LayoutGrid size={14}/></button>
                        </div>
                     </div>
                     <button onClick={addEvent} className={`flex items-center gap-1 px-3 py-1.5 text-white rounded text-sm ${theme.bg} ${theme.hover}`}><Plus size={14}/> 添加事件</button>
                </div>
                <div className="flex-1 glass-panel border border-slate-700 rounded-xl overflow-hidden relative flex flex-col">
                    {viewMode === 'chart' && (
                        <div className="flex-1 overflow-auto relative bg-[#0b1121]">
                            <div className="sticky top-0 left-0 right-0 h-12 bg-indigo-500/20 backdrop-blur border-b border-indigo-500/30 z-20 flex items-end pointer-events-none overflow-hidden" style={{ width: `${totalSpan * pxPerYear + 200}px` }}>
                                 <div className="h-full w-full relative">
                                    {Array.from({ length: Math.ceil(totalSpan / 10) + 2 }).map((_, i) => {
                                        const year = minYear + i * 10; const left = (year - minYear) * pxPerYear + 20;
                                        return ( <div key={i} className="absolute bottom-0 h-full border-l border-indigo-400/30 text-[10px] text-indigo-200 pl-1 select-none" style={{ left }}><span className="absolute bottom-1 left-1">{year}{timeUnit}</span></div> )
                                    })}
                                 </div>
                            </div>
                            <div className="p-5 pb-20" style={{ width: `${totalSpan * pxPerYear + 200}px` }}>
                                <div className="space-y-4 mt-4">
                                    {tracks.map(track => {
                                        const trackEvents = sortedTimeline.filter(e => (e.trackId === track.id) || (!e.trackId && track.id === tracks[0].id));
                                        return (
                                        <div key={track.id} className="relative group/track">
                                            <div className="sticky left-0 z-10 mb-1 flex items-center gap-2"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: track.color }}></div><span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-[#0b1121]/90 backdrop-blur px-2 rounded border border-slate-800">{track.name}</span></div>
                                            <div className="relative h-10 w-full bg-slate-800/20 rounded border border-slate-800/50">
                                                {trackEvents.map((event, index) => {
                                                    const start = getYearNum(event.year); const end = event.endYear ? getYearNum(event.endYear) : start; const duration = Math.max(1, end - start); const left = (start - minYear) * pxPerYear + 20; const width = Math.max(20, duration * pxPerYear); const isSelected = selectedEventId === event.id;
                                                    const mod = index % 3; let filterStyle = '', bgPattern = 'none';
                                                    if (mod === 0) filterStyle = 'brightness(100%)'; else if (mod === 1) { filterStyle = 'brightness(115%) saturate(80%)'; bgPattern = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 10px)'; } else { filterStyle = 'brightness(85%) saturate(120%)'; bgPattern = 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)'; }
                                                    return (
                                                        <div key={event.id} onClick={() => setSelectedEventId(event.id)} className={`absolute top-1 bottom-1 cursor-pointer transition-all group/event z-10 hover:z-20`} style={{ left, width }}>
                                                            <div className={`w-full h-full overflow-hidden rounded-md px-2 flex items-center shadow-lg relative ${isSelected ? 'ring-2 ring-white z-20' : 'opacity-95 hover:opacity-100 hover:scale-[1.02]'} transition-transform`} style={{ backgroundColor: track.color, filter: filterStyle, backgroundImage: bgPattern }}>
                                                                <div className="text-[10px] font-bold text-white truncate drop-shadow-md flex items-center gap-2 w-full mix-blend-plus-lighter"><span>{event.title}</span>{width > 100 && <span className="opacity-70 font-normal">{event.description}</span>}</div>
                                                            </div>
                                                            <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 border border-slate-600 p-3 rounded shadow-xl opacity-0 group-hover/event:opacity-100 pointer-events-none transition-opacity z-50">
                                                                <div className="font-bold text-sm text-white mb-1">{event.title}</div><div className="text-[10px] text-slate-400 mb-2 bg-slate-900/50 px-1 rounded inline-block">{event.year} {event.endYear ? `— ${event.endYear}` : ''} {timeUnit}</div><div className="text-xs text-slate-300 line-clamp-3">{event.description}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    )}
                    {viewMode === 'axis' && (
                         <div className="p-8 overflow-y-auto max-w-4xl mx-auto w-full bg-[#0b1121]">
                            <div className="relative">
                                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-700/50 transform md:-translate-x-1/2"></div>
                                {sortedTimeline.map((event, index) => {
                                    const isLeft = index % 2 === 0; const track = tracks.find(t => t.id === event.trackId) || tracks[0];
                                    return (
                                        <div key={event.id} className={`relative flex items-center gap-8 mb-8 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                            <div className="flex-1 ml-16 md:ml-0 cursor-pointer group" onClick={() => setSelectedEventId(event.id)}>
                                                <div className={`glass-panel p-4 rounded-xl border transition-all relative overflow-hidden ${selectedEventId === event.id ? 'border-white bg-slate-800' : 'border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50'}`}>
                                                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: track.color }}></div>
                                                    <div className="flex justify-between items-start mb-2 pl-2"><span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{event.year}{timeUnit}</span><span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: track.color}}></div>{track.name}</span></div>
                                                    <h4 className="font-bold text-white text-lg mb-1 pl-2">{event.title}</h4><p className="text-sm text-slate-400 line-clamp-3 pl-2">{event.description}</p>
                                                </div>
                                            </div>
                                            <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10"><div className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg ring-4 ring-[#0b1121]" style={{ backgroundColor: track.color }}></div></div><div className="hidden md:block flex-1"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {viewMode === 'grid' && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
                             {sortedTimeline.map((event) => (
                                 <div key={event.id} onClick={() => setSelectedEventId(event.id)} className={`p-4 rounded-xl border bg-slate-800/50 cursor-pointer transition-all flex gap-4 hover:bg-slate-800 ${selectedEventId === event.id ? theme.border : 'border-slate-700'}`}>
                                     <div className="w-16 h-16 bg-slate-900 rounded overflow-hidden shrink-0">{event.image ? <img src={event.image} className="w-full h-full object-cover"/> : <Clock size={24} className="m-auto text-slate-600 mt-5"/>}</div>
                                     <div className="overflow-hidden"><div className="text-xs text-slate-500 font-mono mb-1">{event.year}{timeUnit}</div><div className="font-bold text-slate-200 truncate">{event.title}</div><div className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</div></div>
                                 </div>
                             ))}
                        </div>
                    )}
                    {selectedEventId && activeEvent && (
                        <div className="h-48 border-t border-slate-700 bg-slate-900/95 backdrop-blur p-4 flex gap-6 animate-in slide-in-from-bottom-5 absolute bottom-0 w-full z-30">
                            <div className="w-40 shrink-0 relative group cursor-pointer bg-slate-800 rounded-lg border border-slate-700 overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                                {activeEvent.image ? <img src={activeEvent.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-600 flex-col gap-2"><ImageIcon size={24}/><span className="text-xs">添加配图</span></div>}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"><Upload size={24} className="text-white"/>{activeEvent.image && <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded">点击编辑</span>}</div>
                                <input type="file" className="hidden" ref={fileInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if(f) { const base64 = await fileToBase64(f); setEditorState({ isOpen: true, src: base64 }); e.target.value = ''; } }}/>
                            </div>
                            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
                                <div className="flex gap-3"><input value={activeEvent.year} onChange={(e) => updateEvent(activeEvent.id, { year: e.target.value })} className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white text-center" placeholder="开始年份"/><span className="text-slate-500 self-center">-</span><input value={activeEvent.endYear || ""} onChange={(e) => updateEvent(activeEvent.id, { endYear: e.target.value })} className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white text-center" placeholder="结束年份"/><select value={activeEvent.trackId || tracks[0].id} onChange={(e) => updateEvent(activeEvent.id, { trackId: e.target.value })} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300 outline-none">{tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select><div className="flex-1"></div><button onClick={() => setSelectedEventId(null)} className="text-slate-500 hover:text-white"><X size={18}/></button></div>
                                <input value={activeEvent.title} onChange={(e) => updateEvent(activeEvent.id, { title: e.target.value })} className="bg-transparent text-lg font-bold text-white border-b border-slate-700 focus:border-indigo-500 outline-none" placeholder="事件标题"/>
                                <textarea value={activeEvent.description} onChange={(e) => updateEvent(activeEvent.id, { description: e.target.value })} className="w-full bg-transparent text-slate-400 text-sm resize-none focus:outline-none h-full" placeholder="事件描述..."/>
                                <div className="flex justify-end"><button onClick={() => deleteEvent(activeEvent.id)} className="text-red-400 text-xs hover:underline flex items-center gap-1"><Trash2 size={12}/> 删除事件</button></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`glass-panel border border-slate-700 rounded-xl flex flex-col transition-all duration-300 ${rightSidebarOpen ? 'w-64' : 'w-12'}`}>
                <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                    {rightSidebarOpen && <span className="text-sm font-bold text-slate-300">时间线管理</span>}
                    <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="text-slate-500 hover:text-white mx-auto">{rightSidebarOpen ? <PanelRightClose size={16}/> : <PanelRightOpen size={16}/>}</button>
                </div>
                {rightSidebarOpen && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {tracks.map(track => (
                            <div key={track.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 group">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="color" value={track.color} onChange={(e) => updateTrack(track.id, { color: e.target.value })} className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"/>
                                    <input value={track.name} onChange={(e) => updateTrack(track.id, { name: e.target.value })} className="flex-1 bg-transparent text-sm font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-slate-500"/>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span>{sortedTimeline.filter(e => e.trackId === track.id).length} 个事件</span>
                                    {tracks.length > 1 && ( <button onClick={() => deleteTrack(track.id)} className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button> )}
                                </div>
                            </div>
                        ))}
                        <button onClick={addTrack} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-500 text-sm hover:border-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"><Plus size={14}/> 新建时间线</button>
                    </div>
                )}
                {!rightSidebarOpen && ( <div className="flex-1 flex flex-col items-center py-4 gap-2">{tracks.map(t => ( <div key={t.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} title={t.name}></div> ))}</div> )}
            </div>
        </div>
    );
};

const MapsModule = ({ world, updateWorld, theme }: any) => {
    const [activeMapId, setActiveMapId] = useState<string>(world.maps?.[0]?.id || "");
    const [showMapSettings, setShowMapSettings] = useState(false);
    const [editorState, setEditorState] = useState<{isOpen: boolean, src: string | null}>({ isOpen: false, src: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const maps = world.maps || [];
    const activeMap = maps.find((m: WorldMap) => m.id === activeMapId);
    useEffect(() => { setTransform({ scale: 1, x: 0, y: 0 }); }, [activeMapId]);

    const addMap = () => { const newMap: WorldMap = { id: `m-${Date.now()}`, name: "未命名地图", width: 800, height: 600, color: "#1e293b", markers: [] }; updateWorld({ maps: [...maps, newMap] }); setActiveMapId(newMap.id); };
    const updateActiveMap = (updates: Partial<WorldMap>) => { if (!activeMap) return; updateWorld({ maps: maps.map((m: WorldMap) => m.id === activeMap.id ? { ...m, ...updates } : m) }); };
    const deleteMap = (id: string) => { const newMaps = maps.filter((m: WorldMap) => m.id !== id); updateWorld({ maps: newMaps }); if(activeMapId === id) setActiveMapId(newMaps[0]?.id || ""); };

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => { e.preventDefault(); if (!activeMap) return; if ((e.target as HTMLElement).closest('.map-marker')) return; const rect = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - rect.left - transform.x) / transform.scale; const y = (e.clientY - rect.top - transform.y) / transform.scale; const newMarker: MapMarker = { id: `mk-${Date.now()}`, x, y, label: "新地点", description: "", type: "一般地点" }; updateActiveMap({ markers: [...activeMap.markers, newMarker] }); setSelectedMarkerId(newMarker.id); };
    const handleMapMouseDown = (e: React.MouseEvent) => { if ((e.target as HTMLElement).closest('.map-marker')) return; setIsDraggingMap(true); setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); };
    const handleMapMouseMove = (e: React.MouseEvent) => { if (isDraggingMap) { setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })); } };
    const handleMapMouseUp = () => { setIsDraggingMap(false); };
    const handleWheel = (e: React.WheelEvent) => { e.stopPropagation(); };
    const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
    const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.2) }));
    const resetZoom = () => setTransform({ scale: 1, x: 0, y: 0 });
    const updateMarker = (id: string, updates: Partial<MapMarker>) => { if (!activeMap) return; updateActiveMap({ markers: activeMap.markers.map((m: MapMarker) => m.id === id ? { ...m, ...updates } : m) }); };
    const deleteMarker = (id: string) => { if (!activeMap) return; updateActiveMap({ markers: activeMap.markers.filter((m: MapMarker) => m.id !== id) }); };
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const base64 = await fileToBase64(file); setEditorState({ isOpen: true, src: base64 }); e.target.value = ''; } };

    return (
      <div className="flex h-[calc(100vh-140px)] gap-6">
        {activeMap && ( <ImageEditorModal isOpen={editorState.isOpen} src={editorState.src} aspect={(activeMap.width && activeMap.height) ? activeMap.width / activeMap.height : 4/3} outputWidth={activeMap.width || 1200} onClose={() => setEditorState({ ...editorState, isOpen: false })} onConfirm={(data: string) => updateActiveMap({ backgroundImage: data })} theme={theme} /> )}
        <div className="w-60 flex flex-col glass-panel rounded-xl border border-slate-700 shrink-0">
           <div className="p-4 border-b border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-slate-200">地图列表</h3>
             <button onClick={addMap} className={`p-1 text-white rounded ${theme.bg} ${theme.hover}`}><Plus size={16}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {maps.map((m: WorldMap) => ( <div key={m.id} onClick={() => setActiveMapId(m.id)} className={`p-2 rounded cursor-pointer flex justify-between items-center group ${activeMapId === m.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}><span className="truncate text-sm">{m.name}</span><button onClick={(e) => {e.stopPropagation(); deleteMap(m.id)}} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash2 size={12}/></button></div>))}
           </div>
        </div>
        {activeMap ? (
          <div className="flex-1 flex flex-col gap-4 min-w-0">
             <div className="glass-panel p-2 rounded-lg border border-slate-700 flex items-center gap-4 relative z-50">
                <input value={activeMap.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateActiveMap({ name: e.target.value })} className="bg-transparent font-bold text-white px-2 focus:outline-none border-b border-transparent focus:border-slate-500" />
                <div className="h-4 w-px bg-slate-700"></div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><span>宽:</span><input type="number" value={activeMap.width} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateActiveMap({ width: parseInt(e.target.value) })} className="w-16 bg-slate-900 rounded px-1 border border-slate-700"/><span>高:</span><input type="number" value={activeMap.height} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateActiveMap({ height: parseInt(e.target.value) })} className="w-16 bg-slate-900 rounded px-1 border border-slate-700"/></div>
                <div className="h-4 w-px bg-slate-700"></div>
                <button onClick={() => setShowMapSettings(!showMapSettings)} className={`p-1.5 rounded text-slate-400 hover:text-white relative ${showMapSettings ? 'bg-slate-700 text-white' : ''}`} title="地图背景设置"><ImageIcon size={18} />
                    {showMapSettings && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 z-50 flex flex-col gap-3 text-left animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center"><h4 className="text-xs font-bold text-slate-400 uppercase">背景设置</h4><button onClick={(e) => {e.stopPropagation(); setShowMapSettings(false)}}><X size={14}/></button></div>
                            <div className="flex items-center justify-between"><span className="text-sm text-slate-300">背景颜色</span><input type="color" value={activeMap.color || "#1e293b"} onChange={(e) => updateActiveMap({ color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" /></div>
                            <div className="pt-2 border-t border-slate-700"><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}/><button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"><Upload size={12}/> 上传本地图片</button></div>
                            {activeMap.backgroundImage && (<button onClick={() => updateActiveMap({ backgroundImage: undefined })} className="text-xs text-red-400 hover:underline text-center">清除背景图片</button>)}
                        </div>
                    )}
                </button>
                <div className="flex-1 text-right text-xs text-slate-500 flex justify-end items-center gap-2"><span className="flex items-center gap-1"><MousePointer2 size={12}/> 右键添加地点</span><span className="w-px h-3 bg-slate-700 mx-1"></span><span className="flex items-center gap-1">滚轮/拖动 缩放平移</span></div>
             </div>
             <div className="flex-1 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 relative z-0 shadow-inner group/canvas">
                <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg overflow-hidden">
                    <button onClick={zoomIn} className="p-2 hover:bg-slate-700 text-slate-300"><ZoomIn size={16}/></button><button onClick={zoomOut} className="p-2 hover:bg-slate-700 text-slate-300"><ZoomOut size={16}/></button><button onClick={resetZoom} className="p-2 hover:bg-slate-700 text-slate-300 text-xs font-bold">1:1</button>
                </div>
                <div className="w-full h-full overflow-hidden cursor-crosshair active:cursor-grabbing relative" onMouseDown={handleMapMouseDown} onMouseMove={handleMapMouseMove} onMouseUp={handleMapMouseUp} onMouseLeave={handleMapMouseUp} onContextMenu={handleContextMenu} onWheel={handleWheel}>
                    <div className="absolute transition-transform duration-75 origin-top-left shadow-2xl" style={{ width: activeMap.width, height: activeMap.height, backgroundColor: activeMap.color, backgroundImage: activeMap.backgroundImage ? `url(${activeMap.backgroundImage})` : 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: activeMap.backgroundImage ? '100% 100%' : '20px 20px', backgroundRepeat: 'no-repeat', transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
                       {activeMap.markers.map((marker: MapMarker) => {
                          const tagColor = marker.customColor || stringToColor(marker.type);
                          return (
                            <div key={marker.id} onClick={(e) => { e.stopPropagation(); setSelectedMarkerId(marker.id); }} className={`map-marker absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group transition-all ${selectedMarkerId === marker.id ? 'z-50 scale-125' : 'z-10'}`} style={{ left: marker.x, top: marker.y }}>
                                 <MapPin size={24} className="drop-shadow-md" style={{ color: selectedMarkerId === marker.id ? '#fff' : tagColor, fill: '#0f172a' }} />
                                 <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap text-xs font-bold px-1.5 py-0.5 rounded pointer-events-none transition-colors border shadow-sm flex items-center gap-1`} style={{ backgroundColor: '#0f172a', borderColor: tagColor, color: tagColor }}>{marker.label}</div>
                                 {selectedMarkerId === marker.id && (
                                   <div className="absolute top-8 left-0 bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl w-56 z-50 scale-75 origin-top-left" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                      <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-400">编辑地点</span><button onClick={() => setSelectedMarkerId(null)}><X size={12}/></button></div>
                                      <input value={marker.label} onChange={(e) => updateMarker(marker.id, { label: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white mb-2" placeholder="名称" />
                                      <div className="flex gap-1 mb-2"><div className="flex-1 relative"><input value={marker.type} onChange={(e) => updateMarker(marker.id, { type: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded pl-6 pr-2 py-1 text-xs text-white" placeholder="标签"/><Tag size={10} className="absolute left-2 top-1.5 text-slate-500"/></div><input type="color" value={marker.customColor || stringToColor(marker.type)} onChange={(e) => updateMarker(marker.id, { customColor: e.target.value })} className="w-6 h-full rounded cursor-pointer bg-transparent border border-slate-600 p-0" title="自定义标签颜色"/></div>
                                      <textarea value={marker.description} onChange={(e) => updateMarker(marker.id, { description: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 h-16 resize-none mb-2" placeholder="描述..."/>
                                      <div className="flex justify-end"><button onClick={() => deleteMarker(marker.id)} className="text-red-400 hover:text-red-300"><Trash2 size={12}/></button></div>
                                   </div>
                                 )}
                            </div>
                        )})}
                    </div>
                </div>
             </div>
          </div>
        ) : <div className="flex-1 flex items-center justify-center text-slate-500">请选择或创建一张地图</div>}
      </div>
    );
};

const RelationsModule = ({ world, updateWorld, theme }: any) => {
    const characters = world.characters;
    const radius = 200; const centerX = 300; const centerY = 250;
    const getNodePos = (index: number, total: number) => { const angle = (index / total) * 2 * Math.PI - Math.PI / 2; return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }; };
    const getCharacterPos = (id: string) => { const idx = characters.findIndex((c: Character) => c.id === id); if (idx === -1) return { x: 0, y: 0 }; return getNodePos(idx, characters.length); };
    const [newRel, setNewRel] = useState({ source: "", target: "", type: "" });
    const addRelation = () => { if (!newRel.source || !newRel.target || !newRel.type) return; const rel: Relation = { id: `r-${Date.now()}`, sourceId: newRel.source, targetId: newRel.target, type: newRel.type }; updateWorld({ relations: [...world.relations, rel] }); setNewRel({ source: "", target: "", type: "" }); };
    const removeRelation = (id: string) => { updateWorld({ relations: world.relations.filter((r: Relation) => r.id !== id) }); };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-start">
                 <div className="w-1/3 glass-panel p-4 rounded-xl border border-slate-700 z-10">
                    <h4 className="font-bold text-slate-300 mb-3 text-sm">添加新关系</h4>
                    <div className="space-y-3">
                        <select className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm" value={newRel.source} onChange={(e) => setNewRel({...newRel, source: e.target.value})}><option value="">选择角色 A</option>{characters.map((c: Character) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <select className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm" value={newRel.target} onChange={(e) => setNewRel({...newRel, target: e.target.value})}><option value="">选择角色 B</option>{characters.map((c: Character) => ( c.id !== newRel.source && <option key={c.id} value={c.id}>{c.name}</option>))}</select>
                        <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white placeholder-slate-500" placeholder="关系类型" value={newRel.type} onChange={(e) => setNewRel({...newRel, type: e.target.value})}/>
                        <button onClick={addRelation} disabled={!newRel.source || !newRel.target || !newRel.type} className={`w-full text-white rounded py-1.5 text-sm font-medium transition-colors disabled:bg-slate-700 disabled:text-slate-500 ${theme.bg} ${theme.hover}`}>建立连接</button>
                    </div>
                    <div className="mt-6 max-h-40 overflow-y-auto space-y-2 border-t border-slate-700 pt-4">
                         {world.relations.map((r: Relation) => { const s = characters.find((c: Character) => c.id === r.sourceId)?.name || "Unknown"; const t = characters.find((c: Character) => c.id === r.targetId)?.name || "Unknown"; return ( <div key={r.id} className="flex justify-between items-center text-xs bg-slate-900/50 p-2 rounded"><span className="text-slate-300">{s} <span className={theme.text}>--{r.type}--></span> {t}</span><button onClick={() => removeRelation(r.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={12}/></button></div> ) })}
                    </div>
                 </div>
                 <div className="flex-1 flex justify-center items-center h-[500px] bg-[#0f172a] rounded-xl border border-slate-800 relative overflow-hidden">
                    <svg width="600" height="500" viewBox="0 0 600 500">
                         <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b" /></marker></defs>
                        {world.relations.map((r: Relation) => { const start = getCharacterPos(r.sourceId); const end = getCharacterPos(r.targetId); if (start.x === 0 || end.x === 0) return null; return ( <g key={r.id}><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrowhead)"/><text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 5} textAnchor="middle" fill="#94a3b8" fontSize="10" className="bg-slate-900">{r.type}</text></g> ); })}
                        {characters.map((c: Character, idx: number) => { const pos = getNodePos(idx, characters.length); return ( <g key={c.id} className="cursor-pointer hover:opacity-80 transition-opacity"><circle cx={pos.x} cy={pos.y} r="20" className={`fill-slate-800 stroke-2 ${theme.text.replace('text', 'stroke')}`} /><foreignObject x={pos.x - 10} y={pos.y - 10} width="20" height="20"><div className={`w-full h-full flex items-center justify-center ${theme.text}`}><Users size={12} /></div></foreignObject><text x={pos.x} y={pos.y + 35} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">{c.name}</text><text x={pos.x} y={pos.y + 48} textAnchor="middle" fill="#64748b" fontSize="10">{c.role}</text></g> ); })}
                    </svg>
                    {characters.length === 0 && <div className="absolute text-slate-600">暂无角色，请前往角色页面添加</div>}
                 </div>
            </div>
        </div>
    );
};

const SectionCard = ({ title, icon: Icon, children, theme, className="" }: any) => (
  <div className={`glass-panel p-6 rounded-xl border border-slate-700 flex flex-col ${className}`}>
    <div className="flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-2">
      <Icon className={theme.text} size={20} />
      <h3 className="font-bold text-lg text-white">{title}</h3>
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const StatItem = ({ label, value, theme }: any) => (
  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
    <div className="text-slate-500 text-xs uppercase">{label}</div>
    <div className={`text-2xl font-bold ${theme.text}`}>{value}</div>
  </div>
);

const AIButton = ({ onClick, loading, label = "AI 协助生成", className = "", theme }: any) => (
    <button onClick={onClick} disabled={loading} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg shadow-black/20 transition-all backdrop-blur-sm ${theme.bg} text-white hover:opacity-90 ${className} ${loading ? 'opacity-50 cursor-wait' : ''}`}>
        {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles size={12} />} {loading ? "生成中..." : label}
    </button>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);