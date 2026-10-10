import { RotateCw, X } from "lucide-react";
import { useState } from "react";
import type { InventoryItem } from "../../data/items";

interface ItemInspectionModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSelectForUse: (itemId: string) => void;
}

export function ItemInspectionModal({ item, onClose, onSelectForUse }: ItemInspectionModalProps) {
  const [rotation, setRotation] = useState(0);
  const ItemIcon = item.icon;

  return (
    <div className="sf-dialog-scrim" onClick={onClose}>
      <section
        className="sf-inspection sf-item-inspection"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-item-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sf-inspection__topline">
          <span className="sf-inspection__kicker">بازبینی اینونتوری</span>
          <button type="button" className="sf-icon-button" onClick={onClose} aria-label="بستن بررسی شیء">
            <X size={18} />
          </button>
        </div>
        <div className="sf-item-exhibit" aria-label={item.catalogueMark}>
          <div className={"sf-item-exhibit__object sf-item-exhibit__object--" + item.kind} style={{ transform: "rotate(" + rotation + "deg)" }}>
            <ItemIcon size={62} strokeWidth={1.35} />
          </div>
          <span className="sf-item-exhibit__mark">{item.catalogueMark}</span>
        </div>
        <h2 id="sf-item-title">{item.title}</h2>
        <p>{item.description}</p>
        <div className="sf-item-inspection__detail">
          <strong>یادداشت آوا</strong>
          <p>{item.inspection}</p>
        </div>
        <div className="sf-inspection__bottom sf-item-inspection__actions">
          <button type="button" className="sf-secondary-button" onClick={() => setRotation((value) => (value + 90) % 360)}>
            <RotateCw size={15} /> چرخاندن شیء
          </button>
          <button type="button" className="sf-secondary-button" onClick={() => onSelectForUse(item.id)}>
            استفاده روی محیط
          </button>
          <button type="button" className="sf-primary-button" onClick={onClose}>بازگشت</button>
        </div>
      </section>
    </div>
  );
}
