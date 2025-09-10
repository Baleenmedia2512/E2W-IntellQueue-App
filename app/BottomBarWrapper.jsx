"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./BottomBar";

export default function BottomBarWrapper() {
  const pathname = usePathname();
  const isQueueSystem = pathname?.startsWith('/QueueSystem');
  const isLoginPage = pathname === '/login' || pathname === '/login/';

  if (isQueueSystem || isLoginPage) {
    return null; // Do not render the bottom bar for QueueSystem
  }

  return <div><BottomBar /></div>;
}
