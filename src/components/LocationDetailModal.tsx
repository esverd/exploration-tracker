import { useState } from 'react';
import type { LocationConfig, LocationVisitData } from '../types';

interface Props {
  location: LocationConfig;
  data: LocationVisitData | null;
  onSave: (details: Partial<LocationVisitData>) => void;
  onClose: () => void;
}

export function LocationDetailModal({ location, data, onSave, onClose }: Props) {
  const [visitCount, setVisitCount] = useState<number>(data?.visitCount ?? 1);
  const [visitDates, setVisitDates] = useState<string[]>(
    data?.visitDates ?? []
  );
  const [notes, setNotes] = useState<string>(data?.notes ?? '');

  const handleAddDate = () => {
    setVisitDates([...visitDates, '']);
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...visitDates];
    newDates[index] = value;
    setVisitDates(newDates);
  };

  const handleRemoveDate = (index: number) => {
    setVisitDates(visitDates.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const filteredDates = visitDates.filter((d) => d.length > 0);
    onSave({
      visitCount: visitCount > 0 ? visitCount : undefined,
      visitDates: filteredDates.length > 0 ? filteredDates : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{location.name}</h2>
          <button className="modal-close" onClick={onClose}>
            {'\u00D7'}
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Number of visits</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={visitCount}
              onChange={(e) => setVisitCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Visit dates</label>
            <div className="date-list">
              {visitDates.map((date, index) => (
                <div key={index} className="date-item">
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                  />
                  <button
                    className="date-remove-btn"
                    onClick={() => handleRemoveDate(index)}
                    title="Remove date"
                  >
                    {'\u00D7'}
                  </button>
                </div>
              ))}
              <button className="add-date-btn" onClick={handleAddDate}>
                + Add a date
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add any notes about your visit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
