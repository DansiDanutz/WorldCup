"use client";

import { ChevronDown, Menu } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";

type SmartMenuProps = {
  children: ReactNode;
  label?: string;
  summary?: string;
};

export function SmartMenu({ children, label = "Menu", summary = "Maximize cards" }: SmartMenuProps) {
  const panelId = useId();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const syncExpandedState = () => setExpanded(!mediaQuery.matches);

    syncExpandedState();
    mediaQuery.addEventListener("change", syncExpandedState);
    return () => mediaQuery.removeEventListener("change", syncExpandedState);
  }, []);

  return (
    <div className={`smart-menu${expanded ? " is-open" : " is-closed"}`}>
      <button
        aria-controls={panelId}
        aria-expanded={expanded}
        className="smart-menu__toggle"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <Menu size={16} />
        <span className="nav-item__copy">
          <strong>{label}</strong>
          <small>{expanded ? "Minimize cards" : summary}</small>
        </span>
        <ChevronDown className="smart-menu__chevron" size={16} />
      </button>
      <div className="smart-menu__panel" hidden={!expanded} id={panelId}>
        {children}
      </div>
    </div>
  );
}
