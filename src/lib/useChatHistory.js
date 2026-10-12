import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api";

export default function useChatHistory() {
  const [rows, setRows] = useState([]);

  const reload = useCallback(() => {
    api.history().then(setRows).catch(() => {});
  }, []);

  useEffect(reload, [reload]);

  const settle = (request) => request.catch((e) => toast.error(e.message)).finally(reload);

  const rename = (id, title) => {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, title } : r)));
    settle(api.updateChat(id, { title }));
  };

  const archive = (id, archived) => {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, archived } : r)));
    settle(api.updateChat(id, { archived }));
  };

  const remove = (id) => {
    setRows((list) => list.filter((r) => r.id !== id));
    settle(api.deleteChat(id));
  };

  return { rows, reload, rename, archive, remove };
}
