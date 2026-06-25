"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export function CardViewControl({
  controlsId,
  expanded,
  label,
  compactText,
  expandedText,
  onToggle,
  hasPopup,
}: {
  controlsId: string;
  expanded: boolean;
  label: string;
  compactText: string;
  expandedText: string;
  onToggle: () => void;
  hasPopup?: "dialog";
}) {
  return (
    <div className={`card-view-control ${expanded ? "is-expanded" : "is-compact"}`}>
      <div className="card-view-control__copy">
        <span>{expanded ? "Full view" : "Compact view"}</span>
        <strong>{expanded ? expandedText : compactText}</strong>
      </div>
      <button
        aria-controls={controlsId}
        aria-expanded={expanded}
        aria-haspopup={hasPopup}
        aria-label={`${expanded ? "Minimize" : "Maximize"} ${label}`}
        className="card-view-control__button"
        onClick={onToggle}
        type="button"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? "Minimize" : "Maximize"}
      </button>
    </div>
  );
}
