import { iconForCategory } from '../theme';

export default function CategoryGrid({ categories, value, onChange }) {
  return (
    <div className="category-grid">
      {categories.map((cat) => {
        const active = cat.name === value;
        return (
          <button
            key={cat._id || cat.name}
            type="button"
            className={`category-chip${active ? ' active' : ''}`}
            onClick={() => onChange(cat.name)}
          >
            <span>{iconForCategory(cat.name)}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
