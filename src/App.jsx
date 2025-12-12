import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Utensils, Zap, Activity, ChevronRight, Save, RotateCcw, Flame, X, ArrowLeft, Minus } from 'lucide-react';

// --- Default Data & Constants ---

// Default goals tailored for a 62kg elite cyclist training 3h/day
const DEFAULT_GOALS = {
  calories: 3400,
  carbs: 520,  // ~8.4g/kg (High end for endurance)
  protein: 110, // ~1.8g/kg (Recovery focus)
  fat: 85      // Balance
};

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: <Utensils size={18} /> },
  { id: 'training', label: 'Training Fuel', icon: <Zap size={18} className="text-yellow-500" /> },
  { id: 'lunch', label: 'Lunch', icon: <Utensils size={18} /> },
  { id: 'dinner', label: 'Dinner', icon: <Utensils size={18} /> },
  { id: 'snacks', label: 'Snacks', icon: <Utensils size={18} /> },
];

// Curated database for cyclists
const FOOD_DATABASE = [
  // Training Food
  { name: 'Energy Gel (Generic)', calories: 100, carbs: 25, protein: 0, fat: 0, type: 'training', servingUnit: 'gel' },
  { name: 'Banana (Medium)', calories: 105, carbs: 27, protein: 1, fat: 0, type: 'produce', servingUnit: 'banana' },
  { name: 'Rice Cake (Homemade)', calories: 150, carbs: 30, protein: 2, fat: 2, type: 'training', servingUnit: 'cake' },
  { name: 'Sports Drink Mix (Scoop)', calories: 80, carbs: 20, protein: 0, fat: 0, type: 'training', servingUnit: 'scoop' },
  { name: 'Clif Bar', calories: 250, carbs: 40, protein: 9, fat: 5, type: 'training', servingUnit: 'bar' },
  
  // Carbs / Grains
  { name: 'Oatmeal (1 cup cooked)', calories: 150, carbs: 27, protein: 6, fat: 3, type: 'grains', servingUnit: 'cup' },
  { name: 'White Rice (1 cup cooked)', calories: 200, carbs: 45, protein: 4, fat: 0, type: 'grains', servingUnit: 'cup' },
  { name: 'Pasta (1 cup cooked)', calories: 220, carbs: 43, protein: 8, fat: 1, type: 'grains', servingUnit: 'cup' },
  { name: 'Sweet Potato (Medium)', calories: 112, carbs: 26, protein: 2, fat: 0, type: 'produce', servingUnit: 'potato' },
  { name: 'Bagel (Whole)', calories: 250, carbs: 50, protein: 10, fat: 1, type: 'grains', servingUnit: 'bagel' },

  // Protein
  { name: 'Chicken Breast (100g)', calories: 165, carbs: 0, protein: 31, fat: 3, type: 'protein', servingUnit: '100g' },
  { name: 'Egg (Large)', calories: 70, carbs: 0, protein: 6, fat: 5, type: 'protein', servingUnit: 'egg' },
  { name: 'Tuna (Can)', calories: 120, carbs: 0, protein: 26, fat: 1, type: 'protein', servingUnit: 'can' },
  { name: 'Greek Yogurt (1 cup)', calories: 130, carbs: 9, protein: 23, fat: 0, type: 'protein', servingUnit: 'cup' },
  { name: 'Protein Powder (Scoop)', calories: 120, carbs: 3, protein: 24, fat: 1, type: 'protein', servingUnit: 'scoop' },

  // Fats
  { name: 'Avocado (Half)', calories: 160, carbs: 9, protein: 2, fat: 15, type: 'fat', servingUnit: 'half' },
  { name: 'Peanut Butter (1 tbsp)', calories: 95, carbs: 3, protein: 4, fat: 8, type: 'fat', servingUnit: 'tbsp' },
  { name: 'Olive Oil (1 tbsp)', calories: 120, carbs: 0, protein: 0, fat: 14, type: 'fat', servingUnit: 'tbsp' },
  { name: 'Almonds (Handful)', calories: 160, carbs: 6, protein: 6, fat: 14, type: 'fat', servingUnit: 'handful' },
];

// --- Components ---

const ProgressBar = ({ current, target, colorClass, label, unit = 'g' }) => {
  const percentage = Math.min(100, (current / target) * 100);
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 font-medium text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span>{Math.round(current)} / {target}{unit}</span>
      </div>
      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const AddFoodModal = ({ isOpen, onClose, onAdd, mealType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customFood, setCustomFood] = useState({ name: '', calories: '', carbs: '', protein: '', fat: '', servingUnit: '' });
  const [mode, setMode] = useState('search'); // 'search', 'custom'
  
  // Selection & Serving State
  const [selectedItem, setSelectedItem] = useState(null);
  const [servingSize, setServingSize] = useState(1.0);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setServingSize(1.0);
      setSearchTerm('');
      // Keep custom food state for reuse or clear it? Clearing for fresh entry.
      setCustomFood({ name: '', calories: '', carbs: '', protein: '', fat: '', servingUnit: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFoods = FOOD_DATABASE.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customFood.name || !customFood.calories) return;
    
    // Pass to selection screen essentially
    const food = {
      name: customFood.name,
      calories: parseInt(customFood.calories) || 0,
      carbs: parseInt(customFood.carbs) || 0,
      protein: parseInt(customFood.protein) || 0,
      fat: parseInt(customFood.fat) || 0,
      servingUnit: customFood.servingUnit || 'serving'
    };
    
    setSelectedItem(food);
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;
    const finalFood = {
      id: Date.now(),
      name: selectedItem.name,
      calories: Math.round(selectedItem.calories * servingSize),
      carbs: Math.round(selectedItem.carbs * servingSize),
      protein: Math.round(selectedItem.protein * servingSize),
      fat: Math.round(selectedItem.fat * servingSize),
      originalServing: servingSize,
      servingUnit: selectedItem.servingUnit // Pass unit through
    };
    onAdd(finalFood);
    onClose();
  };

  // --- RENDER ADJUST SCREEN ---
  if (selectedItem) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Adjust Quantity</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{selectedItem.name}</h2>
              <p className="text-sm text-slate-500">
                Base: {selectedItem.calories} kcal / {selectedItem.servingUnit || 'serving'}
              </p>
            </div>

            {/* Serving Controls */}
            <div className="flex items-center justify-center gap-4">
               <button 
                onClick={() => setServingSize(Math.max(0.25, servingSize - 0.25))}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
               >
                 <Minus size={20} />
               </button>
               <div className="text-center w-24">
                 <div className="text-3xl font-black text-blue-600">{servingSize}x</div>
                 <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {selectedItem.servingUnit || 'Servings'}
                 </div>
               </div>
               <button 
                onClick={() => setServingSize(servingSize + 0.25)}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
               >
                 <Plus size={20} />
               </button>
            </div>

            {/* Live Macros */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-bold mb-1">CAL</div>
                <div className="font-black text-slate-700 dark:text-slate-200">{Math.round(selectedItem.calories * servingSize)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-orange-500 font-bold mb-1">CHO</div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{Math.round(selectedItem.carbs * servingSize)}g</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-green-500 font-bold mb-1">PRO</div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{Math.round(selectedItem.protein * servingSize)}g</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-yellow-500 font-bold mb-1">FAT</div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{Math.round(selectedItem.fat * servingSize)}g</div>
              </div>
            </div>

            <button 
              onClick={handleConfirmAdd}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />
              Add to Log
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER SELECTION SCREEN ---
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white capitalize">Add to {mealType}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={() => setMode('search')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'search' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Search</button>
          <button onClick={() => setMode('custom')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'custom' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Custom</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* SEARCH MODE */}
          {mode === 'search' && (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Search food (e.g., Banana, Pasta)..." 
                className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="space-y-2">
                {filteredFoods.map((food, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setSelectedItem(food); setServingSize(1.0); }}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{food.name}</span>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500">{food.calories} kcal</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                      <span className="text-orange-600/80">C: {food.carbs}g</span>
                      <span className="text-green-600/80">P: {food.protein}g</span>
                      <span className="text-yellow-600/80">F: {food.fat}g</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOM MODE */}
          {mode === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-200 mb-4">
                Tip: Enter macros for a single serving or 100g.
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Food Name</label>
                <input required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-transparent dark:text-white" value={customFood.name} onChange={e => setCustomFood({...customFood, name: e.target.value})} placeholder="e.g. My Recovery Shake" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Serving Unit (Optional)</label>
                <input 
                  className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-transparent dark:text-white" 
                  value={customFood.servingUnit} 
                  onChange={e => setCustomFood({...customFood, servingUnit: e.target.value})} 
                  placeholder="e.g. 100g, 1 cup, 1 bar" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Calories</label><input type="number" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-transparent dark:text-white" value={customFood.calories} onChange={e => setCustomFood({...customFood, calories: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Carbs (g)</label><input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-transparent dark:text-white" value={customFood.carbs} onChange={e => setCustomFood({...customFood, carbs: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Protein (g)</label><input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-transparent dark:text-white" value={customFood.protein} onChange={e => setCustomFood({...customFood, protein: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Fat (g)</label><input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-transparent dark:text-white" value={customFood.fat} onChange={e => setCustomFood({...customFood, fat: e.target.value})} /></div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all mt-4">Next: Adjust Quantity</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, goals, setGoals }) => {
  const [localGoals, setLocalGoals] = useState(goals);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGoals(localGoals);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Adjust Targets</h3>
          <p className="text-xs text-slate-500">Tailored for 62kg, 3h training load.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              <span>Daily Calories</span>
              <span className="text-blue-500">{localGoals.calories}</span>
            </label>
            <input 
              type="range" min="1500" max="6000" step="50"
              className="w-full accent-blue-600"
              value={localGoals.calories}
              onChange={e => setLocalGoals({...localGoals, calories: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              <span>Carbohydrates (g)</span>
              <span className="text-orange-500">{localGoals.carbs}</span>
            </label>
            <input 
              type="range" min="50" max="800" step="10"
              className="w-full accent-orange-500"
              value={localGoals.carbs}
              onChange={e => setLocalGoals({...localGoals, carbs: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              <span>Protein (g)</span>
              <span className="text-green-500">{localGoals.protein}</span>
            </label>
            <input 
              type="range" min="40" max="300" step="5"
              className="w-full accent-green-500"
              value={localGoals.protein}
              onChange={e => setLocalGoals({...localGoals, protein: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              <span>Fat (g)</span>
              <span className="text-yellow-500">{localGoals.fat}</span>
            </label>
            <input 
              type="range" min="20" max="200" step="5"
              className="w-full accent-yellow-500"
              value={localGoals.fat}
              onChange={e => setLocalGoals({...localGoals, fat: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button 
            onClick={() => setLocalGoals(DEFAULT_GOALS)}
            className="flex-1 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
          >
            Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [logs, setLogs] = useState({});
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Load from local storage
  useEffect(() => {
    const savedLogs = localStorage.getItem('cyclistMacroLogs');
    const savedGoals = localStorage.getItem('cyclistMacroGoals');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('cyclistMacroLogs', JSON.stringify(logs));
    localStorage.setItem('cyclistMacroGoals', JSON.stringify(goals));
  }, [logs, goals]);

  // Daily Aggregation
  const dailyLog = logs[currentDate] || { breakfast: [], lunch: [], dinner: [], snacks: [], training: [] };
  
  const getDailyTotals = () => {
    let totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
    Object.values(dailyLog).flat().forEach(item => {
      totals.calories += item.calories;
      totals.carbs += item.carbs;
      totals.protein += item.protein;
      totals.fat += item.fat;
    });
    return totals;
  };

  const totals = getDailyTotals();

  const handleAddFood = (food) => {
    const updatedDailyLog = { ...dailyLog, [activeMealType]: [...(dailyLog[activeMealType] || []), food] };
    setLogs({ ...logs, [currentDate]: updatedDailyLog });
  };

  const removeFood = (mealType, foodId) => {
    const updatedMeal = dailyLog[mealType].filter(f => f.id !== foodId);
    setLogs({ ...logs, [currentDate]: { ...dailyLog, [mealType]: updatedMeal } });
  };

  const clearDay = () => {
    if(window.confirm("Clear all logs for today?")) {
      const newLogs = { ...logs };
      delete newLogs[currentDate];
      setLogs(newLogs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Header / Dashboard */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4 pb-2">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Activity className="text-blue-600" />
              VELO<span className="text-blue-600">FUEL</span>
            </h1>
            <div className="flex gap-2">
              <button onClick={clearDay} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <RotateCcw size={18} />
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-4 gap-4 mb-4">
             {/* Calories Big Display */}
            <div className="col-span-4 bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Energy</span>
                <div className="text-3xl font-black text-slate-800 dark:text-white leading-none mt-1">
                  {totals.calories}
                  <span className="text-sm font-medium text-slate-400 ml-1">/ {goals.calories}</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-600 flex items-center justify-center relative">
                <Flame size={20} className={totals.calories > goals.calories ? "text-red-500" : "text-blue-500"} fill="currentColor" />
              </div>
            </div>

            {/* Macro Bars */}
            <div className="col-span-4 space-y-2">
               <ProgressBar current={totals.carbs} target={goals.carbs} colorClass="bg-orange-500" label="Carbs" />
               <div className="grid grid-cols-2 gap-4">
                  <ProgressBar current={totals.protein} target={goals.protein} colorClass="bg-emerald-500" label="Protein" />
                  <ProgressBar current={totals.fat} target={goals.fat} colorClass="bg-yellow-500" label="Fat" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Meals */}
      <div className="max-w-md mx-auto p-4 pb-24 space-y-6">
        
        {MEAL_TYPES.map((type) => {
          const mealItems = dailyLog[type.id] || [];
          const mealCals = mealItems.reduce((acc, curr) => acc + curr.calories, 0);

          return (
            <div key={type.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${type.id === 'training' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{type.label}</h3>
                    <p className="text-xs text-slate-400">{mealCals} kcal</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveMealType(type.id); setIsAddModalOpen(true); }}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Food List */}
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {mealItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">No food logged</div>
                ) : (
                  mealItems.map(item => (
                    <div key={item.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/20 group">
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-[10px] text-slate-400 space-x-2">
                          <span className="text-orange-600/70">C: {item.carbs}</span>
                          <span className="text-green-600/70">P: {item.protein}</span>
                          <span className="text-yellow-600/70">F: {item.fat}</span>
                          {item.originalServing && item.originalServing !== 1 && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 rounded-sm">
                              {item.originalServing}x {item.servingUnit}
                            </span>
                          )}
                          {item.servingUnit && item.originalServing === 1 && (
                             <span className="bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-1.5 rounded-sm">
                               {item.servingUnit}
                             </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">{item.calories}</span>
                        <button 
                          onClick={() => removeFood(type.id, item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddFoodModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddFood} 
        mealType={MEAL_TYPES.find(t => t.id === activeMealType)?.label} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        goals={goals} 
        setGoals={setGoals} 
      />

    </div>
  );
}