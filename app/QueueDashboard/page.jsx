"use client";
import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaUndo, FaRedo } from "react-icons/fa";

const ItemType = "PATIENT";

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-96 text-center">
                <p className="text-gray-800 text-lg font-medium mb-6">
                    {message}
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

function DraggableTile({ patient, index, moveTile, closeToken, completeToken, doneAndHold, callNext, continueToken }) {
    const [{ isDragging }, ref] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveTile(draggedItem.index, index);
                draggedItem.index = index;
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
        if (actionType === "complete") {
            completeToken(index);
        } else if (actionType === "close") {
            closeToken(index);
        } else if (actionType === "doneAndHold") {
            doneAndHold(index);
        } else if (actionType === "callNext") {
            callNext(index);
        } else if (actionType === "continue") {
            continueToken(index);
        }
    };

    const getActionMessage = () => {
        switch (actionType) {
            case "complete":
                return `Are you sure you want to complete the token for ${patient.name}?`;
            case "close":
                return `Are you sure you want to close the token for ${patient.name}?`;
            case "doneAndHold":
                return `Are you sure you want to mark as done and hold the next token for ${patient.name}?`;
            case "callNext":
                return `Are you sure you want to call the next patient?`;
            case "continue":
                return `Are you sure you want to continue the token for ${patient.name}?`;
            default:
                return "";
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
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm font-medium">#{patient.token}</span>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            patient.status === "In-Progress"
                                ? "bg-green-100 text-green-600"
                                : patient.status === "On-Hold"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {patient.status}
                    </span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">{patient.name}</h2>
                <p className="text-gray-500 text-sm mb-2">{patient.contact}</p>
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <p className="text-gray-500 text-xs">In-Time</p>
                        <p className="text-gray-800 text-sm font-semibold">{patient.inTime}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Scan</p>
                        <p className="text-gray-800 text-sm font-semibold">{patient.scan || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Scan Type</p>
                        <p className="text-gray-800 text-sm font-semibold">{patient.scanType || "N/A"}</p>
                    </div>
                </div>
                {patient.status === "In-Progress" && (
                    <div className="flex justify-between mt-4 space-x-2">
                        <button
                            onClick={() => handleAction("doneAndHold")}
                            className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg py-2 px-2 text-sm font-medium transition-colors border border-blue-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Done & Hold</span>
                        </button>
                        <button
                            onClick={() => handleAction("callNext")}
                            className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg py-2 px-2 text-sm font-medium transition-colors border border-green-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span>Call Next</span>
                        </button>
                    </div>
                )}
                {patient.status === "On-Hold" && (
                    <div className="mt-4">
                        <button
                            onClick={() => handleAction("continue")}
                            className="w-full flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg py-2 px-4 text-sm font-medium transition-colors border border-blue-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                            <span>Continue</span>
                        </button>
                    </div>
                )}
                {patient.status === "Waiting" && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => handleAction("close")}
                            className="flex items-center justify-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 px-3 text-sm font-medium transition-colors border border-red-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Close</span>
                        </button>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                message={getActionMessage()}
            />
        </>
    );
}

export default function QueueDashboard() {
    const initialPatients = [
        { id: "1", name: "Kumar", scanType: "Brain", scan: "CT", token: "7", inTime: "10:00 AM", contact: "9876543210", status: "In-Progress" },
        { id: "2", name: "Priya", scanType: "Pregnancy", scan: "USG", token: "3", inTime: "10:15 AM", contact: "9876543211", status: "Waiting" },
        { id: "3", name: "Vimal", scanType: "Abdomen and pelvis", scan: "CT", token: "82", inTime: "10:30 AM", contact: "9876543212", status: "Waiting" },
        { id: "4", name: "Raena", scanType: "Pregnancy anomaly", scan: "USG", token: "1", inTime: "10:45 AM", contact: "9876543213", status: "Waiting" },
        { id: "5", name: "Saranya", scanType: "Breast", scan: "X-Ray", token: "5", inTime: "11:00 AM", contact: "9876543214", status: "Waiting" },
        { id: "6", name: "Arjun", scanType: "LS Spine", scan: "X-Ray", token: "12", inTime: "11:15 AM", contact: "9876543215", status: "Waiting" },
        { id: "7", name: "Meera", scanType: "Fetal Echo", scan: "USG", token: "19", inTime: "11:30 AM", contact: "9876543216", status: "Waiting" },
        { id: "8", name: "Ravi", scanType: "Knee Joint", scan: "X-Ray", token: "23", inTime: "11:45 AM", contact: "9876543217", status: "Waiting" },
        { id: "9", name: "Anjali", scanType: "Pregnancy Face", scan: "USG", token: "34", inTime: "12:00 PM", contact: "9876543218", status: "Waiting" },
        { id: "10", name: "Suresh", scanType: "Thorax", scan: "CT", token: "45", inTime: "12:15 PM", contact: "9876543219", status: "Waiting" },
        { id: "11", name: "Divya", scanType: "Hysterosalphingogram", scan: "X-Ray", token: "56", inTime: "12:30 PM", contact: "9876543220", status: "Waiting" },
        { id: "12", name: "Karthik", scanType: "Venous (per limb)", scan: "USG", token: "67", inTime: "12:45 PM", contact: "9876543221", status: "Waiting" },
        { id: "13", name: "Lakshmi", scanType: "Paranasal Sinuses", scan: "CT", token: "78", inTime: "1:00 PM", contact: "9876543222", status: "Waiting" },
        { id: "14", name: "Manoj", scanType: "Review Scan", scan: "USG", token: "89", inTime: "1:15 PM", contact: "9876543213", status: "Waiting" },
        { id: "15", name: "Sneha", scanType: "Anomaly", scan: "USG", token: "90", inTime: "1:30 PM", contact: "9876543224", status: "Waiting" },
    ];

    const [patients, setPatients] = useState(() => {
        const savedPatients = localStorage.getItem("patients");
        return savedPatients ? JSON.parse(savedPatients) : initialPatients;
    });

    const [history, setHistory] = useState(() => {
        const savedHistory = localStorage.getItem("history");
        return savedHistory ? JSON.parse(savedHistory) : [initialPatients];
    });

    const [currentStep, setCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem("currentStep");
        return savedStep ? JSON.parse(savedStep) : 0;
    });

    const [filter, setFilter] = useState("All");
    const [animationDirection, setAnimationDirection] = useState("");

    useEffect(() => {
        localStorage.setItem("patients", JSON.stringify(patients));
        localStorage.setItem("history", JSON.stringify(history));
        localStorage.setItem("currentStep", JSON.stringify(currentStep));
    }, [patients, history, currentStep]);

    const moveTile = (fromIndex, toIndex) => {
        const updatedPatients = [...patients];
        const [movedPatient] = updatedPatients.splice(fromIndex, 1);
        updatedPatients.splice(toIndex, 0, movedPatient);

        updatedPatients.forEach((patient, index) => {
            if (index === 0) {
                patient.status = "In-Progress";
            } else if (patient.status !== "On-Hold") {
                patient.status = "Waiting";
            }
        });

        setPatients(updatedPatients);

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, updatedPatients]);
        setCurrentStep(newHistory.length);
    };

    const closeToken = (index) => {
        const updatedPatients = patients.filter((_, i) => i !== index);
        updatedPatients.forEach((patient, i) => {
            if (i === 0) {
                patient.status = "In-Progress";
            } else if (patient.status !== "On-Hold") {
                patient.status = "Waiting";
            }
        });
        setPatients(updatedPatients);

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, updatedPatients]);
        setCurrentStep(newHistory.length);
    };

    const completeToken = (index) => {
        const updatedPatients = patients.filter((_, i) => i !== index);
        updatedPatients.forEach((patient, i) => {
            if (i === 0) {
                patient.status = "In-Progress";
            } else if (patient.status !== "On-Hold") {
                patient.status = "Waiting";
            }
        });
        setPatients(updatedPatients);

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, updatedPatients]);
        setCurrentStep(newHistory.length);
    };

    const doneAndHold = (index) => {
        const updatedPatients = [...patients];
        // Remove the current in-progress patient
        updatedPatients.splice(index, 1);
        
        // Mark the next patient as On-Hold if exists
        if (updatedPatients.length > 0) {
            updatedPatients[0].status = "On-Hold";
        }
        
        setPatients(updatedPatients);

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, updatedPatients]);
        setCurrentStep(newHistory.length);
    };

    const callNext = (index) => {
        const updatedPatients = [...patients];
        // Remove the current in-progress patient
        updatedPatients.splice(index, 1);
        
        // Mark the next patient as In-Progress if exists
        if (updatedPatients.length > 0) {
            updatedPatients[0].status = "In-Progress";
        }
        
        setPatients(updatedPatients);

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, updatedPatients]);
        setCurrentStep(newHistory.length);
    };

    const continueToken = (index) => {
        const updatedPatients = [...patients];
        // Change the status of the on-hold patient to In-Progress
        updatedPatients[index].status = "In-Progress";
        
        setPatients(updatedPatients);

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, updatedPatients]);
        setCurrentStep(newHistory.length);
    };

    const undo = () => {
        if (currentStep > 0) {
            const previousPatients = history[currentStep - 1];
            previousPatients.forEach((patient, index) => {
                if (index === 0) {
                    patient.status = "In-Progress";
                } else if (patient.status !== "On-Hold") {
                    patient.status = "Waiting";
                }
            });
            setCurrentStep(currentStep - 1);
            setPatients(previousPatients);
        }
    };

    const redo = () => {
        if (currentStep < history.length - 1) {
            const nextPatients = history[currentStep + 1];
            nextPatients.forEach((patient, index) => {
                if (index === 0) {
                    patient.status = "In-Progress";
                } else if (patient.status !== "On-Hold") {
                    patient.status = "Waiting";
                }
            });
            setCurrentStep(currentStep + 1);
            setPatients(nextPatients);
        }
    };

    const handleFilterChange = (status) => {
        const currentIndex = statuses.indexOf(filter);
        const newIndex = statuses.indexOf(status);

        if (newIndex > currentIndex) {
            setAnimationDirection("slide-in-right");
        } else if (newIndex < currentIndex) {
            setAnimationDirection("slide-in-left");
        }

        setFilter(status);
    };

    const filteredPatients = patients.filter((patient) => {
        return filter === "All" || patient.status === filter;
    });

    const statuses = ["All", "In-Progress", "On-Hold", "Waiting"];

    const currentDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-blue-600">Queue Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={undo}
                            disabled={currentStep <= 0}
                            className={`w-10 h-10 rounded-full flex items-center justify-center group relative ${
                                currentStep > 0
                                    ? "bg-gray-200 hover:bg-gray-300"
                                    : "bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                            <FaUndo className={`text-gray-600 ${currentStep <= 0 ? "opacity-50" : ""}`} />
                            <span className="absolute top-full mt-2 hidden group-hover:flex items-center justify-center bg-gray-900 text-white text-xs font-medium rounded-lg px-2 py-1 shadow-lg">
                                Undo
                                <span className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                            </span>
                        </button>
                        <button
                            onClick={redo}
                            disabled={currentStep >= history.length - 1}
                            className={`w-10 h-10 rounded-full flex items-center justify-center group relative ${
                                currentStep < history.length - 1
                                    ? "bg-gray-200 hover:bg-gray-300"
                                    : "bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                            <FaRedo className={`text-gray-600 ${currentStep >= history.length - 1 ? "opacity-50" : ""}`} />
                            <span className="absolute top-full mt-2 hidden group-hover:flex items-center justify-center bg-gray-900 text-white text-xs font-medium rounded-lg px-2 py-1 shadow-lg">
                                Redo
                                <span className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                            </span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 sm:space-y-0 space-y-4 mb-6">
                    <div className="flex flex-wrap items-center border border-gray-300 rounded-xl p-2">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleFilterChange(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filter === status
                                        ? "bg-blue-600 text-white shadow"
                                        : "text-gray-600 hover:bg-blue-100"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <div
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-transform duration-500 ${
                        animationDirection === "slide-in-right"
                            ? "translate-x-full animate-slide-in-right"
                            : animationDirection === "slide-in-left"
                            ? "-translate-x-full animate-slide-in-left"
                            : ""
                    }`}
                    onAnimationEnd={() => setAnimationDirection("")}
                >
                    {filteredPatients.map((patient, index) => (
                        <DraggableTile
                            key={patient.id}
                            patient={patient}
                            index={index}
                            moveTile={moveTile}
                            closeToken={closeToken}
                            completeToken={completeToken}
                            doneAndHold={doneAndHold}
                            callNext={callNext}
                            continueToken={continueToken}
                        />
                    ))}
                </div>
                <style jsx>{`
                    @keyframes slide-in-left {
                        from {
                            transform: translateX(-100%);
                        }
                        to {
                            transform: translateX(0);
                        }
                    }
                    @keyframes slide-in-right {
                        from {
                            transform: translateX(100%);
                        }
                        to {
                            transform: translateX(0);
                        }
                    }
                    .animate-slide-in-left {
                        animation: slide-in-left 0.5s ease-out forwards;
                    }
                    .animate-slide-in-right {
                        animation: slide-in-right 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        </DndProvider>
    );
}