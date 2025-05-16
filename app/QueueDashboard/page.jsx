"use client";
import { useState, useEffect, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaUndo, FaRedo, FaChevronLeft } from "react-icons/fa";
import { FiUsers, FiMic, FiPauseCircle, FiPlayCircle, FiXCircle, FiCheckCircle, FiChevronsRight, FiActivity as CTIcon, FiRadio as XRayIcon, FiWifi as USGIcon } from 'react-icons/fi'; // Example icons

const ItemType = "CLIENT";

// --- Initial Data with Equipment ---
const initialClientsMaster = [
    // USG-1
    { id: "2", name: "Priya", rateType: "Pregnancy", rateCard: "USG", queueIndex: 1, inTime: "10:15 AM", contact: "9876543211", status: "Waiting", equipment: "USG-1" },
    { id: "7", name: "Meera", rateType: "Fetal Echo", rateCard: "USG", queueIndex: 2, inTime: "11:30 AM", contact: "9876543216", status: "Waiting", equipment: "USG-1" },
    { id: "12", name: "Karthik", rateType: "Venous (per limb)", rateCard: "USG", queueIndex: 3, inTime: "12:45 PM", contact: "9876543221", status: "Waiting", equipment: "USG-1" },
    { id: "15", name: "Sneha", rateType: "Anomaly", rateCard: "USG", queueIndex: 4, inTime: "1:30 PM", contact: "9876543224", status: "Waiting", equipment: "USG-1" },
    // USG-2
    { id: "4", name: "Raena", rateType: "Pregnancy anomaly", rateCard: "USG", queueIndex: 1, inTime: "10:45 AM", contact: "9876543213", status: "Waiting", equipment: "USG-2" },
    { id: "9", name: "Anjali", rateType: "Pregnancy Face", rateCard: "USG", queueIndex: 2, inTime: "12:00 PM", contact: "9876543218", status: "Waiting", equipment: "USG-2" },
    { id: "14", name: "Manoj", rateType: "Review Scan", rateCard: "USG", queueIndex: 3, inTime: "1:15 PM", contact: "9876543213", status: "Waiting", equipment: "USG-2" },
    // CT-1
    { id: "1", name: "Kumar", rateType: "Brain", rateCard: "CT", queueIndex: 1, inTime: "10:00 AM", contact: "9876543210", status: "Waiting", equipment: "CT-1" },
    { id: "3", name: "Vimal", rateType: "Abdomen and pelvis", rateCard: "CT", queueIndex: 2, inTime: "10:30 AM", contact: "9876543212", status: "Waiting", equipment: "CT-1" },
    { id: "10", name: "Suresh", rateType: "Thorax", rateCard: "CT", queueIndex: 3, inTime: "12:15 PM", contact: "9876543219", status: "Waiting", equipment: "CT-1" },
    { id: "13", name: "Lakshmi", rateType: "Paranasal Sinuses", rateCard: "CT", queueIndex: 4, inTime: "1:00 PM", contact: "9876543222", status: "Waiting", equipment: "CT-1" },
    // X-Ray-1
    { id: "5", name: "Saranya", rateType: "Breast", rateCard: "X-Ray", queueIndex: 1, inTime: "11:00 AM", contact: "9876543214", status: "Waiting", equipment: "X-Ray-1" },
    { id: "6", name: "Arjun", rateType: "LS Spine", rateCard: "X-Ray", queueIndex: 2, inTime: "11:15 AM", contact: "9876543215", status: "Waiting", equipment: "X-Ray-1" },
    { id: "8", name: "Ravi", rateType: "Knee Joint", rateCard: "X-Ray", queueIndex: 3, inTime: "11:45 AM", contact: "9876543217", status: "Waiting", equipment: "X-Ray-1" },
    { id: "11", name: "Divya", rateType: "Hysterosalphingogram", rateCard: "X-Ray", queueIndex: 4, inTime: "12:30 PM", contact: "9876543220", status: "Waiting", equipment: "X-Ray-1" },
];

const EQUIPMENT_LIST = ["USG-1", "USG-2", "CT-1", "X-Ray-1"];

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
function DraggableTile({ client, index, moveTile, displayedClientIndex, closeToken, completeToken, doneAndHold, callNext, continueToken, queueStarted, handleStartQueue }) {
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
            case "startQueue": return `Are you sure you want to **start** the queue for **${client.equipment}**?`;
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
                {(displayedClientIndex === 0 && !queueStarted) || client.status === "Waiting" ? (
                    <div className="flex justify-between mt-4 space-x-2">
                        {displayedClientIndex === 0 && !queueStarted && (
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
function QueueDashboard({ selectedEquipment, allClients, setAllClients, history, setHistory, currentStep, setCurrentStep, onBackToSelection, queueStarted, setQueueStarted }) {
    const [filter, setFilter] = useState("All");
    const [animationDirection, setAnimationDirection] = useState("");

    // This function processes the master client list and applies status rules.
    // Rule: One "In-Progress" client at the head of each equipment's queue, unless "On-Hold".
    const processAndCommitClientList = (updatedList, forceAllWaiting = false) => {
        let newMasterList = updatedList.map(c => ({ ...c }));
        const equipmentToProcess = selectedEquipment;
        
        // Only process clients for selected equipment
        newMasterList = newMasterList.map(client => {
            if (client.equipment !== equipmentToProcess) {
                return client; // Leave other equipment's clients unchanged
            }

            // Process only selected equipment's clients
            if (forceAllWaiting) {
                return { ...client, status: "Waiting" };
            }

            // Get all clients for this equipment to determine position
            const eqClients = newMasterList.filter(c => c.equipment === equipmentToProcess);
            const clientIndex = eqClients.findIndex(c => c.id === client.id);

            if (clientIndex === 0) {
                // First position can be In-Progress or On-Hold
                if (client.status !== "On-Hold" && client.status !== "In-Progress") {
                    return { ...client, status: "In-Progress" };
                }
            } else {
                // All other positions must be Waiting
                return { ...client, status: "Waiting" };
            }
            
            return client;
        });

        setAllClients(newMasterList);
        
        // Update only selected equipment's history/step
        const eq = selectedEquipment;
        const eqQueue = newMasterList.filter(c => c.equipment === eq);
        const newHistory = { ...history };
        const newStep = { ...currentStep };
        newHistory[eq] = (history[eq] || []).slice(0, (currentStep[eq] ?? 0) + 1);
        newHistory[eq].push(eqQueue);
        newStep[eq] = newHistory[eq].length - 1;
        setHistory(newHistory);
        setCurrentStep(newStep);
    };

    // Derived state for displayed clients based on selected equipment
    const displayedClients = useMemo(() => {
        return allClients.filter(c => c.equipment === selectedEquipment);
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

    // Move tile logic: Update statuses based on new positions
    const moveTile = (fromDisplayedIndex, toDisplayedIndex) => {
        const masterCopy = [...allClients];
        const itemsOfSelectedEquipment = masterCopy.filter(c => c.equipment === selectedEquipment);
        const otherItems = masterCopy.filter(c => c.equipment !== selectedEquipment);

        // Move the item in the array
        const [movedClientObj] = itemsOfSelectedEquipment.splice(fromDisplayedIndex, 1);
        itemsOfSelectedEquipment.splice(toDisplayedIndex, 0, movedClientObj);

        // Update queueIndex for all clients of this equipment based on their new order
        itemsOfSelectedEquipment.forEach((client, idx) => {
            client.queueIndex = idx + 1;
        });

        // Reconstruct master list
        let finalReorderedMasterList = [];
        let itemsOfSelectedEquipmentPtr = 0;
        let otherItemsPtr = 0;

        allClients.forEach(originalClient => {
            if (originalClient.equipment === selectedEquipment) {
                if (itemsOfSelectedEquipment[itemsOfSelectedEquipmentPtr]) {
                    finalReorderedMasterList.push(itemsOfSelectedEquipment[itemsOfSelectedEquipmentPtr++]);
                }
            } else {
                if (otherItems[otherItemsPtr]) {
                    finalReorderedMasterList.push(otherItems[otherItemsPtr++]);
                }
            }
        });

        // Process list to update statuses
        processAndCommitClientList(finalReorderedMasterList, !queueStarted[selectedEquipment]);
    };

    const modifyClientList = (action) => {
        let updatedAllClients = [...allClients];
        action(updatedAllClients); // The action should modify updatedAllClients in place or return new
        processAndCommitClientList(updatedAllClients);
    };
    
    const findClientAndPerform = (displayedIndex, operation) => {
        const clientIdToActOn = displayedClients[displayedIndex].id;
        let newAllClients = [...allClients];
        const clientGlobalIndex = newAllClients.findIndex(c => c.id === clientIdToActOn);

        if (clientGlobalIndex !== -1) {
            operation(newAllClients, clientGlobalIndex, clientIdToActOn);
        }
        processAndCommitClientList(newAllClients);
    };

    const closeToken = (displayedIndex) => {
        findClientAndPerform(displayedIndex, (list, globalIdx, clientId) => {
            list.splice(globalIdx, 1);
        });
    };

    const completeToken = (displayedIndex) => { // Same as close for now
        findClientAndPerform(displayedIndex, (list, globalIdx, clientId) => {
            list.splice(globalIdx, 1);
        });
    };

    const doneAndHold = (displayedIndex) => {
        findClientAndPerform(displayedIndex, (list, globalIdx, clientId) => {
            list.splice(globalIdx, 1); // Remove completed
            // Find next for selectedEquipment and set to On-Hold
            const currentEqQueue = list.filter(c => c.equipment === selectedEquipment);
            if (currentEqQueue.length > 0) {
                 const nextClientInQueueId = currentEqQueue[0].id;
                 const nextClientGlobalIndex = list.findIndex(c => c.id === nextClientInQueueId);
                 if (nextClientGlobalIndex !== -1) list[nextClientGlobalIndex].status = "On-Hold";
            }
        });
    };
    
    const callNext = (displayedIndex) => {
         findClientAndPerform(displayedIndex, (list, globalIdx, clientId) => {
            list.splice(globalIdx, 1); // Remove completed, status update will handle next In-Progress
        });
    };

    const continueToken = (displayedIndex) => {
         findClientAndPerform(displayedIndex, (list, globalIdx, clientId) => {
            list[globalIdx].status = "In-Progress"; // Will be finalized by processAndCommit
        });
    };

    // Undo: If undoing to step 0, also reset queueStarted in localStorage
    const undo = () => {
        if (
            !history[selectedEquipment] ||
            typeof currentStep[selectedEquipment] !== 'number' ||
            currentStep[selectedEquipment] <= 0
        ) {
            return;
        }
        const newStep = { ...currentStep, [selectedEquipment]: currentStep[selectedEquipment] - 1 };
        setCurrentStep(newStep);
        // Only update selected equipment's queue
        const newAllClients = allClients.map(c =>
            c.equipment === selectedEquipment ? null : c
        ).filter(Boolean);
        let eqQueue = history[selectedEquipment][newStep[selectedEquipment]];
        // Update queueIndex for this equipment's clients
        eqQueue = eqQueue.map((client, idx) => ({ ...client, queueIndex: idx + 1 }));
        setAllClients([
            ...newAllClients,
            ...(eqQueue || [])
        ]);
        // If undoing to step 0 for all equipment, allow "Start the Queue" again
        if (Object.values(newStep).every(step => step === 0)) {
            setQueueStarted(false);
            localStorage.removeItem("queueStartedDate");
        }
        // If undoing to step 0, reset queue started for this equipment only
        if (newStep[selectedEquipment] === 0) {
            const newQueueStarted = { ...queueStarted, [selectedEquipment]: false };
            setQueueStarted(newQueueStarted);
            localStorage.removeItem(`queueStartedDate_${selectedEquipment}`);
        }
    };

    // Redo: If redoing from step 0 to 1, set queueStarted for this equipment
    const redo = () => {
        if (
            !history[selectedEquipment] ||
            typeof currentStep[selectedEquipment] !== 'number' ||
            currentStep[selectedEquipment] >= history[selectedEquipment].length - 1
        ) {
            return;
        }
        const newStep = { ...currentStep, [selectedEquipment]: currentStep[selectedEquipment] + 1 };
        setCurrentStep(newStep);
        // Only update selected equipment's queue
        const newAllClients = allClients.map(c =>
            c.equipment === selectedEquipment ? null : c
        ).filter(Boolean);
        let eqQueue = history[selectedEquipment][newStep[selectedEquipment]];
        // Update queueIndex for this equipment's clients
        eqQueue = eqQueue.map((client, idx) => ({ ...client, queueIndex: idx + 1 }));
        setAllClients([
            ...newAllClients,
            ...(eqQueue || [])
        ]);
        // If redoing from step 0 to 1, set queue started for this equipment
        if (currentStep[selectedEquipment] === 0 && newStep[selectedEquipment] === 1) {
            const newQueueStarted = { ...queueStarted, [selectedEquipment]: true };
            setQueueStarted(newQueueStarted);
            const today = new Date().toISOString().slice(0, 10);
            localStorage.setItem(`queueStartedDate_${selectedEquipment}`, today);
        }
    };

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

    // Start the queue handler
    const handleStartQueue = () => {
        processAndCommitClientList(allClients, false);
        const newQueueStarted = { ...queueStarted, [selectedEquipment]: true };
        setQueueStarted(newQueueStarted);
        // Persist start for today for this equipment
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`queueStartedDate_${selectedEquipment}`, today);
    };

    const statuses = ["All", "In-Progress", "On-Hold", "Waiting"];
    const currentDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center space-x-4">
                        <button 
                            onClick={onBackToSelection} 
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                            title="Back to Equipment Selection"
                        >
                            <FaChevronLeft className="text-blue-600 h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-blue-600">Queue for {selectedEquipment}</h1>
                            <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <button 
                            onClick={undo} 
                            disabled={
                                !history[selectedEquipment] ||
                                typeof currentStep[selectedEquipment] !== 'number' ||
                                currentStep[selectedEquipment] <= 0
                            }
                            className={`w-10 h-10 rounded-full flex items-center justify-center group relative ${
                                history[selectedEquipment] && typeof currentStep[selectedEquipment] === 'number' && currentStep[selectedEquipment] > 0
                                    ? "bg-gray-200 hover:bg-gray-300"
                                    : "bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                            <FaUndo className={`text-gray-600 ${
                                !history[selectedEquipment] || typeof currentStep[selectedEquipment] !== 'number' || currentStep[selectedEquipment] <= 0
                                    ? "opacity-50"
                                    : ""
                            }`} />
                            <span className="absolute top-full mt-2 hidden group-hover:flex items-center justify-center bg-gray-900 text-white text-xs font-medium rounded-lg px-2 py-1 shadow-lg">Undo<span className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span></span>
                        </button>
                        <button 
                            onClick={redo} 
                            disabled={
                                !history[selectedEquipment] ||
                                typeof currentStep[selectedEquipment] !== 'number' ||
                                currentStep[selectedEquipment] >= (history[selectedEquipment]?.length ?? 0) - 1
                            }
                            className={`w-10 h-10 rounded-full flex items-center justify-center group relative ${
                                history[selectedEquipment] && typeof currentStep[selectedEquipment] === 'number' && currentStep[selectedEquipment] < (history[selectedEquipment]?.length ?? 0) - 1
                                    ? "bg-gray-200 hover:bg-gray-300"
                                    : "bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                            <FaRedo className={`text-gray-600 ${
                                !history[selectedEquipment] || typeof currentStep[selectedEquipment] !== 'number' || currentStep[selectedEquipment] >= (history[selectedEquipment]?.length ?? 0) - 1
                                    ? "opacity-50"
                                    : ""
                            }`} />
                            <span className="absolute top-full mt-2 hidden group-hover:flex items-center justify-center bg-gray-900 text-white text-xs font-medium rounded-lg px-2 py-1 shadow-lg">Redo<span className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span></span>
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }} 
                            className="w-10 h-10 rounded-full flex items-center justify-center group relative bg-red-200 hover:bg-red-300"
                            title="Reset"
                        >
                            <FaUndo className="text-red-600" />
                            <span className="absolute top-full mt-2 hidden group-hover:flex items-center justify-center bg-gray-900 text-white text-xs font-medium rounded-lg px-2 py-1 shadow-lg">Reset<span className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span></span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 sm:space-y-0 space-y-4 mb-6">
                    <div className="flex flex-wrap items-center border border-gray-300 rounded-xl p-2">
                        {statuses.map((status) => (
                            <button 
                                key={status} 
                                onClick={() => handleFilterChange(status)} 
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                                    filter === status 
                                        ? "bg-blue-600 text-white shadow" 
                                        : "text-gray-600 hover:bg-blue-100"
                                }`}
                            >
                                <span>{status}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    filter === status 
                                        ? "bg-blue-500 text-white" 
                                        : "bg-gray-200 text-gray-600"
                                }`}>
                                    {statusCounts[status]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-transform duration-500 ${animationDirection === "slide-in-right" ? "translate-x-full animate-slide-in-right" : animationDirection === "slide-in-left" ? "-translate-x-full animate-slide-in-left" : ""}`} onAnimationEnd={() => setAnimationDirection("")}>
                    {clientsForDisplayGrid.map((client, index) => (
                        <DraggableTile
                            key={client.id}
                            client={client}
                            displayedClientIndex={index} // This is the index within clientsForDisplayGrid
                            moveTile={moveTile}
                            closeToken={closeToken}
                            completeToken={completeToken}
                            doneAndHold={doneAndHold}
                            callNext={callNext}
                            continueToken={continueToken}
                            queueStarted={queueStarted[selectedEquipment]} // Add these new props
                            handleStartQueue={handleStartQueue}
                        />
                    ))}
                </div>
                <style jsx>{`@keyframes slide-in-left {from {transform: translateX(-100%);} to {transform: translateX(0);}} @keyframes slide-in-right {from {transform: translateX(100%);} to {transform: translateX(0);}} .animate-slide-in-left {animation: slide-in-left 0.5s ease-out forwards;} .animate-slide-in-right {animation: slide-in-right 0.5s ease-out forwards;}`}</style>
            </div>
        </DndProvider>
    );
}

// --- Equipment Selection Page ---
function useEquipmentStatus() {
    const [counts, setCounts] = useState(() => {
        // Initialize counts from initialClientsMaster
        const equipmentCounts = {};
        EQUIPMENT_LIST.forEach(eq => {
            equipmentCounts[eq] = initialClientsMaster.filter(c => c.equipment === eq).length;
        });
        return equipmentCounts;
    });

    // No need for polling effect since we're using actual data
    return counts;
}

// Replace EquipmentSelectionPage with enhanced version
function EquipmentSelectionPage({ onSelectEquipment }) {
    const queueCounts = useEquipmentStatus();
    
    // Equipment config with icons
    const equipmentConfig = {
        "CT-1": { icon: CTIcon, label: "CT Scanner" },
        "USG-1": { icon: USGIcon, label: "Ultrasound 1" },
        "USG-2": { icon: USGIcon, label: "Ultrasound 2" },
        "X-Ray-1": { icon: XRayIcon, label: "X-Ray Room" },
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
                        Select an equipment queue to manage
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
                    {EQUIPMENT_LIST.map((eq) => {
                        const Icon = equipmentConfig[eq].icon;
                        return (
                            <button
                                key={eq}
                                onClick={() => onSelectEquipment(eq)}
                                className="relative group bg-white border border-gray-200 rounded-lg p-6 shadow-lg 
                                         hover:shadow-2xl hover:border-blue-200 focus:border-blue-300 
                                         transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-center space-x-4">
                                    <Icon className="w-8 h-8 text-blue-600" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-2xl font-bold text-gray-800">
                                            {eq}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {equipmentConfig[eq].label}
                                        </span>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            In-Queue: {queueCounts[eq]}
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
                            Select any equipment above to manage its queue
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Application Component ---
export default function QueueSystem() {
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [allClients, setAllClients] = useState([]);
    const [history, setHistory] = useState({});
    const [currentStep, setCurrentStep] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [queueStarted, setQueueStarted] = useState({}); // Changed to object to track per equipment

    // Persist selectedEquipment to localStorage
    useEffect(() => {
        if (selectedEquipment) {
            localStorage.setItem("selectedEquipment", selectedEquipment);
        }
    }, [selectedEquipment]);

    // On mount, load selectedEquipment from localStorage if present
    useEffect(() => {
        const savedEquipment = localStorage.getItem("selectedEquipment");
        if (savedEquipment) {
            setSelectedEquipment(savedEquipment);
        }
    }, []);

    // On mount, check if queue has started for today for each equipment
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const queueStartStatus = {};
        
        EQUIPMENT_LIST.forEach(equipment => {
            const startedDate = localStorage.getItem(`queueStartedDate_${equipment}`);
            queueStartStatus[equipment] = startedDate === today;
        });
        
        setQueueStarted(queueStartStatus);
    }, []);

    // Function to apply status rules (one "In-Progress" per equipment queue head)
    const applyInitialStatusRules = (clientsList, forceAllWaiting = false) => {
        let newMasterList = clientsList.map(c => ({ ...c }));
        const clientsByEquipment = {};
        newMasterList.forEach(c => {
            if (!clientsByEquipment[c.equipment]) {
                clientsByEquipment[c.equipment] = [];
            }
            clientsByEquipment[c.equipment].push(c);
        });

        for (const eq in clientsByEquipment) {
            const queue = clientsByEquipment[eq];
            if (forceAllWaiting) {
                queue.forEach(client => {
                    if (client.status !== "On-Hold") {
                        client.status = "Waiting";
                    }
                });
            } else {
                let inProgressSet = false;
                queue.forEach((client, idx) => {
                    if (idx === 0 && client.status !== "On-Hold") {
                        client.status = "In-Progress";
                        inProgressSet = true;
                    } else if (client.status !== "On-Hold") {
                        client.status = "Waiting";
                    }
                });
            }
        }
        return Object.values(clientsByEquipment).flat().sort((a,b) => clientsList.indexOf(a) - clientsList.indexOf(b)); // Re-flatten and attempt to restore original sort
    };

    // Load initial data and set initial statuses
    useEffect(() => {
        const savedClients = localStorage.getItem("allClientsGlobal");
        let loadedClients = initialClientsMaster;
        if (savedClients) {
            loadedClients = JSON.parse(savedClients);
        }
        // Check if queue started for today
        const today = new Date().toISOString().slice(0, 10);
        const startedDate = localStorage.getItem("queueStartedDate");
        const forceAllWaiting = startedDate !== today;
        const initialProcessedClients = applyInitialStatusRules(loadedClients, forceAllWaiting);
        setAllClients(initialProcessedClients);

        // Refactor: load per-equipment history and step
        const savedHistory = localStorage.getItem("historyGlobal");
        const savedStep = localStorage.getItem("currentStepGlobal");
        if (savedHistory && savedStep) {
            setHistory(JSON.parse(savedHistory));
            setCurrentStep(JSON.parse(savedStep));
        } else {
            // Initialize history and step for each equipment
            const initialHistory = {};
            const initialStep = {};
            EQUIPMENT_LIST.forEach(eq => {
                initialHistory[eq] = [initialProcessedClients.filter(c => c.equipment === eq)];
                initialStep[eq] = 0;
            });
            setHistory(initialHistory);
            setCurrentStep(initialStep);
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever allClients, history, or currentStep changes
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("allClientsGlobal", JSON.stringify(allClients));
        localStorage.setItem("historyGlobal", JSON.stringify(history));
        localStorage.setItem("currentStepGlobal", JSON.stringify(currentStep));
    }, [allClients, history, currentStep, isInitialized]);

    if (!isInitialized) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl">Loading Dashboard...</p></div>;
    }

    if (!selectedEquipment) {
        return <EquipmentSelectionPage onSelectEquipment={setSelectedEquipment} />;
    }

    return (
        <QueueDashboard
            selectedEquipment={selectedEquipment}
            allClients={allClients}
            setAllClients={setAllClients}
            history={history}
            setHistory={setHistory}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onBackToSelection={() => setSelectedEquipment(null)}
            queueStarted={queueStarted}
            setQueueStarted={setQueueStarted}
        />
    );
}