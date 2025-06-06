'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="border rounded">
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100">
        <span className="font-medium">Job Description (Markdown Supported)</span>
        <button
          type="button"
          className="text-sm text-blue-500 hover:underline"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Edit Markdown' : 'Preview'}
        </button>
      </div>
      {showPreview ? (
        <div className="p-4 prose prose-sm max-w-none">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full p-4 h-60 resize-y border-0 rounded-b outline-none"
          placeholder="Write job description here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
