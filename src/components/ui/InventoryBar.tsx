import { BookOpen, Package, Sparkles } from "lucide-react";
import { ITEMS } from "../../data/items";

interface InventoryBarProps {
  itemIds: string[];
  discoveredClueCount: number;
  selectedItemForUse: string | null;
  onInspectItem: (itemId: string) => void;
  onOpenJournal: () => void;
}

export function InventoryBar({
  itemIds,
  discoveredClueCount,
  selectedItemForUse,
  onInspectItem,
  onOpenJournal,
}: InventoryBarProps) {
  return (
    <section className="sf-inventory" aria-label="اینونتوری و دفترچه">
      <div className="sf-inventory__identity">
        <Package size={17} />
        <div>
          <strong>اینونتوری</strong>
          <span>{itemIds.length} وسیله</span>
        </div>
      </div>

      <div className="sf-inventory__items" aria-label="وسایل همراه آوا">
        {itemIds.map((itemId) => {
          const item = ITEMS[itemId];
          if (!item) return null;
          const ItemIcon = item.icon;
          return (
            <button
              key={itemId}
              type="button"
              className={[
                "sf-inventory__item",
                selectedItemForUse === itemId ? "sf-inventory__item--selected" : "",
              ].filter(Boolean).join(" ")}
              draggable
              aria-label={"بررسی " + item.title}
              title={item.title + " — برای استفاده روی شیء دیگر بکش"}
              onClick={() => onInspectItem(itemId)}
              onDragStart={(event) => {
                event.dataTransfer.setData("application/x-silent-frequency-item", itemId);
                event.dataTransfer.setData("text/plain", itemId);
                event.dataTransfer.effectAllowed = "move";
              }}
            >
              <ItemIcon size={18} />
              <span>{item.shortName}</span>
            </button>
          );
        })}
        {itemIds.length === 0 && <span className="sf-inventory__empty">هنوز وسیله‌ای پیدا نشده</span>}
      </div>

      {selectedItemForUse && (
        <div className="sf-inventory__use-hint" role="status">
          <Sparkles size={14} /> انتخاب شد؛ شیء هدف را کلیک کن یا وسیله را روی آن رها کن.
        </div>
      )}

      <button type="button" className="sf-journal-button" onClick={onOpenJournal} aria-label="دفترچهٔ آوا">
        <BookOpen size={18} />
        <span>دفترچهٔ آوا</span>
        <span className="sf-journal-button__count">{discoveredClueCount}</span>
      </button>
    </section>
  );
}
