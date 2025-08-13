// BaseNode.js
// Abstract base component for all nodes with dynamic sizing

import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const BaseNode = ({ 
  id, 
  data, 
  title,
  fields = [],
  handles = [],
  className = '',
  style = {},
  children,
  onFieldChange
}) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const cloneNode = useStore((state) => state.cloneNode);
  
  const [dimensions, setDimensions] = useState({ width: 200, height: 80 });
  const [isSelected, setIsSelected] = useState(false);
  const nodeRef = useRef(null);
  const contentRef = useRef(null);

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    cloneNode(id);
  };

  // State management for fields
  const [fieldValues, setFieldValues] = useState({});

  // Initialize field values from data or defaults
  useEffect(() => {
    const initialValues = {};
    fields.forEach(field => {
      initialValues[field.name] = data?.[field.name] || field.defaultValue || '';
    });
    setFieldValues(initialValues);
  }, [fields, data]);

  // Dynamic sizing based on content
  const calculateDimensions = useCallback(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    const inputs = content.querySelectorAll('input, textarea, select');
    
    let maxWidth = 200;
    let totalHeight = 60; // Base height for title and padding

    // Calculate width based on content
    inputs.forEach(input => {
      if (input.type === 'text' || input.tagName === 'TEXTAREA') {
        const textLength = input.value.length;
        const estimatedWidth = Math.max(150, Math.min(400, textLength * 8 + 40));
        maxWidth = Math.max(maxWidth, estimatedWidth);
      }
    });

    // Calculate height based on fields and content
    totalHeight += fields.length * 50; // Each field takes ~50px
    
    // Special handling for textareas
    inputs.forEach(input => {
      if (input.tagName === 'TEXTAREA') {
        const lines = (input.value.match(/\n/g) || []).length + 1;
        totalHeight += Math.max(0, (lines - 1) * 20); // Additional height for extra lines
      }
    });

    setDimensions({ 
      width: maxWidth, 
      height: Math.max(80, totalHeight) 
    });
  }, [fields.length]);

  // Recalculate dimensions when field values change
  useEffect(() => {
    calculateDimensions();
  }, [fieldValues, calculateDimensions]);

  // Handle field changes with dynamic sizing
  const handleFieldChange = (fieldName, value) => {
    const newValues = { ...fieldValues, [fieldName]: value };
    setFieldValues(newValues);
    
    // Call external change handler if provided
    if (onFieldChange) {
      onFieldChange(fieldName, value);
    }

    // Trigger resize calculation
    setTimeout(calculateDimensions, 0);
  };
  // Clean minimal styling
  const defaultStyle = {
    minWidth: 200,
    minHeight: 80,
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--border-radius)',
    backgroundColor: 'var(--color-white)',
    padding: '16px',
    boxShadow: 'var(--shadow-sm)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    position: 'relative',
    transition: 'var(--transition)',
    ...style
  };

  const titleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    marginBottom: '12px',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const nodeActionsStyle = {
    display: 'flex',
    gap: '4px',
    opacity: 0.7
  };

  const actionButtonStyle = {
    width: '18px',
    height: '18px',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)'
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#fca5a5',
    color: '#dc2626'
  };

  const duplicateButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#c7d2fe',
    color: 'var(--color-primary)'
  };

  const fieldContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--color-gray-600)',
    marginBottom: '4px',
    display: 'block'
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'calc(var(--border-radius) / 2)',
    fontSize: '13px',
    backgroundColor: 'var(--color-white)',
    transition: 'var(--transition)',
    color: 'var(--color-gray-700)',
    width: '100%'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 8px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px 16px',
    paddingRight: '32px'
  };



  // Render input field based on type
  const renderField = (field) => {
    const { name, type, label, options = [], placeholder = '' } = field;
    const value = fieldValues[name] || '';

    switch (type) {
      case 'select':
        return (
          <div key={name}>
            <label style={labelStyle}>{label}</label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              style={selectStyle}
              className="focus-ring"
            >
              {options.map(option => (
                <option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={name}>
            <label style={labelStyle}>{label}</label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              style={{
                ...inputStyle,
                minHeight: '60px',
                resize: 'none',
                fontFamily: 'inherit',
                overflow: 'hidden'
              }}
              className="focus-ring"
              rows={Math.max(2, (value.match(/\n/g) || []).length + 1)}
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={name}>
            <label style={labelStyle}>{label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
              className="focus-ring"
            />
          </div>
        );
      
      default: // text input
        return (
          <div key={name}>
            <label style={labelStyle}>{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
              className="focus-ring"
            />
          </div>
        );
    }
  };

  // Render handles
  const renderHandles = () => {
    return handles.map((handle, index) => {
      const handleId = handle.id || `${id}-${handle.type}-${index}`;
      return (
        <Handle
          key={handleId}
          type={handle.type} // 'source' or 'target'
          position={handle.position}
          id={handleId}
          style={handle.style || {}}
        />
      );
    });
  };

  return (
    <div 
      ref={nodeRef}
      className={`base-node ${className}`}
      style={{
        ...defaultStyle,
        width: dimensions.width,
        height: dimensions.height,
        ...(isSelected && { 
          borderColor: 'var(--color-primary)', 
          boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)' 
        })
      }}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    >
      {renderHandles()}
      
      {title && (
        <div style={titleStyle}>
          <span>{title}</span>
          <div style={nodeActionsStyle}>
            <button
              style={duplicateButtonStyle}
              onClick={handleDuplicate}
              title="Duplicate node"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.backgroundColor = '#a5b4fc';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#c7d2fe';
              }}
            >
              ⧉
            </button>
            <button
              style={deleteButtonStyle}
              onClick={handleDelete}
              title="Delete node"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.backgroundColor = '#f87171';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#fca5a5';
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div ref={contentRef} style={fieldContainerStyle}>
        {fields.map(renderField)}
        {children}
      </div>
    </div>
  );
};
