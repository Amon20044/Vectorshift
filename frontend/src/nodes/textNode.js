// textNode.js - Simplified Text Node with fixed height issues

import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const TextNode = ({ id, data, selected }) => {
  const [text, setText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);
  const updateNodeField = useStore(state => state.updateNodeField);

  // Extract variables from text
  const extractVariables = useCallback((inputText) => {
    const variableRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const matches = [];
    let match;
    
    while ((match = variableRegex.exec(inputText)) !== null) {
      const variableName = match[1].trim();
      if (!matches.find(v => v.name === variableName)) {
        matches.push({
          name: variableName,
          id: `${id}-${variableName}`
        });
      }
    }
    
    return matches;
  }, [id]);

  // Update variables when text changes
  useEffect(() => {
    const newVariables = extractVariables(text);
    setVariables(newVariables);
  }, [text, extractVariables]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(60, textarea.scrollHeight) + 'px';
    }
  }, [text]);

  // Handle text changes
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    updateNodeField(id, 'text', newText);
  }, [id, updateNodeField]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      textareaRef.current?.blur();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newText = text.substring(0, start) + '{{input}}' + text.substring(end);
      setText(newText);
      updateNodeField(id, 'text', newText);
      
      setTimeout(() => {
        const newPos = start + 9;
        e.target.setSelectionRange(newPos, newPos);
      }, 0);
    }
  }, [text, id, updateNodeField]);

  const handleFocus = () => setIsEditing(true);
  const handleBlur = () => setIsEditing(false);

  return (
    <div style={{
      width: 280,
      minHeight: 140,
      border: `1px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
      borderLeft: '4px solid #3b82f6',
      borderRadius: '8px',
      backgroundColor: 'white',
      padding: '16px',
      boxShadow: selected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      {/* Input handles for variables */}
      {variables.map((variable, index) => (
        <Handle
          key={variable.id}
          type="target"
          position={Position.Left}
          id={variable.id}
          style={{
            top: `${50 + (index * 24)}px`,
            backgroundColor: '#3b82f6',
            border: '2px solid white',
            width: '12px',
            height: '12px'
          }}
          title={`Input for variable: ${variable.name}`}
        />
      ))}
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          width: '12px',
          height: '12px'
        }}
        title="Text output"
      />
      
      {/* Title */}
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#3b82f6',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Text Node {variables.length > 0 && `(${variables.length} vars)`}
      </div>
      
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter text with variables like {{variableName}}&#10;Press Tab to insert {{input}}"
        style={{
          width: '100%',
          minHeight: '60px',
          height: 'auto',
          padding: '12px',
          border: `1px solid ${isEditing ? '#3b82f6' : '#e5e7eb'}`,
          borderRadius: '6px',
          fontSize: '13px',
          fontFamily: 'Monaco, monospace',
          backgroundColor: isEditing ? '#f9fafb' : 'white',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.5',
          color: '#374151',
          overflow: 'hidden'
        }}
        spellCheck={false}
        rows={1}
      />
      
      {/* Variables display */}
      {variables.length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            marginBottom: '6px',
            fontWeight: '500'
          }}>
            Variables:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {variables.map((variable) => (
              <span
                key={variable.name}
                style={{
                  fontSize: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}
              >
                {variable.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};