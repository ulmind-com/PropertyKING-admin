export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="card data-table">
      <table>
        <thead>
          <tr>{Array(cols).fill(0).map((_, i) => <th key={i}><div className="skeleton" style={{ width: 60 + Math.random() * 40, height: 12 }} /></th>)}</tr>
        </thead>
        <tbody>
          {Array(rows).fill(0).map((_, r) => (
            <tr key={r}>
              {Array(cols).fill(0).map((_, c) => (
                <td key={c}><div className="skeleton" style={{ width: 50 + Math.random() * 80, height: 14 }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCards({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="card" style={{ height: 100, opacity: 0.6 }}>
          <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '40%', height: 28 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array(lines).fill(0).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: `${70 + Math.random() * 30}%`, height: 14 }} />
      ))}
    </div>
  );
}
