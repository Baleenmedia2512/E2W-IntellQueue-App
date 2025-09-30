"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./BottomBar";

export default function BottomBarWrapper() {
  const pathname = usePathname();
  const isQueueSystem = pathname?.startsWith('/QueueSystem');
  const isLoginPage = pathname === '/login' || pathname === '/login/';
  const isPrivacyPage = pathname === '/privacy' || pathname === '/privacy/';

  if (isQueueSystem || isLoginPage || isPrivacyPage) {
    return null; // Do not render the bottom bar for QueueSystem, login, or privacy pages
  }

  return (
    <>
      <BottomBar />
    </>
  );
}
