import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ORDERED_MEALS = ['breakfast', 'mid_morning', 'lunch', 'evening', 'dinner'];

const MEAL_ICONS = {
  breakfast:   { icon: '🌅', label: 'Breakfast' },
  mid_morning: { icon: '🍎', label: 'Mid Morning' },
  lunch:       { icon: '🍱', label: 'Lunch' },
  evening:     { icon: '🍵', label: 'Evening Snack' },
  dinner:      { icon: '🌙', label: 'Dinner' },
};

function MealRow({ mealKey, meal }) {
  const meta = MEAL_ICONS[mealKey] || { icon: '🍽️', label: mealKey.replace(/_/g, ' ') };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors rounded-xl px-2 -mx-2">
      {/* Icon or Image */}
      <div className="shrink-0 flex items-center justify-center">
        {meal.image ? (
          <img 
            src={meal.image} 
            alt={meal.dish} 
            className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center text-2xl shadow-sm group-hover:bg-saffron-500/20 transition-all duration-300">
            {meta.icon}
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[10px] text-saffron-400/80 font-medium uppercase tracking-wider mb-1">{meta.label}</div>
        <div className="text-base text-white/95 font-semibold truncate group-hover:text-white transition-colors">
          {meal.dish}
        </div>
        
        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 mt-1.5 shrink-0">
          {meal.ready_in_minutes && <span className="flex items-center gap-1">⏱️ {meal.ready_in_minutes} min</span>}
          {meal.servings && <span className="flex items-center gap-1">🍽️ {meal.servings} serve</span>}
          {meal.notes && <span className="text-white/60 italic">{meal.notes}</span>}
        </div>

        {/* Nutritional Chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {meal.calories && (
            <span className="text-[10px] font-medium text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
              🔥 {meal.calories} kcal
            </span>
          )}
          {meal.protein && (
            <span className="text-[10px] font-medium text-white/80 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              🥩 {meal.protein}
              {String(meal.protein).endsWith('g') ? '' : 'g'} Protein
            </span>
          )}
          {meal.carbohydrates && (
            <span className="text-[10px] font-medium text-white/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              🍚 {meal.carbohydrates}
              {String(meal.carbohydrates).endsWith('g') ? '' : 'g'} Carbs
            </span>
          )}
          {meal.fat && (
            <span className="text-[10px] font-medium text-white/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              🥑 {meal.fat}
              {String(meal.fat).endsWith('g') ? '' : 'g'} Fat
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      {meal.recipe_link && (
        <div className="mt-2 sm:mt-0 shrink-0 self-start sm:self-center">
          <a 
            href={meal.recipe_link} 
            target="_blank" 
            rel="noreferrer" 
            aria-label={`View recipe for ${meal.dish}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-saffron-400 bg-saffron-500/10 hover:bg-saffron-500/20 rounded-lg transition-colors border border-saffron-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          >
            <span>View Recipe</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

function DailySummary({ dayData }) {
  const targetCalories = dayData.target_calories || Math.max(2000, dayData.total_calories);
  const percentage = Math.min((dayData.total_calories / targetCalories) * 100, 100).toFixed(0);

  return (
    <div className="mb-6 bg-white/[0.03] rounded-2xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wide">Daily Target</h4>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-saffron-400">{dayData.total_calories}</span>
          <span className="text-sm text-white/40 ml-1">kcal</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-saffron-300"
        />
      </div>
      
      <div className="flex justify-between text-xs text-white/40 font-medium">
        <span>{percentage}% of target</span>
        <span>{targetCalories} kcal goal</span>
      </div>

      {/* Macros (if available) */}
      {dayData.macros && (dayData.macros.protein || dayData.macros.carbohydrates || dayData.macros.fat) && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
          {dayData.macros.protein && (
            <div className="flex-1">
              <div className="text-[10px] text-white/40 uppercase mb-0.5">Protein</div>
              <div className="text-sm font-medium text-white/90">{dayData.macros.protein}</div>
            </div>
          )}
          {dayData.macros.carbohydrates && (
            <div className="flex-1">
              <div className="text-[10px] text-white/40 uppercase mb-0.5">Carbs</div>
              <div className="text-sm font-medium text-white/90">{dayData.macros.carbohydrates}</div>
            </div>
          )}
          {dayData.macros.fat && (
            <div className="flex-1">
              <div className="text-[10px] text-white/40 uppercase mb-0.5">Fat</div>
              <div className="text-sm font-medium text-white/90">{dayData.macros.fat}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DaySelector({ days, activeDay, setActiveDay }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-max">
        {days.map((d, i) => {
          const isActive = activeDay === i;
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              aria-pressed={isActive}
              className="relative px-5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500/50"
            >
              {isActive && (
                <motion.div
                  layoutId="activeDayBackground"
                  className="absolute inset-0 bg-saffron-500/20 border border-saffron-500/30 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-saffron-300' : 'text-white/50 hover:text-white/80'}`}>
                {d.day.replace('Day ', 'D')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MealCard({ plan }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!plan || !plan.plan || plan.plan.length === 0) return null;

  const days = plan.plan;
  const today = days[activeDay];

  return (
    <div className="space-y-2">
      <DaySelector days={days} activeDay={activeDay} setActiveDay={setActiveDay} />

      <div className="glass rounded-2xl border border-saffron-500/20 bg-gradient-to-br from-saffron-500/5 to-earth-600/10 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="mb-6">
              <h3 className="font-semibold text-white text-2xl">{today.day}</h3>
              <p className="text-sm text-white/50 mt-1">Your curated nutrition plan for the day.</p>
            </div>

            <DailySummary dayData={today} />

            <div className="space-y-1">
              {ORDERED_MEALS.map((mealKey) => {
                const meal = today.meals && today.meals[mealKey];
                if (!meal) return null;
                return <MealRow key={mealKey} mealKey={mealKey} meal={meal} />;
              })}
              
              {/* Fallback for any meals not in our ordered list (e.g., snack_0, snack_1) */}
              {today.meals && Object.entries(today.meals).map(([key, meal]) => {
                if (ORDERED_MEALS.includes(key)) return null;
                return <MealRow key={key} mealKey={key} meal={meal} />;
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}