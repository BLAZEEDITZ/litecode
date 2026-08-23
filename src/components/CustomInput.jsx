import React from "react";

const CustomInput = ({ customInput, setCustomInput }) => {
    return (
        <div className="custom-input-wrapper">
            <label className="custom-input-label">stdin</label>
            <textarea
                rows="3"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Custom input (stdin)..."
                className="custom-input-textarea"
            />
        </div>
    );
};

export default CustomInput;
