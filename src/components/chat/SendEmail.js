import React, { useState } from "react";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { api } from "../../api";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function SendEmail({ onSent }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const ready = from.includes("@") && subject.trim() && body.trim() && !sending;

  const send = async () => {
    if (!ready) return;
    setSending(true);
    try {
      const { ticket_id } = await api.inbound({ from: from.trim(), subject: subject.trim(), body: body.trim() });
      toast.success(`Delivered to Northwind's inbox as ${ticket_id}`);
      setSubject("");
      setBody("");
      setOpen(false);
      onSent?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline">
          <Mail className="h-3.5 w-3.5" /> Send an email
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>Email Northwind support</DialogTitle>
          <DialogDescription>
            This goes to the same public inbox as any customer email. Write as a customer, or try to trick Nova. It arrives in the Agent queue, where you can hand it to Nova.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5">
          <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From, e.g. dana@acmerobotics.com" aria-label="From" />
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Subject" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Message" aria-label="Message" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send} disabled={!ready}>{sending ? "Sending" : "Send"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
