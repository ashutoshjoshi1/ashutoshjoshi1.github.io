"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { Policy } from "../../lib/batching";
import { INFERENCE_STEPS } from "../../lib/data";

/* what the simulated server is doing: the inference story writes it, every
   view of the server (the held stage, the phone's inline panel) reads it */
export interface ServerSettings {
  policy: Policy;
  /* requests a second */
  load: number;
  /* bumped once per "send a burst" */
  burst: number;
}

interface ServerContextValue {
  settings: ServerSettings;
  setSettings: Dispatch<SetStateAction<ServerSettings>>;
}

const ServerContext = createContext<ServerContextValue | null>(null);

export const BURST_SIZE = 16;

export function ServerProvider({ children }: { children: ReactNode }) {
  const first = INFERENCE_STEPS[0];
  const [settings, setSettings] = useState<ServerSettings>({ policy: { ...first.levers }, load: first.load, burst: 0 });
  return <ServerContext.Provider value={{ settings, setSettings }}>{children}</ServerContext.Provider>;
}

export function useServer(): ServerContextValue {
  const value = useContext(ServerContext);
  if (!value) throw new Error("useServer must be used inside <ServerProvider>");
  return value;
}
