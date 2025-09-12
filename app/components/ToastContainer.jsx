"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
// Dynamic import to avoid early Capacitor bridge access on native
let CapacitorNavigation = null;
if (typeof window !== 'undefined') {
  import('../utils/capacitorNavigation')
    .then(mod => { CapacitorNavigation = mod.CapacitorNavigation; })
    .catch(err => console.warn('CapacitorNavigation import failed:', err));
}

const TOAST_HEIGHT = 72; // px
const COLLAPSED_GAP = 2; // px
const EXPANDED_GAP = 14; // px

// Format a JS Date into 12-hour time with am/pm, e.g. "3:07 pm"
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const [expandStack, setExpandStack] = useState(false);
  const [hoveredToast, setHoveredToast] = useState(null);
  const expandTimeout = useRef();

  useEffect(() => {
    window.showCustomToast = (title, message, link, router) => {
      const id = Date.now() + Math.random();
      const now = new Date();
      const time = formatAMPM(now);
      setToasts((prev) => [{ id, title, message, link, router, time }, ...prev]);
      // setTimeout(() => {
      //   setToasts((prev) => prev.filter((t) => t.id !== id));
      // }, 5000);
    };
    return () => {
      window.showCustomToast = undefined;
    };
  }, []);

  // Mobile: tap top toast to expand/collapse
  const handleTopToastTouch = () => {
    setExpandStack((v) => !v);
    clearTimeout(expandTimeout.current);
    expandTimeout.current = setTimeout(() => setExpandStack(false), 3500);
  };

  // Collapse stack on mouse leave of stack container
  const handleContainerMouseEnter = () => {};
  const handleContainerMouseLeave = () => {
    setExpandStack(false);
    setHoveredToast(null);
  };

  return createPortal(
    <div
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] w-full max-w-sm px-2 sm:px-0 pointer-events-none"
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="relative group/container pointer-events-auto transition-all duration-300 ease-out"
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        {/* Stack shadow for more floating look */}
        <div
          className={`absolute left-0 w-full h-full`}
          style={{
            filter: expandStack
              ? "drop-shadow(0 8px 32px rgba(30,64,175,0.10))"
              : "drop-shadow(0 4px 16px rgba(30,64,175,0.06))",
            zIndex: 1,
            pointerEvents: "none",
            transition: "filter 0.3s cubic-bezier(.32,.72,0,1)",
          }}
        />
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onDismiss={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            index={index}
            total={toasts.length}
            expandStack={expandStack}
            hoveredToast={hoveredToast}
            setHoveredToast={setHoveredToast}
            onTopHover={
              index === 0
                ? (exp) => {
                    setExpandStack(exp);
                  }
                : undefined
            }
            onTopTouch={index === 0 ? handleTopToastTouch : undefined}
            id={toast.id}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

const ToastItem = ({
  title,
  message,
  link,
  router,
  time,
  onDismiss,
  index,
  total,
  expandStack,
  hoveredToast,
  setHoveredToast,
  onTopHover,
  onTopTouch,
  id,
}) => {
  const gap = expandStack ? EXPANDED_GAP : COLLAPSED_GAP;
  const stackOffset = index * (TOAST_HEIGHT - 12) * 0.08;
  const stackScale = Math.max(1 - index * 0.01, 0.97);
  const expandedY = index * (TOAST_HEIGHT + gap);
  const isVisible = expandStack ? index < 6 : index < 3;
  const baseZ = total - index;
  const zIndex = expandStack && hoveredToast === id ? 999 : baseZ;
  const isPopped = expandStack && hoveredToast === id;

  const handleMouseEnter = () => {
    if (expandStack) setHoveredToast(id);
    if (onTopHover && index === 0 && !expandStack) onTopHover(true);
  };
  const handleMouseLeave = () => {
    if (expandStack) setHoveredToast(null);
    if (onTopHover && index === 0 && !expandStack) onTopHover(false);
  };
  const handleTouchStart = () => {
    if (expandStack) setHoveredToast(id);
    if (onTopTouch && index === 0 && !expandStack) onTopTouch();
  };
  const handleTouchEnd = () => {
    if (expandStack) setTimeout(() => setHoveredToast(null), 300);
  };

  return (
    <div
      className={`absolute left-0 w-full bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4
        transition-all duration-500
        ${isPopped ? 'ring-2 ring-blue-200 shadow-2xl scale-[1.035]' : ''}
      `}
      style={{
        top: 0,
        transform: `translateY(${
          expandStack ? expandedY : stackOffset
        }px) scale(${
          isPopped ? 1.035 : expandStack ? 1 : stackScale
        })`,
        zIndex,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition:
          "transform 0.43s cubic-bezier(.32,.72,0,1), box-shadow 0.35s cubic-bezier(.32,.72,0,1), opacity 0.25s, z-index 0s, ring 0.25s",
        boxShadow: isPopped
          ? "0 12px 36px 0 rgba(30,64,175,0.20), 0 2px 4px rgba(0,0,0,0.03)"
          : "0 4px 24px 0 rgba(30,64,175,0.08), 0 2px 4px rgba(0,0,0,0.02)",
        background: "rgba(255,255,255,0.97)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 sm:mt-2.5 shadow-sm"></div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="font-semibold text-gray-900 text-sm leading-5">{title}</div>
          {/* Time info, right aligned and small */}
          {time && (
            <span className="ml-4 text-gray-400 text-xs font-mono tabular-nums whitespace-nowrap">
              {time}
            </span>
          )}
        </div>
        <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">{message}</div>
        {link && (
          <button              
          onClick={() => {
              const currentPath = window.location.pathname;
              if (currentPath === link) {
                if (CapacitorNavigation) {
                  CapacitorNavigation.navigate(router, link);
                } else {
                  // Fallback navigation if Capacitor not ready
                  try { router.push(link); } catch { window.location.href = link; }
                }
              } else {
                window.open(link, '_blank');
              }
              setTimeout(() => onDismiss(), 1000);
            }}
            className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 group/link"
          >
            More info
            <svg
              className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-60 hover:opacity-100 touch-manipulation"
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};