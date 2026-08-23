export const customStyles = {
    control: (styles, { isFocused }) => ({
        ...styles,
        width: '100%',
        maxWidth: '14rem',
        minWidth: '11rem',
        borderRadius: '7px',
        fontSize: '0.8rem',
        lineHeight: '1.75rem',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        border: 'none',
        boxShadow: 'none',
        color: '#c7d2fe',
        ':hover': {
            boxShadow: 'none',
        },
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#c7d2fe',
        fontSize: '0.8rem',
    }),
    input: (styles) => ({
        ...styles,
        color: '#e2e8f0',
        fontSize: '0.8rem',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        color: isSelected ? '#fff' : '#1e293b',
        fontSize: '0.8rem',
        lineHeight: '1.6rem',
        width: '100%',
        background: isSelected
            ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
            : isFocused
            ? 'rgba(99, 102, 241, 0.08)'
            : '#fff',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        paddingLeft: '0.85rem',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#fff',
        maxWidth: '14rem',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '8px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.15)',
        overflow: 'hidden',
        zIndex: 9999,
    }),
    menuList: (styles) => ({
        ...styles,
        padding: '4px',
        maxHeight: '240px',
    }),
    placeholder: (defaultStyles) => ({
        ...defaultStyles,
        color: '#64748b',
        fontSize: '0.8rem',
        lineHeight: '1.75rem',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#475569',
        padding: '0 6px',
        ':hover': { color: '#818cf8' },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    clearIndicator: (styles) => ({
        ...styles,
        color: '#475569',
        ':hover': { color: '#f87171' },
    }),
};
