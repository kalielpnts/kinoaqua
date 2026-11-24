export default function Field({ id, label, icon: Icon, right = null, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-aqua-400/80"
        />
        <input id={id} className={`input-field ${right ? 'pr-12' : ''}`} {...props} />
        {right}
      </div>
    </div>
  );
}
