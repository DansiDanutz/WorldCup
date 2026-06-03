"use client";

import { ChevronDown } from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useId, useState } from "react";

type SmartMenuProps = {
  children: ReactNode;
  label?: string;
  summary?: string;
};

export function SmartMenu({ children, label = "Menu", summary = "Open tabs" }: SmartMenuProps) {
  const panelId = useId();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const syncExpandedState = () => setExpanded(!mediaQuery.matches);

    syncExpandedState();
    mediaQuery.addEventListener("change", syncExpandedState);
    return () => mediaQuery.removeEventListener("change", syncExpandedState);
  }, []);

  function closeAfterDestinationClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest("a, button")) {
      setExpanded(false);
    }
  }

  return (
    <div className={`smart-menu${expanded ? " is-open" : " is-closed"}`}>
      <div
        className="smart-menu__panel"
        hidden={!expanded}
        id={panelId}
        onClick={closeAfterDestinationClick}
      >
        {children}
      </div>
      <button
        aria-label={expanded ? "Hide navigation cards" : "Show navigation cards"}
        aria-controls={panelId}
        aria-expanded={expanded}
        className="smart-menu__toggle"
        onClick={() => setExpanded((current) => !current)}
        title={expanded ? "Hide navigation cards" : "Show navigation cards"}
        type="button"
      >
        <span className="smart-menu__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="nav-item__copy">
          <strong>{label}</strong>
          <small>{expanded ? "Tabs open" : summary}</small>
        </span>
        <ChevronDown className="smart-menu__chevron" size={16} />
      </button>
    </div>
  );
}
