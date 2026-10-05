import React, { useMemo } from "react";
import { FaCalendarTimes, FaPaperPlane, FaArchive } from "react-icons/fa";
import {
  Button,
  Field,
  StatusBadge,
  SummaryCards,
  ModuleFilters,
  ModuleEmptyState,
  DONE_STATUSES,
  formatDate,
  inputClass,
  textareaClass,
} from "./common";

export const BLOCKS_STATUS_CONFIG = [
  { key: "ACTIVE", label: "Active" },
  { key: "ARCHIVED", label: "Archived" },
  { key: "ALL", label: "All" },
];

const DharamshalaBlocksAdmin = ({
  blockedDates = [],
  blockForm = { startDate: "", endDate: "", reason: "" },
  setBlockForm,
  createBlockedDate,
  statusFilter = "ACTIVE",
  onStatusFilterChange,
  searchQuery = "",
  onSearchChange,
  blockDrafts = {},
  setBlockDrafts,
  busyId,
  archiveBlockedDate,
}) => {
  const filteredBlocks = useMemo(() => {
    return blockedDates.filter((block) => {
      const matchStatus = statusFilter === "ALL" || block.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        [
          block.reason,
          block.createdBy?.firstName,
          block.createdBy?.lastName,
          block.startDate,
          block.endDate,
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(query));
      return matchStatus && matchSearch;
    });
  }, [blockedDates, statusFilter, searchQuery]);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Create form */}
      <form
        onSubmit={createBlockedDate}
        className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
      >
        <div className="flex items-center gap-2">
          <FaCalendarTimes className="text-emerald-300" size={14} />
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Block Dharamshala Dates
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start Date">
            <input
              type="date"
              className={inputClass}
              value={blockForm.startDate}
              onChange={(e) =>
                setBlockForm((c) => ({ ...c, startDate: e.target.value }))
              }
              required
            />
          </Field>
          <Field label="End Date">
            <input
              type="date"
              className={inputClass}
              value={blockForm.endDate}
              onChange={(e) =>
                setBlockForm((c) => ({ ...c, endDate: e.target.value }))
              }
              required
            />
          </Field>
        </div>
        <Field label="Reason">
          <textarea
            className={textareaClass}
            value={blockForm.reason}
            onChange={(e) =>
              setBlockForm((c) => ({ ...c, reason: e.target.value }))
            }
            required
          />
        </Field>
        <Button
          icon={FaPaperPlane}
          tone="success"
          disabled={busyId === "block-create"}
        >
          {busyId === "block-create" ? "Blocking Dates..." : "Block Dates"}
        </Button>
      </form>

      {/* Blocked-dates list with status tabs */}
      <section className="grid content-start gap-3">
        <SummaryCards data={blockedDates} config={BLOCKS_STATUS_CONFIG} />
        <ModuleFilters
          data={blockedDates}
          config={BLOCKS_STATUS_CONFIG}
          activeKey={statusFilter}
          onTabChange={onStatusFilterChange}
          searchValue={searchQuery}
          onSearch={onSearchChange}
          searchPlaceholder="Search reason, created by..."
        />

        {filteredBlocks.length === 0 ? (
          <ModuleEmptyState statusKey={statusFilter} moduleLabel="blocked date" />
        ) : (
          <div className="grid gap-3">
            {filteredBlocks.map((block) => {
              const isDone = DONE_STATUSES.has(block.status);
              return (
                <article
                  key={block._id}
                  className={`rounded-2xl border p-5 transition ${
                    isDone
                      ? "border-white/5 bg-white/[0.01] opacity-75"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h2
                      className={`text-sm font-bold ${
                        isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {formatDate(block.startDate)} – {formatDate(block.endDate)}
                    </h2>
                    <StatusBadge value={block.status} />
                  </div>
                  <p className="text-xs text-gray-500">{block.reason}</p>
                  <p className="mt-1 text-[11px] text-gray-600">
                    Created by {block.createdBy?.firstName || "Admin"}{" "}
                    {block.createdBy?.lastName || ""}
                  </p>
                  {!isDone && (
                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[1fr_auto]">
                      <input
                        className={inputClass}
                        value={blockDrafts[block._id]?.reason || ""}
                        onChange={(e) =>
                          setBlockDrafts((c) => ({
                            ...c,
                            [block._id]: { reason: e.target.value },
                          }))
                        }
                        placeholder="Archive reason"
                      />
                      <Button
                        icon={FaArchive}
                        tone="danger"
                        onClick={() => archiveBlockedDate(block._id)}
                        disabled={block.status !== "ACTIVE" || busyId === block._id}
                      >
                        {busyId === block._id ? "Archiving..." : "Archive"}
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DharamshalaBlocksAdmin;
