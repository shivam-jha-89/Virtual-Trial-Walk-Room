import React, { useEffect, useState } from 'react';
import { getGarments } from '../services/api';
import { useAppContext } from '../context/AppContext';

const GARMENT_TYPES = [
  'all',
  't-shirt',
  'hoodie',
  'jacket',
  'dress',
  'trousers',
  'skirt',
  'jeans',
  'jumpsuit',
  'coat',
  'shorts',
];

export default function GarmentSelector() {
  const { selectedGarment, setSelectedGarment } = useAppContext();
  const [garments, setGarments] = useState([]);
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);

    getGarments({ type: type === 'all' ? undefined : type, page, limit: 12 })
      .then((res) => {
        if (cancelled) return;
        setGarments(res.data.items);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => !cancelled && setErrorMsg('Could not load garments. Is the API running?'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [type, page]);

  return (
    <div className="garment-selector">
      <div className="garment-selector__filters">
        {GARMENT_TYPES.map((t) => (
          <button
            key={t}
            className={t === type ? 'active' : ''}
            onClick={() => {
              setType(t);
              setPage(1);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p>Loading garments…</p>}
      {errorMsg && <p className="garment-selector__error">{errorMsg}</p>}

      <div className="garment-selector__grid">
        {garments.map((g) => (
          <button
            key={g._id}
            className={`garment-card ${selectedGarment?._id === g._id ? 'selected' : ''}`}
            onClick={() => setSelectedGarment(g)}
          >
            <img src={g.thumbnailUrl} alt={g.name} loading="lazy" />
            <span className="garment-card__name">{g.name}</span>
            <span className="garment-card__price">${g.price.toFixed(2)}</span>
          </button>
        ))}
      </div>

      <div className="garment-selector__pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages || 1}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
