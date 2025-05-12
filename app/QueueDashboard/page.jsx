"use client";
import { useState, useEffect, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaUndo, FaRedo, FaChevronLeft } from "react-icons/fa";
import { FiUsers, FiMic, FiPauseCircle, FiPlayCircle, FiXCircle, FiCheckCircle, FiChevronsRight } from 'react-icons/fi'; // Example icons

const ItemType = "PATIENT";

// --- Initial Data with Equipment ---
const initialPatientsMaster = [
    // USG-1
    { id: "2", name: "Priya", scanType: "Pregnancy", scan: "USG", orderNumber: "2500001", inTime: "10:15 AM", contact: "9876543211", status: "Waiting", equipment: "USG-1" },
    { id: "7", name: "Meera", scanType: "Fetal Echo", scan: "USG", orderNumber: "2500002", inTime: "11:30 AM", contact: "9876543216", status: "Waiting", equipment: "USG-1" },
    { id: "12", name: "Karthik", scanType: "Venous (per limb)", scan: "USG", orderNumber: "2500003", inTime: "12:45 PM", contact: "9876543221", status: "Waiting", equipment: "USG-1" },
    { id: "15", name: "Sneha", scanType: "Anomaly", scan: "USG", orderNumber: "2500004", inTime: "1:30 PM", contact: "9876543224", status: "Waiting", equipment: "USG-1" },
    // USG-2
    { id: "4", name: "Raena", scanType: "Pregnancy anomaly", scan: "USG", orderNumber: "2500005", inTime: "10:45 AM", contact: "9876543213", status: "Waiting", equipment: "USG-2" },
    { id: "9", name: "Anjali", scanType: "Pregnancy Face", scan: "USG", orderNumber: "2500006", inTime: "12:00 PM", contact: "9876543218", status: "Waiting", equipment: "USG-2" },
    { id: "14", name: "Manoj", scanType: "Review Scan", scan: "USG", orderNumber: "2500007", inTime: "1:15 PM", contact: "9876543213", status: "Waiting", equipment: "USG-2" },
    // CT-1
    { id: "1", name: "Kumar", scanType: "Brain", scan: "CT", orderNumber: "250001", inTime: "10:00 AM", contact: "9876543210", status: "Waiting", equipment: "CT-1" },
    { id: "3", name: "Vimal", scanType: "Abdomen and pelvis", scan: "CT", orderNumber: "250002", inTime: "10:30 AM", contact: "9876543212", status: "Waiting", equipment: "CT-1" },
    { id: "10", name: "Suresh", scanType: "Thorax", scan: "CT", orderNumber: "250003", inTime: "12:15 PM", contact: "9876543219", status: "Waiting", equipment: "CT-1" },
    { id: "13", name: "Lakshmi", scanType: "Paranasal Sinuses", scan: "CT", orderNumber: "250004", inTime: "1:00 PM", contact: "9876543222", status: "Waiting", equipment: "CT-1" },
    // X-Ray-1
    { id: "5", name: "Saranya", scanType: "Breast", scan: "X-Ray", orderNumber: "250001", inTime: "11:00 AM", contact: "9876543214", status: "Waiting", equipment: "X-Ray-1" },
    { id: "6", name: "Arjun", scanType: "LS Spine", scan: "X-Ray", orderNumber: "250002", inTime: "11:15 AM", contact: "9876543215", status: "Waiting", equipment: "X-Ray-1" },
    { id: "8", name: "Ravi", scanType: "Knee Joint", scan: "X-Ray", orderNumber: "250003", inTime: "11:45 AM", contact: "9876543217", status: "Waiting", equipment: "X-Ray-1" },
    { id: "11", name: "Divya", scanType: "Hysterosalphingogram", scan: "X-Ray", orderNumber: "250004", inTime: "12:30 PM", contact: "9876543220", status: "Waiting", equipment: "X-Ray-1" },
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
        <p className="text-gray-700 text-lg mb-6">{message}</p>
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
function DraggableTile({ patient, index, moveTile, displayedPatIndex, closeToken, completeToken, doneAndHold, callNext, continueToken }) {
    const [{ isDragging }, ref] = useDrag({
        type: ItemType,
        item: { index: displayedPatIndex }, // Use index from the displayed (filtered) list
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedItem) => {
            if (draggedItem.index !== displayedPatIndex) {
                moveTile(draggedItem.index, displayedPatIndex);
                draggedItem.index = displayedPatIndex;
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
        if (actionType === "complete") completeToken(displayedPatIndex);
        else if (actionType === "close") closeToken(displayedPatIndex);
        else if (actionType === "doneAndHold") doneAndHold(displayedPatIndex);
        else if (actionType === "callNext") callNext(displayedPatIndex);
        else if (actionType === "continue") continueToken(displayedPatIndex);
    };

    const getActionMessage = () => {
        switch (actionType) {
            case "complete": return `Are you sure you want to complete the token for ${patient.name}?`;
            case "close": return `Are you sure you want to close the token for ${patient.name}?`;
            case "doneAndHold": return `Are you sure you want to mark as done and hold for ${patient.name}?`;
            case "callNext": return `Are you sure you want to call the next patient after ${patient.name}?`;
            case "continue": return `Are you sure you want to continue the token for ${patient.name}?`;
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
                    <span className="text-gray-500 text-sm font-medium">#{patient.orderNumber}</span>
                </div>
                 <span
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                            patient.status === "In-Progress"
                                ? "bg-green-100 text-green-600"
                                : patient.status === "On-Hold"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {patient.status}
                    </span>
                <h2 className="text-lg font-bold text-gray-800 mt-1">{patient.name}</h2>
                <p className="text-gray-500 text-sm mb-2">{patient.contact}</p>
                <div className="flex justify-between items-center mt-4">
                    <div><p className="text-gray-500 text-xs">In-Time</p><p className="text-gray-800 text-sm font-semibold">{patient.inTime}</p></div>
                    <div><p className="text-gray-500 text-xs">Scan</p><p className="text-gray-800 text-sm font-semibold">{patient.scan || "N/A"}</p></div>
                    <div><p className="text-gray-500 text-xs">Scan Type</p><p className="text-gray-800 text-sm font-semibold">{patient.scanType || "N/A"}</p></div>
                </div>
                {patient.status === "In-Progress" && (
                    <div className="flex justify-between mt-4 space-x-2">
                        <button onClick={() => handleAction("doneAndHold")} className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg py-2 px-2 text-sm font-medium transition-colors border border-blue-100"><FiCheckCircle /> <span>Done & Hold</span></button>
                        <button onClick={() => handleAction("callNext")} className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg py-2 px-2 text-sm font-medium transition-colors border border-green-100"><FiChevronsRight /> <span>Call Next</span></button>
                    </div>
                )}
                {patient.status === "On-Hold" && (
                    <div className="mt-4"><button onClick={() => handleAction("continue")} className="w-full flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg py-2 px-4 text-sm font-medium transition-colors border border-blue-100"><FiPlayCircle /> <span>Continue</span></button></div>
                )}
                {patient.status === "Waiting" && (
                    <div className="flex justify-end mt-4"><button onClick={() => handleAction("close")} className="flex items-center justify-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 px-3 text-sm font-medium transition-colors border border-red-100"><FiXCircle /> <span>Close</span></button></div>
                )}
            </div>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} message={getActionMessage()} color={getActionColor()} />
        </>
    );
}

// --- Queue Dashboard Component ---
function QueueDashboard({ selectedEquipment, allPatients, setAllPatients, history, setHistory, currentStep, setCurrentStep, onBackToSelection }) {
    const [filter, setFilter] = useState("All");
    const [animationDirection, setAnimationDirection] = useState("");

    // This function processes the master patient list and applies status rules.
    // Rule: One "In-Progress" patient at the head of each equipment's queue, unless "On-Hold".
    const processAndCommitPatientList = (updatedList) => {
        let newMasterList = updatedList.map(p => ({ ...p }));

        const patientsByEquipment = {};
        newMasterList.forEach(p => {
            if (!patientsByEquipment[p.equipment]) {
                patientsByEquipment[p.equipment] = [];
            }
            patientsByEquipment[p.equipment].push(p);
        });

        for (const eq in patientsByEquipment) {
            const queue = patientsByEquipment[eq];
            let inProgressSet = false;
            queue.forEach((patient, idx) => {
                if (idx === 0 && patient.status !== "On-Hold") {
                    patient.status = "In-Progress";
                    inProgressSet = true;
                } else if (patient.status !== "On-Hold") {
                    patient.status = "Waiting";
                }
                // "On-Hold" status is preserved
            });
        }
        
        // Reconstruct the master list from the processed equipment queues,
        // maintaining the original relative order of patients as much as possible.
        const finalProcessedList = [];
        const tempMasterCopy = updatedList.map(p => p.id); // Get IDs in original order

        tempMasterCopy.forEach(id => {
            for (const eq in patientsByEquipment) {
                const patientInEq = patientsByEquipment[eq].find(p => p.id === id);
                if (patientInEq) {
                    finalProcessedList.push(patientInEq);
                    // Remove from patientsByEquipment to avoid duplicates if logic is flawed
                    patientsByEquipment[eq] = patientsByEquipment[eq].filter(p => p.id !== id);
                    break;
                }
            }
        });


        setAllPatients(finalProcessedList);
        // Update only selected equipment's history/step
        const eq = selectedEquipment;
        const eqQueue = finalProcessedList.filter(p => p.equipment === eq);
        const newHistory = { ...history };
        const newStep = { ...currentStep };
        newHistory[eq] = (history[eq] || []).slice(0, (currentStep[eq] ?? 0) + 1);
        newHistory[eq].push(eqQueue);
        newStep[eq] = newHistory[eq].length - 1;
        setHistory(newHistory);
        setCurrentStep(newStep);
    };
    
    // Derived state for displayed patients based on selected equipment
    const displayedPatients = useMemo(() => {
        return allPatients.filter(p => p.equipment === selectedEquipment);
    }, [allPatients, selectedEquipment]);

    // Calculate counts for each status
    const statusCounts = useMemo(() => {
        const counts = {
            "All": displayedPatients.length,
            "In-Progress": 0,
            "On-Hold": 0,
            "Waiting": 0
        };

        displayedPatients.forEach(patient => {
            if (patient.status === "In-Progress") counts["In-Progress"]++;
            else if (patient.status === "On-Hold") counts["On-Hold"]++;
            else if (patient.status === "Waiting") counts["Waiting"]++;
        });

        return counts;
    }, [displayedPatients]);

    const moveTile = (fromDisplayedIndex, toDisplayedIndex) => {
        const currentEqQueue = [...allPatients.filter(p => p.equipment === selectedEquipment)];
        const [movedItem] = currentEqQueue.splice(fromDisplayedIndex, 1);
        currentEqQueue.splice(toDisplayedIndex, 0, movedItem);

        // Reconstruct allPatients
        const updatedAllPatients = allPatients.map(p => {
            if (p.equipment === selectedEquipment) return undefined; // Placeholder
            return p;
        }).filter(Boolean); // Remove placeholders

        let currentEqQueueIdx = 0;
        const finalNewAllPatients = [];
        // This reconstruction needs to be careful to maintain original order of other equipment patients
        
        // A simpler way: create a new list by iterating original allPatients
        // If patient belongs to selectedEquipment, take from reordered currentEqQueue
        // Otherwise, take from original allPatients
        const masterCopy = [...allPatients]; // Operate on a copy
        const patientsFromOtherEquipments = masterCopy.filter(p => p.equipment !== selectedEquipment);
        
        // Rebuild the list ensuring order
        const newFullList = [];
        let otherEqIdx = 0;
        let currentEqIdx = 0;

        // This is tricky; easier to update the master list by replacing its segment
        const newMasterList = masterCopy.filter(p => p.equipment !== selectedEquipment);
        newMasterList.splice(0,0, ...currentEqQueue); // This just adds to start. Not right.

        // Correct approach for moveTile:
        let masterListCopy = [...allPatients];
        const itemsOfSelectedEquipment = masterListCopy.filter(p => p.equipment === selectedEquipment);
        const otherItems = masterListCopy.filter(p => p.equipment !== selectedEquipment);

        const [movedPatientObj] = itemsOfSelectedEquipment.splice(fromDisplayedIndex, 1);
        itemsOfSelectedEquipment.splice(toDisplayedIndex, 0, movedPatientObj);
        
        // Reconstruct masterListCopy carefully based on original positions of otherItems
        let finalReorderedMasterList = [];
        let itemsOfSelectedEquipmentPtr = 0;
        let otherItemsPtr = 0;

        allPatients.forEach(originalPatient => {
            if (originalPatient.equipment === selectedEquipment) {
                if (itemsOfSelectedEquipment[itemsOfSelectedEquipmentPtr]) {
                     finalReorderedMasterList.push(itemsOfSelectedEquipment[itemsOfSelectedEquipmentPtr++]);
                }
            } else {
                 if (otherItems[otherItemsPtr]) {
                    finalReorderedMasterList.push(otherItems[otherItemsPtr++]);
                 }
            }
        });
        // Ensure all items are added if lengths differ (should not happen if logic is correct)
         while(itemsOfSelectedEquipmentPtr < itemsOfSelectedEquipment.length) {
            finalReorderedMasterList.push(itemsOfSelectedEquipment[itemsOfSelectedEquipmentPtr++]);
        }
        while(otherItemsPtr < otherItems.length) {
            finalReorderedMasterList.push(otherItems[otherItemsPtr++]);
        }

        processAndCommitPatientList(finalReorderedMasterList);
    };

    const modifyPatientList = (action) => {
        let updatedAllPatients = [...allPatients];
        action(updatedAllPatients); // The action should modify updatedAllPatients in place or return new
        processAndCommitPatientList(updatedAllPatients);
    };
    
    const findPatientAndPerform = (displayedIndex, operation) => {
        const patientIdToActOn = displayedPatients[displayedIndex].id;
        let newAllPatients = [...allPatients];
        const patientGlobalIndex = newAllPatients.findIndex(p => p.id === patientIdToActOn);

        if (patientGlobalIndex !== -1) {
            operation(newAllPatients, patientGlobalIndex, patientIdToActOn);
        }
        processAndCommitPatientList(newAllPatients);
    };

    const closeToken = (displayedIndex) => {
        findPatientAndPerform(displayedIndex, (list, globalIdx, patientId) => {
            list.splice(globalIdx, 1);
        });
    };

    const completeToken = (displayedIndex) => { // Same as close for now
        findPatientAndPerform(displayedIndex, (list, globalIdx, patientId) => {
            list.splice(globalIdx, 1);
        });
    };

    const doneAndHold = (displayedIndex) => {
        findPatientAndPerform(displayedIndex, (list, globalIdx, patientId) => {
            list.splice(globalIdx, 1); // Remove completed
            // Find next for selectedEquipment and set to On-Hold
            const currentEqQueue = list.filter(p => p.equipment === selectedEquipment);
            if (currentEqQueue.length > 0) {
                 const nextPatientInQueueId = currentEqQueue[0].id;
                 const nextPatientGlobalIndex = list.findIndex(p => p.id === nextPatientInQueueId);
                 if (nextPatientGlobalIndex !== -1) list[nextPatientGlobalIndex].status = "On-Hold";
            }
        });
    };
    
    const callNext = (displayedIndex) => {
         findPatientAndPerform(displayedIndex, (list, globalIdx, patientId) => {
            list.splice(globalIdx, 1); // Remove completed, status update will handle next In-Progress
        });
    };

    const continueToken = (displayedIndex) => {
         findPatientAndPerform(displayedIndex, (list, globalIdx, patientId) => {
            list[globalIdx].status = "In-Progress"; // Will be finalized by processAndCommit
        });
    };

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
        const newAllPatients = allPatients.map(p =>
            p.equipment === selectedEquipment ? null : p
        ).filter(Boolean);
        const eqQueue = history[selectedEquipment][newStep[selectedEquipment]];
        setAllPatients([
            ...newAllPatients,
            ...(eqQueue || [])
        ]);
    };

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
        const newAllPatients = allPatients.map(p =>
            p.equipment === selectedEquipment ? null : p
        ).filter(Boolean);
        const eqQueue = history[selectedEquipment][newStep[selectedEquipment]];
        setAllPatients([
            ...newAllPatients,
            ...(eqQueue || [])
        ]);
    };

    const handleFilterChange = (status) => {
        const currentIndex = statuses.indexOf(filter);
        const newIndex = statuses.indexOf(status);
        if (newIndex > currentIndex) setAnimationDirection("slide-in-right");
        else if (newIndex < currentIndex) setAnimationDirection("slide-in-left");
        setFilter(status);
    };

    const patientsForDisplayGrid = useMemo(() => {
        return displayedPatients.filter(patient => filter === "All" || patient.status === filter);
    }, [displayedPatients, filter]);

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
                    <div className="flex space-x-2">
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
                    {patientsForDisplayGrid.map((patient, index) => (
                        <DraggableTile
                            key={patient.id}
                            patient={patient}
                            displayedPatIndex={index} // This is the index within patientsForDisplayGrid
                            moveTile={moveTile}
                            closeToken={closeToken}
                            completeToken={completeToken}
                            doneAndHold={doneAndHold}
                            callNext={callNext}
                            continueToken={continueToken}
                        />
                    ))}
                </div>
                <style jsx>{`@keyframes slide-in-left {from {transform: translateX(-100%);} to {transform: translateX(0);}} @keyframes slide-in-right {from {transform: translateX(100%);} to {transform: translateX(0);}} .animate-slide-in-left {animation: slide-in-left 0.5s ease-out forwards;} .animate-slide-in-right {animation: slide-in-right 0.5s ease-out forwards;}`}</style>
            </div>
        </DndProvider>
    );
}

// --- Equipment Selection Page ---
function EquipmentSelectionPage({ onSelectEquipment }) {
    // Map equipment to label
    const equipmentLabels = {
        "CT-1": "CT-1",
        "USG-1": "USG-1",
        "USG-2": "USG-2",
        "X-Ray-1": "X-Ray-1",
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6 text-gray-900">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-extrabold mb-4 tracking-tight text-blue-800">Client Queue System</h1>
                <p className="text-lg text-gray-700">Select an equipment queue to manage</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {EQUIPMENT_LIST.map((eq) => (
                    <button
                        key={eq}
                        onClick={() => onSelectEquipment(eq)}
                        className="relative group bg-white border border-gray-300 hover:border-blue-500 focus:border-blue-600 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:scale-105 focus:outline-none transform flex items-center justify-center p-8"
                    >
                        <span className="text-3xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">
                            {equipmentLabels[eq]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}


// --- Main Application Component ---
export default function QueueSystem() {
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [allPatients, setAllPatients] = useState([]);
    // Refactor: history and currentStep are now objects keyed by equipment
    const [history, setHistory] = useState({});
    const [currentStep, setCurrentStep] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

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

    // Function to apply status rules (one "In-Progress" per equipment queue head)
    const applyInitialStatusRules = (patientsList) => {
        let newMasterList = patientsList.map(p => ({ ...p }));
        const patientsByEquipment = {};
        newMasterList.forEach(p => {
            if (!patientsByEquipment[p.equipment]) {
                patientsByEquipment[p.equipment] = [];
            }
            patientsByEquipment[p.equipment].push(p);
        });

        for (const eq in patientsByEquipment) {
            const queue = patientsByEquipment[eq];
            let inProgressSet = false;
            queue.forEach((patient, idx) => {
                if (idx === 0 && patient.status !== "On-Hold") {
                    patient.status = "In-Progress";
                    inProgressSet = true;
                } else if (patient.status !== "On-Hold") {
                    patient.status = "Waiting";
                }
            });
        }
        return Object.values(patientsByEquipment).flat().sort((a,b) => patientsList.indexOf(a) - patientsList.indexOf(b)); // Re-flatten and attempt to restore original sort
    };

    // Load initial data and set initial statuses
    useEffect(() => {
        const savedPatients = localStorage.getItem("allPatientsGlobal");
        let loadedPatients = initialPatientsMaster;
        if (savedPatients) {
            loadedPatients = JSON.parse(savedPatients);
        }
        const initialProcessedPatients = applyInitialStatusRules(loadedPatients);
        setAllPatients(initialProcessedPatients);

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
                initialHistory[eq] = [initialProcessedPatients.filter(p => p.equipment === eq)];
                initialStep[eq] = 0;
            });
            setHistory(initialHistory);
            setCurrentStep(initialStep);
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever allPatients, history, or currentStep changes
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("allPatientsGlobal", JSON.stringify(allPatients));
        localStorage.setItem("historyGlobal", JSON.stringify(history));
        localStorage.setItem("currentStepGlobal", JSON.stringify(currentStep));
    }, [allPatients, history, currentStep, isInitialized]);

    if (!isInitialized) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl">Loading Dashboard...</p></div>;
    }

    if (!selectedEquipment) {
        return <EquipmentSelectionPage onSelectEquipment={setSelectedEquipment} />;
    }

    return (
        <QueueDashboard
            selectedEquipment={selectedEquipment}
            allPatients={allPatients}
            setAllPatients={setAllPatients}
            history={history}
            setHistory={setHistory}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onBackToSelection={() => setSelectedEquipment(null)}
        />
    );
}