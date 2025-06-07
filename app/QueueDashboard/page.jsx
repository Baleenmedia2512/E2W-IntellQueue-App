"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaUndo, FaRedo, FaChevronLeft } from "react-icons/fa";
import { FiUsers, FiMic, FiPauseCircle, FiPlayCircle, FiXCircle, FiCheckCircle, FiChevronsRight, FiActivity as CTIcon, FiRadio as XRayIcon, FiWifi as USGIcon } from 'react-icons/fi'; // Example icons
import { FetchQueueDashboardData, QueueDashboardAction, UpdateQueueOrder, SaveQueueSnapshot, GetQueueSnapshot, RestoreQueueSnapshot, fetchFcmTokens  } from "../api/FetchAPI";
import { useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { setHistoryId } from '@/redux/features/queue-dashboard-slice';
import useFcmToken from "@/hooks/useFcmToken";
import createDeduplicator from "./../components/Deduplicator"; 

const notificationDeduplicator = createDeduplicator({
    windowMs: 2000,
    keyFn: ({ client, rateCard, rateType }) => [client, rateCard, rateType].join('|')
});

const ItemType = "CLIENT";
// --- Helper: Equipment Icon ---
function EquipmentIcon({ equipmentName }) {
    let icon = <FiUsers className="w-4 h-4 text-gray-500" />; // Default
    if (equipmentName?.includes("USG")) icon = <FiMic className="w-4 h-4 text-blue-500" />;
    else if (equipmentName?.includes("CT")) icon = <FiChevronsRight className="w-4 h-4 text-green-500" />;
    else if (equipmentName?.includes("X-Ray")) icon = <FiPauseCircle className="w-4 h-4 text-purple-500" />; // Placeholder

    return (
        <div className="flex items-center space-x-1" title={equipmentName}>
            {icon}
            <span className="text-xs font-medium text-gray-600">{equipmentName}</span>
        </div>
    );
}

// --- Confirmation Modal (Unchanged) ---
function ConfirmationModal({ isOpen, onClose, onConfirm, message, title = "Confirmation", color = "blue" }) {
  if (!isOpen) return null;
  // Color classes
  const colorMap = {
    blue: {
      border: "border-blue-300",
      text: "text-blue-700",
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      ring: "focus:ring-blue-400"
    },
    green: {
      border: "border-green-300",
      text: "text-green-700",
      bg: "bg-green-600",
      hover: "hover:bg-green-700",
      ring: "focus:ring-green-400"
    },
    red: {
      border: "border-red-300",
      text: "text-red-700",
      bg: "bg-red-600",
      hover: "hover:bg-red-700",
      ring: "focus:ring-red-400"
    }
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade">
      <div className="bg-white rounded-xl shadow-xl p-8 w-96 text-center">
        <div className={`border-b pb-4 mb-4 ${c.border}`}>
          <h2 className={`text-xl font-semibold ${c.text}`}>{title}</h2>
        </div>
        <p 
          className="text-gray-700 text-lg mb-6"
          dangerouslySetInnerHTML={{
            __html: message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }}
        />
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className={`px-6 py-3 border ${c.border} ${c.text} rounded-lg hover:bg-gray-50 font-medium transition duration-200 focus:outline-none focus:ring-2 ${c.ring} focus:ring-opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 ${c.bg} text-white rounded-lg ${c.hover} font-medium transition duration-200 focus:outline-none focus:ring-2 ${c.ring} focus:ring-opacity-50`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Draggable Tile (Modified to show equipment icon) ---
function DraggableTile({ client, index, moveTile, displayedClientIndex, closeToken, completeToken, doneAndHold, callNext, continueToken, queueStarted, handleStartQueue, allClients, selectedEquipment }) {
    const [{ isDragging }, ref] = useDrag({
        type: ItemType,
        item: { index: displayedClientIndex }, // Use index from the displayed (filtered) list
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedItem) => {
            if (draggedItem.index !== displayedClientIndex) {
                moveTile(draggedItem.index, displayedClientIndex);
                draggedItem.index = displayedClientIndex;
            }
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState("");

    const handleAction = (type) => {
        setActionType(type);
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        setIsModalOpen(false);
        if (actionType === "complete") completeToken(displayedClientIndex);
        else if (actionType === "close") closeToken(displayedClientIndex);
        else if (actionType === "doneAndHold") doneAndHold(displayedClientIndex);
        else if (actionType === "callNext") callNext(displayedClientIndex);
        else if (actionType === "continue") continueToken(displayedClientIndex);
        else if (actionType === "startQueue") handleStartQueue();
    };

    const getActionMessage = () => {
        switch (actionType) {
            case "complete": return `Are you sure you want to **complete** the token for **${client.name}**?`;
            case "close": return `Are you sure you want to **close** the token for **${client.name}**?`;
            case "doneAndHold": return `Are you sure you want to mark as **done and hold** for **${client.name}**?`;
            case "callNext": return `Are you sure you want to call the **next** client after **${client.name}**?`;
            case "continue": return `Are you sure you want to **continue** the token for **${client.name}**?`;
            case "startQueue": return `Are you sure you want to **start** the queue for **${client.rateCard}**?`;
            default: return "";
        }
    };

    const getActionColor = () => {
        switch (actionType) {
            case "complete": return "green";
            case "close": return "red";
            case "doneAndHold": return "blue";
            case "callNext": return "green";
            case "continue": return "green";
            case "startQueue": return "green";
            default: return "blue";
        }
    };

    // Determine if all clients for this rateCard are 'Waiting'
    const allWaiting = useMemo(() => {
        return allClients
            .filter(c => c.rateCard === selectedEquipment && c.status !== "Completed" && c.status !== "Deleted")
            .every(c => c.status === "Waiting");
    }, [allClients, selectedEquipment]);

    return (
        <>
            <div
                ref={(node) => ref(drop(node))}
                className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 relative select-none cursor-move transition-transform duration-300 ${
                    isDragging ? "opacity-50 scale-105 border-blue-500 shadow-xl" : "hover:shadow-lg"
                }`}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-sm font-medium">#{client.queueIndex}</span>
                </div>
                 <span
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                            client.status === "In-Progress"
                                ? "bg-green-100 text-green-600"
                                : client.status === "On-Hold"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {client.status}
                    </span>
                <h2 className="text-lg font-bold text-gray-800 mt-1">{client.name}</h2>
                <p className="text-gray-500 text-sm mb-2">{client.contact}</p>
                <div className="flex justify-between items-center mt-4">
                    <div><p className="text-gray-500 text-xs">In-Time</p><p className="text-gray-800 text-sm font-semibold">{client.inTime}</p></div>
                    <div><p className="text-gray-500 text-xs">Rate Card</p><p className="text-gray-800 text-sm font-semibold">{client.rateCard || "N/A"}</p></div>
                    <div><p className="text-gray-500 text-xs">Rate Type</p><p className="text-gray-800 text-sm font-semibold">{client.rateType || "N/A"}</p></div>
                </div>
                {(displayedClientIndex === 0 && allWaiting) || client.status === "Waiting" ? (
                    <div className="flex justify-between mt-4 space-x-2">
                        {displayedClientIndex === 0 && allWaiting && (
                            <button 
                                onClick={() => handleAction("startQueue")}
                                className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg py-2 px-4 text-sm font-medium transition-colors border border-green-100"
                            >
                                <FiPlayCircle /> 
                                <span>Start the Queue</span>
                            </button>
                        )}
                        {client.status === "Waiting" && (
                            <button 
                                onClick={() => handleAction("close")} 
                                className="flex items-center justify-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 px-3 text-sm font-medium transition-colors border border-red-100"
                            >
                                <FiXCircle /> 
                                <span>Close</span>
                            </button>
                        )}
                    </div>
                ) : null}
                {client.status === "In-Progress" && (
                    <div className="flex justify-between mt-4 space-x-2">
                        <button onClick={() => handleAction("doneAndHold")} className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg py-2 px-2 text-sm font-medium transition-colors border border-blue-100"><FiCheckCircle /> <span>Done & Hold</span></button>
                        <button onClick={() => handleAction("callNext")} className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg py-2 px-2 text-sm font-medium transition-colors border border-green-100"><FiChevronsRight /> <span>Call Next</span></button>
                    </div>
                )}
                {client.status === "On-Hold" && (
                    <div className="mt-4"><button onClick={() => handleAction("continue")} className="w-full flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg py-2 px-4 text-sm font-medium transition-colors border border-blue-100"><FiPlayCircle /> <span>Continue</span></button></div>
                )}
            </div>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} message={getActionMessage()} color={getActionColor()} />
        </>
    );
}

// --- Queue Dashboard Component ---
function QueueDashboard({ selectedEquipment, allClients, setAllClients, onBackToSelection, queueStarted, setQueueStarted }) {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const dispatch = useDispatch();    
    const historyId = useAppSelector(state => state.queueDashboardSlice.historyId);
    const historyStack = useAppSelector(state => state.queueDashboardSlice.historyStack);
    const currentHistoryIndex = useAppSelector(state => state.queueDashboardSlice.currentHistoryIndex);
    const [filter, setFilter] = useState("All");
    const [animationDirection, setAnimationDirection] = useState("");    
    const [isRestoring, setIsRestoring] = useState(false);
    let notificationTimeoutId = null; // Declare outside or useRef in React

        const notifyIfNeeded = async (client, rateCard, rateType) => {
        if (
            notificationDeduplicator.shouldAllow({
                client,
                rateCard,
                rateType,
            })
        ) {
            await handleNotification(client, rateCard, rateType);
        }
    };

    const handleNotification = async (client = null, rateCard = null, rateType = null) => {
        try {
            if (!client || client.trim() === "") {
                console.warn("No client name provided, skipping notification.");
                return;  // 🛑 Skip if client is empty or null
            }

            const tokenArray = await fetchFcmTokens(companyName);
            const filteredTokens = tokenArray.filter(Boolean);
            if (!filteredTokens.length) {
                console.warn("No tokens available to send notification.");
                return;
            }

            // Compose notification body with rateCard and rateType
            let extraInfo = "";
            if (rateCard || rateType) {
                extraInfo = ` | ${rateCard || ""}${rateType ? ` (${rateType})` : ""}`;
            }

            const clientName = client;
            const response = await fetch("/api/send-notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: filteredTokens,
                    icon: "/icon-192x192.png",
                    title: `Queue Update!`,
                    body: `${clientName} is now IN-PROGRESS${extraInfo}`,
                    link: "/QueueDashboard",
                    data: {
                        client: clientName,
                        rateCard: rateCard,
                        rateType: rateType
                    }
                }),
            });
            const data = await response.json();
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    // Save a snapshot to history
    const saveSnapshot = async (snapshot) => {
        const res = await SaveQueueSnapshot(companyName, selectedEquipment, snapshot);
        if (res.data && res.data.success) {
            // Get the latest history ID and update the stack
            const latestRes = await GetQueueSnapshot(companyName, selectedEquipment, "undo", null);
            if (latestRes.data && latestRes.data.success && latestRes.data.id) {
                // Use the updateHistoryStack action which handles the stack properly
                dispatch({ type: 'queueDashboard/updateHistoryStack', payload: latestRes.data.id });
                dispatch(setHistoryId(latestRes.data.id));
            }
        }
    };

    // Derived state for displayed clients based on selected equipment
    const displayedClients = useMemo(() => {
        // Only show clients that are not Completed or Deleted
        return allClients
            .filter(c => c.rateCard === selectedEquipment && c.status !== "Completed" && c.status !== "Deleted")
            .sort((a, b) => a.queueIndex - b.queueIndex); // Sort by queueIndex in ascending order
    }, [allClients, selectedEquipment]);

    // Calculate counts for each status
    const statusCounts = useMemo(() => {
        const counts = {
            "All": displayedClients.length,
            "In-Progress": 0,
            "On-Hold": 0,
            "Waiting": 0
        };

        displayedClients.forEach(client => {
            if (client.status === "In-Progress") counts["In-Progress"]++;
            else if (client.status === "On-Hold") counts["On-Hold"]++;
            else if (client.status === "Waiting") counts["Waiting"]++;
        });

        return counts;
    }, [displayedClients]);

    // Helper to get the current queue snapshot
    const getCurrentSnapshot = () => {
        return allClients
            .filter(c => c.rateCard === selectedEquipment && c.status !== "Completed" && c.status !== "Deleted")
            .sort((a, b) => a.queueIndex - b.queueIndex)
            .map(c => ({
                id: c.id,
                queueIndex: c.queueIndex,
                entryDateTime: c.entryDateTime, // fallback for missing entryDateTime
                name: c.name,
                contact: c.contact,
                rateCard: c.rateCard,
                rateType: c.rateType,
                status: c.status,
                remarks: c.remarks
            }));
    };

    const saveSnapshotWithUpdatedState = async () => {
        // Get latest state
        const apiClients = await FetchQueueDashboardData(companyName);
        // Update local state
        setAllClients(apiClients);
        // Wait for 300ms to ensure queue table update is complete
        await new Promise(resolve => setTimeout(resolve, 300));
        // Build the snapshot from the latest apiClients, not from allClients
        const snapshot = apiClients
            .filter(c => c.rateCard === selectedEquipment && c.status !== "Completed" && c.status !== "Deleted")
            .sort((a, b) => a.queueIndex - b.queueIndex)
            .map(c => ({
                id: c.id,
                queueIndex: c.queueIndex,
                entryDateTime: c.entryDateTime,
                name: c.name,
                contact: c.contact,
                rateCard: c.rateCard,
                rateType: c.rateType,
                status: c.status,
                remarks: c.remarks
            }));
        await saveSnapshot(snapshot);
        return apiClients;
    };

    // Add a ref to store previous snapshot for undo/redo comparison
    const prevSnapshotRef = useRef(getCurrentSnapshot()); // Initial snapshot
    const notificationTimer = useRef(null);
    const lastInProgressClientRef = useRef(null);

    // Utility: Compare two snapshots and return the client that just became "In-Progress"
    const getNewInProgressClient = (prev, next) => {
        const prevMap = Object.fromEntries(prev.map(c => [c.id, c.status]));
        return next.find(c =>
            c.status === "In-Progress" &&
            prevMap[c.id] !== "In-Progress"
        );
    };


    // Move tile logic: Optimistically update UI, then call backend, then fetch and correct if needed
    const moveTile = async (fromDisplayedIndex, toDisplayedIndex) => {
        if (fromDisplayedIndex === toDisplayedIndex) return;
        const prevSnapshot = getCurrentSnapshot();
        const masterCopy = [...allClients];
        const itemsOfSelectedEquipment = masterCopy.filter(c => c.rateCard === selectedEquipment);
        const otherItems = masterCopy.filter(c => c.rateCard !== selectedEquipment);

        // Sort by queueIndex to get the current order
        itemsOfSelectedEquipment.sort((a, b) => a.queueIndex - b.queueIndex);
        // Save the current queueIndex and status order
        const prevOrder = itemsOfSelectedEquipment.map(c => ({ queueIndex: c.queueIndex, status: c.status }));

        // Remove the dragged item
        const [movedClientObj] = itemsOfSelectedEquipment.splice(fromDisplayedIndex, 1);
        // Insert it at the new position
        itemsOfSelectedEquipment.splice(toDisplayedIndex, 0, movedClientObj);

        // Assign queueIndex and status based on the previous order
        itemsOfSelectedEquipment.forEach((client, idx) => {
            client.queueIndex = prevOrder[idx]?.queueIndex || (idx + 1);
            client.status = prevOrder[idx]?.status || "Waiting";
        });

        // Build the new optimistic state
        const newAllClients = [...otherItems, ...itemsOfSelectedEquipment];

        // Optimistically update UI
        setAllClients(newAllClients);
        
        // Save snapshot for history
        await saveSnapshot(getCurrentSnapshot());

        // Call backend to update order
        const queueOrder = itemsOfSelectedEquipment.map(client => ({
            id: client.id,
            queueIndex: client.queueIndex,
            status: client.status
        }));

        await UpdateQueueOrder(companyName, selectedEquipment, queueOrder);

        // Fetch latest data after action
        const apiClients = await FetchQueueDashboardData(companyName);
        
        // Only update UI if backend data differs from optimistic state
        const getQueue = (clients) =>
            clients
                .filter(c => c.rateCard === selectedEquipment)
                .sort((a, b) => a.queueIndex - b.queueIndex)
                .map(c => ({ id: c.id, queueIndex: c.queueIndex, status: c.status }));

        const optimisticQueue = getQueue(newAllClients);
        const backendQueue = getQueue(apiClients);

        const isDifferent = (a, b) => {
            if (a.length !== b.length) return true;
            for (let i = 0; i < a.length; i++) {
                if (a[i].id !== b[i].id || a[i].queueIndex !== b[i].queueIndex || a[i].status !== b[i].status) {
                    return true;
                }
            }
            return false;
        };

        if (isDifferent(backendQueue, optimisticQueue)) {
            setAllClients(apiClients);
        }

        // After updating/fetching new state:
        const newSnapshot = getCurrentSnapshot();
        const changedClient = getNewInProgressClient(prevSnapshot, newSnapshot);

        if (changedClient) {
            await notifyIfNeeded(changedClient.name, changedClient.rateCard, changedClient.rateType);
        }
    };
  
    const closeToken = async (displayedIndex) => {
        const clientId = displayedClients[displayedIndex].id;
        await QueueDashboardAction(companyName, 'closeToken', { JsonClientId: clientId });
        const apiClients = await saveSnapshotWithUpdatedState();;
    };

    const completeToken = async (displayedIndex) => {
        const clientId = displayedClients[displayedIndex].id;
        await QueueDashboardAction(companyName, 'completeToken', { JsonClientId: clientId });
        const apiClients = await saveSnapshotWithUpdatedState();
    };

    const doneAndHold = async (displayedIndex) => {
        const clientId = displayedClients[displayedIndex].id;
        await QueueDashboardAction(companyName, 'doneAndHold', { JsonClientId: clientId });
        const apiClients = await saveSnapshotWithUpdatedState();
    };

    const callNext = async (displayedIndex) => {
        const clientId = displayedClients[displayedIndex].id;
        await QueueDashboardAction(companyName, 'callNext', { JsonClientId: clientId });
        
        const apiClients = await saveSnapshotWithUpdatedState();

        // Find in-progress clients excluding the just-called client
        const inProgressClients = apiClients
            .filter(c => c.rateCard === selectedEquipment && c.status === "In-Progress")
            .sort((a, b) => a.queueIndex - b.queueIndex);
        const nextInProgressClient = inProgressClients.find(c => c.id !== clientId);

        // 🔒 Safe call to handleNotification only if nextInProgressClient exists and has a name
        if (nextInProgressClient && nextInProgressClient.name && nextInProgressClient.name.trim() !== "") {
            await notifyIfNeeded(
                nextInProgressClient.name,
                nextInProgressClient.rateCard,
                nextInProgressClient.rateType
            );
        } else {
            console.warn("No valid next In-Progress client found, skipping notification.");
        }
    };

    const continueToken = async (displayedIndex) => {
        const clientId = displayedClients[displayedIndex].id;
        const clientName = displayedClients[displayedIndex].name;
        await QueueDashboardAction(companyName, 'continueToken', { JsonClientId: clientId });
        const apiClients = await saveSnapshotWithUpdatedState();
        await notifyIfNeeded(clientName, displayedClients[displayedIndex].rateCard, displayedClients[displayedIndex].rateType);
    };

    const handleStartQueue = async () => {
        const firstClient = displayedClients[0];
        if (!firstClient) return;
        await QueueDashboardAction(companyName, 'startQueue', { JsonClientId: firstClient.id });
        const apiClients = await saveSnapshotWithUpdatedState();
        await notifyIfNeeded(firstClient.name, firstClient.rateCard, firstClient.rateType);
    };

    // --- Undo/Redo with notification debounce ---
    const sendDebouncedNotification = (clientObj, delay = 3000) => {
        if (notificationTimer.current) clearTimeout(notificationTimer.current);
        lastInProgressClientRef.current = clientObj;
        notificationTimer.current = setTimeout(() => {
            if (lastInProgressClientRef.current) {
                notifyIfNeeded(
                    lastInProgressClientRef.current.name,
                    lastInProgressClientRef.current.rateCard,
                    lastInProgressClientRef.current.rateType
                );
            }
            notificationTimer.current = null;
            lastInProgressClientRef.current = null;
        }, delay);
    };


    // Undo/Redo logic
    const undo = async () => {
        if (isRestoring || currentHistoryIndex <= 0) return;
        const prevSnapshot = getCurrentSnapshot();
        setIsRestoring(true);

        const targetId = historyStack[currentHistoryIndex - 1];
        const res = await GetQueueSnapshot(companyName, selectedEquipment, null, targetId);

        if (res.data && res.data.success) {
            const resQ = await RestoreQueueSnapshot(companyName, selectedEquipment, res.data.snapshot);
            dispatch(setHistoryId(targetId));
            dispatch({ type: 'queueDashboard/setCurrentHistoryIndex', payload: currentHistoryIndex - 1 });

            const apiClients = await FetchQueueDashboardData(companyName);
            setAllClients(apiClients);

            // 🕒 Wait for React state update before getting new snapshot
            setTimeout(() => {
                const changedClient = getNewInProgressClient(prevSnapshot, apiClients);

                if (changedClient) {
                    sendDebouncedNotification(changedClient, 5000);
                }
            }, 0); // Wait for next tick (React to update state)
        } else {
            console.warn("[UNDO] Error restoring snapshot:", res);
        }

        setIsRestoring(false);
    };


    const redo = async () => {
        if (isRestoring || currentHistoryIndex >= historyStack.length - 1) return;
        const prevSnapshot = getCurrentSnapshot();
        setIsRestoring(true);

        // Get the target history ID from the stack
        const targetId = historyStack[currentHistoryIndex + 1];
        // Note: direction is no longer needed since we're fetching by exact ID
        const res = await GetQueueSnapshot(companyName, selectedEquipment, null, targetId);

        if (res.data && res.data.success) {
            const resQ = await RestoreQueueSnapshot(companyName, selectedEquipment, res.data.snapshot);
            dispatch(setHistoryId(targetId));
            dispatch({ type: 'queueDashboard/setCurrentHistoryIndex', payload: currentHistoryIndex + 1 });
            
            const apiClients = await FetchQueueDashboardData(companyName);
            setAllClients(apiClients);

            // 🕒 Wait for React state update before getting new snapshot
            setTimeout(() => {
                const changedClient = getNewInProgressClient(prevSnapshot, apiClients);

                if (changedClient) {
                    sendDebouncedNotification(changedClient, 5000);
                }
            }, 0); // Wait for next tick (React to update state)
        } else {
            console.warn("[REDO] Error restoring snapshot:", res);
        }
        setIsRestoring(false);
    };

    // Update undo/redo button disabled states
    const undoDisabled = currentHistoryIndex <= 0;
    const redoDisabled = currentHistoryIndex >= historyStack.length - 1;

    const handleFilterChange = (status) => {
        const currentIndex = statuses.indexOf(filter);
        const newIndex = statuses.indexOf(status);
        if (newIndex > currentIndex) setAnimationDirection("slide-in-right");
        else if (newIndex < currentIndex) setAnimationDirection("slide-in-left");
        setFilter(status);
    };

    const clientsForDisplayGrid = useMemo(() => {
        return displayedClients.filter(client => filter === "All" || client.status === filter);
    }, [displayedClients, filter]);

    const statuses = ["All", "In-Progress", "On-Hold", "Waiting"];
    const currentDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <DndProvider backend={HTML5Backend}>
                    <div className="min-h-screen bg-gray-50 p-6 lg:px-16 xl:px-24 2xl:px-32">
{/* Responsive Top Section: All elements aligned, Undo/Redo far right */}
<div className="w-full mb-4 pt-2 md:pt-6">
  {/* Header Row: Back, Title/Date, Undo/Redo (undo/redo always far right) */}
  <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 w-full">
    {/* Left: Back + Title/Date */}
    <div className="flex items-center min-w-0 gap-2 md:gap-4 flex-1">
      <button
        onClick={onBackToSelection}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
        title="Back to Equipment Selection"
      >
        <FaChevronLeft className="text-blue-600 h-5 w-5 md:h-6 md:w-6" />
      </button>
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-base sm:text-lg md:text-2xl font-bold text-blue-600 truncate">
          Queue for {selectedEquipment}
        </span>
        <span className="text-xs md:text-sm text-gray-500 mt-0.5">{currentDate}</span>
      </div>
    </div>
    {/* Right: Undo/Redo */}
    <div className="flex gap-2 md:gap-2 flex-shrink-0">
      <button
        onClick={undo}
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-red-200 ${undoDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Undo"
        disabled={undoDisabled}
      >
        <FaUndo className="text-red-600 text-base md:text-lg" />
      </button>
      <button
        onClick={redo}
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-blue-200 ${redoDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Redo"
        disabled={redoDisabled}
      >
        <FaRedo className="text-blue-600 text-base md:text-lg" />
      </button>
    </div>
  </div>

  {/* Filter Tabs (fit-width on desktop, scrollable on mobile) */}
  <div className="w-full mt-3">
    <div className="
        flex flex-nowrap items-center border border-gray-300 rounded-xl p-1 gap-1 min-w-0
        md:inline-flex md:w-auto md:min-w-0
        overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200
      ">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => handleFilterChange(status)}
          className={`flex items-center gap-1 px-2 md:px-4 py-1 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
            filter === status
              ? "bg-blue-600 text-white shadow"
              : "text-gray-600 hover:bg-blue-100"
          }`}
        >
          <span>{status}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {statusCounts[status]}
          </span>
        </button>
      ))}
    </div>
  </div>
</div>
                 <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-transform duration-500 ${animationDirection === "slide-in-right" ? "translate-x-full animate-slide-in-right" : animationDirection === "slide-in-left" ? "-translate-x-full animate-slide-in-left" : ""}`} onAnimationEnd={() => setAnimationDirection("")}>
{clientsForDisplayGrid.map((client, index) => {
    // Find the index in the full equipment queue (displayedClients)
    const fullIndex = displayedClients.findIndex(c => c.id === client.id);
    return (
        <DraggableTile
            key={client.id}
            client={client}
            displayedClientIndex={fullIndex}
            moveTile={moveTile}
            closeToken={closeToken}
            completeToken={completeToken}
            doneAndHold={doneAndHold}
            callNext={callNext}
            continueToken={continueToken}
            queueStarted={queueStarted[selectedEquipment]}
            handleStartQueue={handleStartQueue}
            allClients={allClients}
            selectedEquipment={selectedEquipment}
        />
    );
})}
                </div>
                <style jsx>{`@keyframes slide-in-left {from {transform: translateX(-100%);} to {transform: translateX(0);}} @keyframes slide-in-right {from {transform: translateX(100%);} to {transform: translateX(0);}} .animate-slide-in-left {animation: slide-in-left 0.5s ease-out forwards;} .animate-slide-in-right {animation: slide-in-right 0.5s ease-out forwards;}`}</style>
            </div>
        </DndProvider>
    );
}

// --- Equipment Selection Page ---
function useEquipmentStatus(equipmentList, allClients) {
    const [counts, setCounts] = useState(() => {
        const equipmentCounts = {};
        equipmentList.forEach(eq => {
            equipmentCounts[eq] = allClients.filter(c => c.rateCard === eq).length;
        });
        return equipmentCounts;
    });

    useEffect(() => {
        const equipmentCounts = {};
        equipmentList.forEach(eq => {
            equipmentCounts[eq] = allClients.filter(c => c.rateCard === eq).length;
        });
        setCounts(equipmentCounts);
    }, [equipmentList, allClients]);
    return counts;
}

function RateCardSelectionPage({ onSelectRateCard, equipmentList, allClients }) {
    const queueCounts = useEquipmentStatus(equipmentList, allClients);
    // Only show rateCards that exist in the initial data
    const availableRateCards = equipmentList;
    // Equipment config with icons
    const equipmentConfig = {
        "CT": { icon: CTIcon, label: "CT Scanner" },
        "USG": { icon: USGIcon, label: "Ultrasound" },
        "X-Ray": { icon: XRayIcon, label: "X-Ray Room" },
    };
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/0 via-white/20 to-white/0" />
            {/* Main content */}
            <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center p-6">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-extrabold mb-4 tracking-tight text-blue-800 drop-shadow-sm">
                        Client Queue System
                    </h1>
                    <p className="text-lg text-gray-700">
                        Select a rate card queue to manage
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
                    {availableRateCards.map((rateCard) => {
                        const Icon = (equipmentConfig[rateCard] && equipmentConfig[rateCard].icon) || FiUsers;
                        return (
                            <button
                                key={rateCard}
                                onClick={() => onSelectRateCard(rateCard)}
                                className="relative group bg-white border border-gray-200 rounded-lg p-6 shadow-lg \
                                         hover:shadow-2xl hover:border-blue-200 focus:border-blue-300 \
                                         transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-center space-x-4">
                                    <Icon className="w-8 h-8 text-blue-600" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-2xl font-bold text-gray-800">
                                            {rateCard}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {(equipmentConfig[rateCard] && equipmentConfig[rateCard].label) || rateCard}
                                        </span>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            In-Queue: {queueCounts[rateCard] || 0}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {/* Floating bottom nav */}
                <div className="fixed bottom-0 inset-x-0 p-4">
                    <div className="max-w-4xl mx-auto backdrop-blur bg-white/50 rounded-2xl shadow-lg p-4">
                        <p className="text-center text-sm text-gray-600">
                            Select any rate card above to manage its queue
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Application Component ---
export default function QueueSystem() {
    const [selectedEquipment, setSelectedEquipment] = useState(() => {
        // Try to get the saved equipment from localStorage on initial load
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedEquipment');
        }
        return null;
    });
    const [allClients, setAllClients] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasInitializedHistory, setHasInitializedHistory] = useState(false);
    const [queueStarted, setQueueStarted] = useState({});
    const dispatch = useDispatch();
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const historyStack = useAppSelector(state => state.queueDashboardSlice.historyStack);

    useEffect(() => {
        async function fetchInitialClientsAndHistory() {
            try {
                const apiClients = await FetchQueueDashboardData(companyName);
                setAllClients(apiClients);
                // Generate equipment list from API data
                const eqList = Array.from(new Set(apiClients.map(c => c.rateCard)));
                setEquipmentList(eqList);

                // Only save initial snapshot if history hasn't been initialized and we have a selected equipment
                if (!hasInitializedHistory && selectedEquipment) {
                    const initialSnapshot = apiClients
                        .filter(c => c.rateCard === selectedEquipment && c.status !== "Completed" && c.status !== "Deleted")
                        .sort((a, b) => a.queueIndex - b.queueIndex)
                        .map(c => ({
                            id: c.id,
                            queueIndex: c.queueIndex,
                            entryDateTime: c.entryDateTime,
                            name: c.name,
                            contact: c.contact,
                            rateCard: c.rateCard,
                            rateType: c.rateType,
                            status: c.status,
                            remarks: c.remarks
                        }));

                    if (!hasInitializedHistory && selectedEquipment && historyStack.length === 0) {
                    const res = await SaveQueueSnapshot(companyName, selectedEquipment, initialSnapshot);
                    if (res.data && res.data.success) {
                        const latestRes = await GetQueueSnapshot(companyName, selectedEquipment, "undo", null);                        
                        if (latestRes.data?.success && latestRes.data.id) {
                            dispatch({ type: 'queueDashboard/setHistoryStack', payload: [latestRes.data.id] });
                            dispatch({ type: 'queueDashboard/setCurrentHistoryIndex', payload: 0 });
                            dispatch(setHistoryId(latestRes.data.id));
                            setHasInitializedHistory(true);
                        }
                    }
                }
            }
                setIsInitialized(true);
            } catch (error) {
                console.error("[History] Error initializing:", error);
                setIsInitialized(true);
            }
        }
        
        fetchInitialClientsAndHistory();
    }, [selectedEquipment, companyName, hasInitializedHistory]);

    // Handler for equipment selection that resets history
    const handleEquipmentSelection = (equipment) => {
        // // Reset history state first
        // dispatch({ type: 'queueDashboard/resetHistory' });
        // Reset history initialization flag
        // setHasInitializedHistory(false);
        // Save the selected equipment to localStorage
        localStorage.setItem('selectedEquipment', equipment);
        // Then set the selected equipment
        setSelectedEquipment(equipment);
    };

    // Handler for back button that clears selected equipment
    const handleBackToSelection = () => {
        // Clear from localStorage
        localStorage.removeItem('selectedEquipment');
        // Clear from state
        setSelectedEquipment(null);
    };    // We don't need this effect anymore since initialization is handled in QueueSystem component

    if (!isInitialized) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl">Loading Dashboard...</p></div>;
    }

    if (!selectedEquipment) {
        return <RateCardSelectionPage onSelectRateCard={handleEquipmentSelection} equipmentList={equipmentList} allClients={allClients} />;
    }

    return (
        <QueueDashboard
            selectedEquipment={selectedEquipment}
            allClients={allClients}
            setAllClients={setAllClients}
            onBackToSelection={handleBackToSelection}
            queueStarted={queueStarted}
            setQueueStarted={setQueueStarted}
        />
    );
}