import React, { useEffect, useRef, useState } from "react";
import { Archive, ArchiveRestore, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { MODE_LABEL, OUTCOME, TONE } from "../../lib/chat";
import { cn } from "../../lib/utils";

function RenameField({ initial, onSubmit, onCancel }) {
  const [value, setValue] = useState(initial);
  const field = useRef(null);
  const settled = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      field.current?.focus();
      field.current?.select();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const finish = (save) => {
    if (settled.current) return;
    settled.current = true;
    const next = value.trim();
    if (save && next && next !== initial) onSubmit(next);
    else onCancel();
  };

  return (
    <input
      ref={field}
      value={value}
      maxLength={300}
      aria-label="Conversation name"
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter") finish(true);
        if (e.key === "Escape") finish(false);
      }}
      className="h-[30px] w-full rounded-md border border-line-strong bg-white px-2 text-[13.5px] text-ink focus:border-ink-3 focus:outline-none"
    />
  );
}

function Row({ row, active, disabled, onOpen, onRename, onArchive, onAskDelete }) {
  const [editing, setEditing] = useState(false);
  const meta = OUTCOME[row.outcome];
  const flagged = meta && row.outcome !== "clean";

  if (editing) {
    return (
      <div className="px-0.5 py-1">
        <RenameField
          initial={row.title}
          onCancel={() => setEditing(false)}
          onSubmit={(title) => {
            setEditing(false);
            onRename(row.id, title);
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("group/row relative rounded-md transition-colors hover:bg-paper-3 has-[[data-state=open]]:bg-paper-3", active && "bg-paper-3")}>
      <button
        disabled={disabled}
        onClick={() => onOpen(row.id)}
        className="block w-full rounded-md px-2 py-1.5 pr-8 text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="truncate text-[13.5px] text-ink">{row.title}</div>
        <div className="mt-px truncate text-[11.5px] text-ink-3">
          {MODE_LABEL[row.mode] || row.mode}
          {flagged && <span className={cn("font-medium", TONE[meta.tone].text)}> · {meta.label}</span>}
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Options for ${row.title}`}
          className="absolute right-1 top-1.5 grid h-6 w-6 place-items-center rounded text-ink-3 opacity-0 transition-colors hover:bg-paper-3 hover:text-ink focus-visible:opacity-100 focus-visible:outline-none group-hover/row:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onArchive(row.id, !row.archived)}>
            {row.archived ? <ArchiveRestore /> : <Archive />} {row.archived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => onAskDelete(row)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function Recents({ rows, activeId, disabled, onOpen, onRename, onArchive, onDelete }) {
  const [showArchived, setShowArchived] = useState(false);
  const [doomed, setDoomed] = useState(null);
  const current = rows.filter((r) => !r.archived);
  const archived = rows.filter((r) => r.archived);
  const row = (r) => (
    <Row key={r.id} row={r} active={activeId === r.id} disabled={disabled} onOpen={onOpen} onRename={onRename} onArchive={onArchive} onAskDelete={setDoomed} />
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="px-4 pb-1 pt-3 text-[11.5px] font-medium text-ink-3">History</h2>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-px px-2 pb-2">
          {current.length === 0 && <p className="px-2 py-2 text-[12.5px] leading-relaxed text-ink-3">Your conversations will show up here.</p>}
          {current.map(row)}
          {archived.length > 0 && (
            <>
              <button
                onClick={() => setShowArchived((v) => !v)}
                aria-expanded={showArchived}
                className="mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-left text-[11.5px] font-medium text-ink-3 transition-colors hover:text-ink"
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", showArchived && "rotate-90")} />
                Archived
                <span className="font-normal text-ink-4">{archived.length}</span>
              </button>
              {showArchived && archived.map(row)}
            </>
          )}
        </div>
      </ScrollArea>
      <Dialog open={!!doomed} onOpenChange={(open) => !open && setDoomed(null)}>
        <DialogContent className="max-w-sm gap-3 rounded-lg p-5 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px] text-ink">Delete this conversation?</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-ink-3">
              <span className="text-ink-2">{doomed?.title}</span> and its trace will be removed for good.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setDoomed(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onDelete(doomed.id);
                setDoomed(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
