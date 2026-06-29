"use client";

import { CalendarClock, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { CardViewControl } from "@/components/card-view-control";
import {
  formatKickoff,
  getMatchScore,
  getTeamDisplayName,
  groupTeamsById,
} from "@/lib/scoring";
import type { WorldCupMatch, WorldCupStage, WorldCupTeam } from "@/lib/types";

import styles from "./match-schedule-explorer.module.css";

const compactMatchCount = 24;

type MatchScheduleExplorerProps = {
  embedded?: boolean;
  matches: WorldCupMatch[];
  stages: WorldCupStage[];
  teams: WorldCupTeam[];
};

export function MatchScheduleExplorer({
  embedded = false,
  matches,
  stages,
  teams,
}: MatchScheduleExplorerProps) {
  const [expanded, setExpanded] = useState(true);
  const [matchDateFilter, setMatchDateFilter] = useState("");
  const teamsById = useMemo(() => groupTeamsById(teams), [teams]);
  const stagesById = useMemo(
    () => new Map(stages.map((stage) => [stage.id, stage])),
    [stages],
  );
  const dateOptions = useMemo(() => {
    const countsByDate = new Map<string, number>();

    for (const match of matches) {
      const matchDate = getMatchCalendarDate(match.kickoff_at);
      countsByDate.set(matchDate, (countsByDate.get(matchDate) ?? 0) + 1);
    }

    return [...countsByDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [matches]);
  const filteredMatches = useMemo(() => {
    if (!matchDateFilter) {
      return matches;
    }

    return matches.filter((match) => getMatchCalendarDate(match.kickoff_at) === matchDateFilter);
  }, [matchDateFilter, matches]);
  const visibleMatches = expanded
    ? filteredMatches
    : filteredMatches.slice(0, compactMatchCount);
  const completedCount = filteredMatches.filter((match) => match.status === "completed").length;
  const minDate = dateOptions[0]?.date ?? "";
  const maxDate = dateOptions[dateOptions.length - 1]?.date ?? "";

  function chooseDate(nextDate: string) {
    setMatchDateFilter(nextDate);
    setExpanded(true);
  }

  const panel = (
    <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Official schedule</p>
            <h2 id="match-schedule-title">Match Schedule</h2>
            <p>
              {visibleMatches.length} of {filteredMatches.length} matches shown
              {matchDateFilter ? ` for ${formatMatchDateLabel(matchDateFilter)}` : ""}.{" "}
              {completedCount} completed in this view.
            </p>
          </div>
          <RefreshCw className={styles.headerIcon} size={20} aria-hidden="true" />
        </div>

        <div className={styles.filters} aria-label="Match schedule filters">
          <label className={styles.dateField} htmlFor="match-date-filter">
            <span>
              <CalendarClock size={16} aria-hidden="true" />
              Calendar date
            </span>
            <input
              id="match-date-filter"
              max={maxDate}
              min={minDate}
              onChange={(event) => chooseDate(event.target.value)}
              type="date"
              value={matchDateFilter}
            />
          </label>
          <button className={styles.clearButton} onClick={() => chooseDate("")} type="button">
            All dates
          </button>
        </div>

        <div className={styles.dateStrip} aria-label="Quick match date filters">
          {dateOptions.map((option) => (
            <button
              aria-pressed={matchDateFilter === option.date}
              className={matchDateFilter === option.date ? styles.activeDateChip : styles.dateChip}
              key={option.date}
              onClick={() => chooseDate(option.date)}
              type="button"
            >
              <span>{formatMatchDateLabel(option.date)}</span>
              <strong>{option.count}</strong>
            </button>
          ))}
        </div>

        {filteredMatches.length > compactMatchCount ? (
          <CardViewControl
            compactText={`${Math.min(compactMatchCount, filteredMatches.length)} of ${filteredMatches.length} matches visible`}
            controlsId="prediction-match-list"
            expanded={expanded}
            expandedText={`All ${filteredMatches.length} matches visible`}
            label="match schedule"
            onToggle={() => setExpanded((current) => !current)}
          />
        ) : null}

        <div
          className={`${styles.matchList} ${expanded ? styles.matchListExpanded : styles.matchListCompact}`}
          id="prediction-match-list"
        >
          {visibleMatches.map((match) => {
            const stage = stagesById.get(match.stage_id);
            const statusClass = match.status === "completed" ? styles.scorePillCompleted : "";

            return (
              <article className={styles.matchRow} key={match.id}>
                <div className={styles.matchMain}>
                  <strong>
                    #{match.match_number} ·{" "}
                    {getTeamDisplayName(match.home_team_id, match.home_slot, teamsById)} vs{" "}
                    {getTeamDisplayName(match.away_team_id, match.away_slot, teamsById)}
                  </strong>
                  <span className={`${styles.scorePill} ${statusClass}`}>
                    {match.status === "completed" ? getMatchScore(match) : "Scheduled"}
                  </span>
                </div>
                <div className={styles.matchSub}>
                  {stage?.name ?? match.stage_id} · {formatKickoff(match.kickoff_at)} · {match.venue}
                </div>
              </article>
            );
          })}
        </div>
      </div>
  );

  if (embedded) {
    return panel;
  }

  return (
    <section className={styles.section} id="matches" aria-labelledby="match-schedule-title">
      {panel}
    </section>
  );
}

function getMatchCalendarDate(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatMatchDateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
