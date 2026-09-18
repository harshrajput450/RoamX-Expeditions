import React, { useState } from 'react';
import { Backpack, Plus, Trash2, CheckCircle2, Layers, Sparkles } from 'lucide-react';

interface GearCategory {
  category: string;
  items: string[];
}

interface GearChecklistBuilderProps {
  categories: GearCategory[];
  onChange: (updated: GearCategory[]) => void;
}

export const GearChecklistBuilder: React.FC<GearChecklistBuilderProps> = ({ categories, onChange }) => {
  const [newCatName, setNewCatName] = useState('');

  const defaultTemplates = [
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

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const updated = [
      ...categories,
      {
        category: newCatName.trim(),
        items: ['Essential item 1', 'Essential item 2'],
      },
    ];
    onChange(updated);
    setNewCatName('');
  };

  const handleRemoveCategory = (catIndex: number) => {
    const updated = categories.filter((_, i) => i !== catIndex);
    onChange(updated);
  };

  const handleCategoryNameChange = (catIndex: number, newName: string) => {
    const updated = categories.map((cat, i) =>
      i === catIndex ? { ...cat, category: newName } : cat
    );
    onChange(updated);
  };

  const handleItemsTextChange = (catIndex: number, text: string) => {
    // Break by line
    const items = text
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    const updated = categories.map((cat, i) =>
      i === catIndex ? { ...cat, items } : cat
    );
    onChange(updated);
  };

  const handleAddItemToCategory = (catIndex: number, itemText: string) => {
    if (!itemText.trim()) return;
    const updated = categories.map((cat, i) =>
      i === catIndex ? { ...cat, items: [...cat.items, itemText.trim()] } : cat
    );
    onChange(updated);
  };

  const handleRemoveItem = (catIndex: number, itemIndex: number) => {
    const updated = categories.map((cat, i) =>
      i === catIndex
        ? { ...cat, items: cat.items.filter((_, idx) => idx !== itemIndex) }
        : cat
    );
    onChange(updated);
  };

  const handleLoadDefaults = () => {
    onChange(defaultTemplates);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Backpack className="w-4 h-4 text-[#FF6B35]" />
            <span>"Things to Pack & Carry" Gear Checklist Builder</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Define categorized gear and packing checklists. These will appear in the interactive checklist widget on the public expedition page.
          </p>
        </div>

        {categories.length === 0 && (
          <button
            type="button"
            onClick={handleLoadDefaults}
            className="inline-flex items-center gap-1.5 bg-orange-50 text-[#FF6B35] hover:bg-orange-100 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Default Himalayan Gear Template</span>
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="bg-[#004E64] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Category {catIdx + 1}
                </span>
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Clothing & Footwear)"
                  value={cat.category}
                  onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-900 flex-1 max-w-sm focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveCategory(catIdx)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Remove Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Items Textarea (1 item per line for rapid bulk editing) */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1">
                <span>Checklist Items ({cat.items.length} items)</span>
                <span className="text-gray-400 font-normal">1 item per line</span>
              </div>
              <textarea
                rows={Math.max(3, Math.min(8, cat.items.length + 1))}
                value={cat.items.join('\n')}
                onChange={(e) => handleItemsTextChange(catIdx, e.target.value)}
                placeholder="High-ankle trekking shoes&#10;Fleece jacket&#10;Thermal inners"
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64] font-mono leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add New Category Box */}
      <div className="bg-white rounded-xl p-3.5 border border-dashed border-gray-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          placeholder="New Category Name (e.g. Medical & Toiletries, Documents & Cash)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCategory();
            }
          }}
          className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
        />
        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex items-center justify-center gap-1.5 bg-[#004E64] hover:bg-[#003d4d] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gear Category</span>
        </button>
      </div>
    </div>
  );
};
