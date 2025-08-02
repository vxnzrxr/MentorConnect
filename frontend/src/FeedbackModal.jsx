import React, { useState } from 'react';

function FeedbackModal({ open, onClose, onSubmit, session }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Feedback untuk {session.topic}</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(num => (
              <button
                key={num}
                type="button"
                className={`text-2xl ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(num)}
              >★</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Feedback</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Tulis feedback Anda..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Batal</button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              onSubmit({ rating, comment: text });
              setRating(0); setText('');
            }}
            disabled={rating === 0 || text.trim() === ''}
          >Kirim</button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
