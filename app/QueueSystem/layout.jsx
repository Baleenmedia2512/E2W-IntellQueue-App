export default function QueueSystemLayout({ children }) {
    return (
        <div>
            {/* Exclude the bottom bar */}
            {children}
        </div>
    );
}

// Note: Ensure this layout is applied to all routes under /QueueSystem.
