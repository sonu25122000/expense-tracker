export default function ChipSelector({ options, value, onChange, getLabel, getKey, wrap = false }) {
  const label = getLabel || ((o) => (typeof o === 'string' ? o : o.label));
  const key = getKey || ((o) => (typeof o === 'string' ? o : o.value));

  return (
    <div className={wrap ? 'chip-wrap' : 'chip-row'}>
      {options.map((option) => {
        const active = key(option) === value;
        return (
          <button
            key={key(option)}
            type="button"
            className={`chip${active ? ' active' : ''}`}
            onClick={() => onChange(key(option))}
          >
            {label(option)}
          </button>
        );
      })}
    </div>
  );
}
