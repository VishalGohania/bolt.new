import { WebContainer } from "@webcontainer/api";
import { useEffect, useRef, useState } from "react";

let webcontainerInstance: WebContainer | null = null;

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const hasBooted = useRef(false);

  useEffect(() => {
    async function bootWebContainer() {
      if (!hasBooted.current && !webcontainerInstance) {
        hasBooted.current = true;
        webcontainerInstance = await WebContainer.boot();
        setWebcontainer(webcontainerInstance);

      } else if (webcontainerInstance) {
        setWebcontainer(webcontainerInstance);
      }
    }
    bootWebContainer();
  }, []);

  return webcontainer;
}