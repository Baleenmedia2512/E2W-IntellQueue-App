"use client"
import React from "react";
import PropTypes from "prop-types";

const CustomButton = ({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  iconPosition = "left",
  icon = null,
}) => {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e); // Invoke the onClick handler passed as a prop
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center px-4 py-2 rounded-md shadow-md transition duration-200 ${
        disabled
          ? "bg-gray-400 text-gray-800 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      } ${className}`}
      aria-disabled={disabled}
    >
      {icon && iconPosition === "left" && (
        <span className="mr-2 text-lg">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="ml-2 text-lg">{icon}</span>
      )}
    </button>
  );
};

// PropTypes to ensure proper usage of the button
CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired, // Make onClick required to avoid unexpected behavior
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  icon: PropTypes.node,
};

export default CustomButton;
