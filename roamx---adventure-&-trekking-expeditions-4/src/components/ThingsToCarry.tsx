import React, { useState } from 'react';
import { Backpack, CheckSquare, Square, Sparkles } from 'lucide-react';
import { Trip } from '../types';

interface ThingsToCarryProps {
  trip: Trip;
}

export const ThingsToCarry: React.FC<ThingsToCarryProps> = ({ trip }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const defaultCategories = [
    {
      category: 'Clothing & Footwear',
      items: [
        'High-ankle trekking shoes with good grip',
        'Fleece jacket / Windcheater layer',
        'Thermal base layer (top & bottom)',
        'Quick-dry trekking pants & t-shirts',
        'Woolen gloves & sun cap',
      ],
    },
    {
      category: 'Gear & Essentials',
      items: [
        '50-60L Backpack with rain cover',
        '20L Daypack for summit push',
        'Headlamp / Torch with extra batteries',
        'UV-protected polarized sunglasses',
        '2L Insulated thermos / water bottle',
      ],
    },
    {
      category: 'First Aid & Toiletries',
      items: [
        'Personal medications & Diamox (AMS)',
        'Sunscreen SPF 50+ & lip balm',
        'Biodegradable wet wipes & sanitizer',
        'Band-aids, crepe bandage & ORS sachets',
      ],
    },
  ];

  const categories =
    trip.thingsToCarry && trip.thingsToCarry.length > 0
      ? trip.thingsToCarry
      : trip.packingList && trip.packingList.length > 0
      ? trip.packingList
      : defaultCategories;

  const toggleCheck = (itemKey: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const totalItems = categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <section id="things-to-carry" className="py-12 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Interactive Packing Progress */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Expedition Gear Checklist
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Things to Pack & Carry
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Interactive checklist. Check items off as you pack your backpack!
            </p>
          </div>

          {/* Packing Progress Bar */}
          <div className="bg-[#F8F9FA] border border-gray-200 p-3 rounded-xl min-w-[240px]">
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span>Packing Progress</span>
              <span className="text-[#004E64]">{checkedCount} / {totalItems} Packed ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#004E64] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, catIdx) => (
            <div key={catIdx} className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-sm text-gray-900 mb-3.5 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Backpack className="w-4 h-4 text-[#004E64]" />
                <span>{cat.category}</span>
              </h3>

              <div className="space-y-2.5">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isChecked = Boolean(checkedItems[key]);

                  return (
                    <div
                      key={itemIdx}
                      onClick={() => toggleCheck(key)}
                      className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-all cursor-pointer select-none ${
                        isChecked ? 'bg-blue-50 text-gray-400 line-through' : 'hover:bg-white text-gray-800 font-medium'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#004E64] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
