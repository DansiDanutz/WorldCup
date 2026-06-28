"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { MatchScheduleExplorer } from "@/components/match-schedule-explorer";
import type { WorldCupMatch, WorldCupStage, WorldCupTeam } from "@/lib/types";

type DashboardMatchScheduleUpgradeProps = {
  matches: WorldCupMatch[];
  stages: WorldCupStage[];
  teams: WorldCupTeam[];
};

export function DashboardMatchScheduleUpgrade({
  matches,
  stages,
  teams,
}: DashboardMatchScheduleUpgradeProps) {
  const section = useSyncExternalStore(subscribeToDashboardSection, getDashboardSection, () => null);

  if (!section) {
    return null;
  }

  return (
    <>
      <style>{`#matches.matches-section > .panel { display: none; }`}</style>
      {createPortal(
        <div className="dashboard-match-schedule-upgrade">
          <MatchScheduleExplorer embedded matches={matches} stages={stages} teams={teams} />
        </div>,
        section,
      )}
    </>
  );
}

function getDashboardSection() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector<HTMLElement>("#matches.matches-section");
}

function subscribeToDashboardSection(onStoreChange: () => void) {
  const timeout = window.setTimeout(onStoreChange, 0);

  return () => window.clearTimeout(timeout);
}
