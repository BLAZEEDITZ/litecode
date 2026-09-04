import React from "react";
import Select from "react-select";
import { customStyles } from "../constants/customStyles";
import { languageOptions } from "../constants/languageOptions";

const comingSoonOption = {
    id: 9999,
    name: "Coming Soon",
    label: "Coming Soon \u2728",
    value: "__coming_soon__",
};

const allOptions = [comingSoonOption, ...languageOptions];

const LanguagesDropdown = ({ onSelectChange, Userlanguage, onComingSoonClick }) => {

    const handleChange = (selectedOption) => {
        if (selectedOption.value === "__coming_soon__") {
            if (onComingSoonClick) onComingSoonClick();
            return;
        }
        onSelectChange(selectedOption);
    };

    return (
        <Select
            placeholder={`Filter By Category`}
            options={allOptions}
            styles={customStyles}
            defaultValue={Userlanguage}
            onChange={handleChange}
            value={Userlanguage}
        />
    );
};

export default LanguagesDropdown;