// textNode.js - Text Node 

import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const TextNode = ({ id, data, selected }) => {
  const [text, setText] = useState(data?.text || 'Hello {{input1}}, welcome to {{input2}}!');
  const [variables, setVariables] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDataTypes, setShowDataTypes] = useState(false);
  const textareaRef = useRef(null);
  const updateNodeField = useStore(state => state.updateNodeField);

  // Data type definitions for sophisticated variable handling
  const dataTypes = {
    string: { color: '#10b981', icon: 'Abc' },
    number: { color: '#f59e0b', icon: '123' },
    boolean: { color: '#8b5cf6', icon: 'T/F' },
    array: { color: '#3b82f6', icon: '[]' },
    object: { color: '#ef4444', icon: '{}' },
    datetime: { color: '#06b6d4', icon: '📅' },
    any: { color: '#6b7280', icon: '?' }
  };

  // Extract variables with sophisticated parsing (improved for multiple inputs)
  const extractVariables = useCallback((inputText) => {
    const patterns = [
      // Simple variables: {{variableName}} - these should map to individual inputs
      /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g,
      // Indexed variables: {{input1}}, {{input2}}, etc.
      /\{\{\s*(input\d*)\s*\}\}/g,
      // Nested object access: {{object.property}}
      /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$.]*)\s*\}\}/g,
      // Array access: {{array[0]}} or {{array[index]}}
      /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*\[[^\]]+\])\s*\}\}/g,
    ];
    
    const matches = new Map();
    let inputIndex = 0;
    
    patterns.forEach((pattern, patternIndex) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(inputText)) !== null) {
        const fullExpression = match[1].trim();
        let baseName = fullExpression.split(/[.\[\$]/)[0] || fullExpression;
        
        // Handle generic inputs by converting them to indexed inputs
        if (baseName === 'input' && !fullExpression.match(/\d/)) {
          baseName = `input${inputIndex}`;
          inputIndex++;
        }
        
        if (!matches.has(fullExpression)) {
          // Infer data type from expression structure
          let inferredType = 'any';
          if (fullExpression.includes('.')) inferredType = 'object';
          else if (fullExpression.includes('[')) inferredType = 'array';
          else if (fullExpression.startsWith('$')) inferredType = 'object';
          else if (/^[a-z]+$/.test(fullExpression)) inferredType = 'string';
          
          matches.set(fullExpression, {
            name: fullExpression,
            baseName: baseName,
            id: `${id}-${fullExpression.replace(/[.\[\]$]/g, '_')}`,
            type: inferredType,
            isNested: fullExpression.includes('.') || fullExpression.includes('['),
            isFunction: fullExpression.startsWith('$'),
            inputOrder: matches.size // Order of appearance for consistent handle positioning
          });
        }
      }
    });
    
    return Array.from(matches.values()).sort((a, b) => {
      // Sort by input order to maintain consistent handle positioning
      return a.inputOrder - b.inputOrder;
    });
  }, [id]);

  // Update variables when text changes
  useEffect(() => {
    const newVariables = extractVariables(text);
    setVariables(newVariables);
  }, [text, extractVariables]);

  // Auto-resize textarea with sophisticated sizing
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const minHeight = 80;
      const maxHeight = 300;
      const idealHeight = Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight));
      textarea.style.height = idealHeight + 'px';
    }
  }, [text]);

  // Handle text changes with validation
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    updateNodeField(id, 'text', newText);
  }, [id, updateNodeField]);

  // Advanced keyboard shortcuts for multiple input functionality
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      textareaRef.current?.blur();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // Smart input insertion based on existing variables
      const existingInputs = variables.filter(v => v.name.startsWith('input'));
      const nextInputNumber = existingInputs.length + 1;
      const insertText = `{{input${nextInputNumber}}}`;
      
      const newText = text.substring(0, start) + insertText + text.substring(end);
      setText(newText);
      updateNodeField(id, 'text', newText);
      
      setTimeout(() => {
        const newPos = start + insertText.length;
        e.target.setSelectionRange(newPos, newPos);
      }, 0);
    } else if (e.key === 'F2') {
      e.preventDefault();
      setShowDataTypes(!showDataTypes);
    }
  }, [text, id, updateNodeField, showDataTypes, variables]);

  // Variable type change handler
  const handleVariableTypeChange = useCallback((variableName, newType) => {
    setVariables(prev => prev.map(v => 
      v.name === variableName ? { ...v, type: newType } : v
    ));
  }, []);

  // Get dynamic node dimensions based on content and variables
  const getNodeDimensions = () => {
    const baseWidth = 320;
    const baseHeight = 160;
    const variableHeight = variables.length * 28; // Updated for new compact spacing
    const textHeight = Math.max(60, (text.split('\n').length * 18));
    
    return {
      width: Math.max(baseWidth, showDataTypes ? baseWidth + 80 : baseWidth),
      height: Math.max(baseHeight, baseHeight + variableHeight + textHeight)
    };
  };

  const handleFocus = () => setIsEditing(true);
  const handleBlur = () => setIsEditing(false);

  const dimensions = getNodeDimensions();

  return (
    <div style={{
      width: dimensions.width,
      minHeight: dimensions.height,
      border: `1px solid ${selected ? '#8b5cf6' : '#e5e7eb'}`,
      borderLeft: '4px solid #8b5cf6',
      borderRadius: '12px',
      backgroundColor: 'white',
      padding: '16px',
      boxShadow: selected ? '0 8px 16px -4px rgba(139, 92, 246, 0.2)' : '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      transition: 'all 0.2s ease'
    }}>
      {/* Selection indicator */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          border: '2px solid #8b5cf6',
          borderRadius: '14px',
          pointerEvents: 'none',
          background: 'rgba(139, 92, 246, 0.05)'
        }} />
      )}

      {/* Input handles for variables with improved positioning */}
      {variables.map((variable, index) => {
        const typeInfo = dataTypes[variable.type] || dataTypes.any;
        const handleTop = 60 + (index * 28); // More compact spacing
        return (
          <div key={variable.id} style={{ 
            position: 'absolute', 
            left: '-8px', 
            top: `${handleTop}px`,
            zIndex: 10
          }}>
            <Handle
              type="target"
              position={Position.Left}
              id={variable.id}
              style={{
                backgroundColor: typeInfo.color,
                border: '2px solid white',
                width: '16px',
                height: '16px',
                borderRadius: variable.isNested ? '4px' : '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title={`${variable.name} (${variable.type}) - Input ${index + 1}`}
            />
            {/* Variable label on hover or when selected */}
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '-4px',
              fontSize: '10px',
              backgroundColor: selected ? typeInfo.color : 'rgba(107, 114, 128, 0.9)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
              fontWeight: '500'
            }}>
              {variable.name}
            </div>
          </div>
        );
      })}
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{
          backgroundColor: '#8b5cf6',
          border: '2px solid white',
          width: '14px',
          height: '14px',
          right: '-7px'
        }}
        title="Text output"
      />
      
      {/* Header with title and controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#8b5cf6',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Text Node
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {variables.length > 0 && (
            <span style={{
              fontSize: '11px',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '8px'
            }}>
              {variables.length} var{variables.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setShowDataTypes(!showDataTypes)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '2px',
              color: showDataTypes ? '#8b5cf6' : '#9ca3af'
            }}
            title="Toggle data types (F2)"
          >
            🔧
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter text with multiple variables:&#10;{{input1}} {{input2}} - for separate inputs&#10;{{user.name}} - for nested properties&#10;{{items[0]}} - for array access&#10;Press Tab to insert {{input}}, F2 to toggle types"
        style={{
          width: '100%',
          minHeight: '80px',
          height: 'auto',
          padding: '12px',
          border: `1px solid ${isEditing ? '#8b5cf6' : '#e5e7eb'}`,
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'Monaco, "SF Mono", Consolas, monospace',
          backgroundColor: isEditing ? '#faf5ff' : 'white',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.6',
          color: '#374151',
          overflow: 'hidden',
          transition: 'all 0.2s ease'
        }}
        spellCheck={false}
        rows={1}
      />
      
      {/* Variables display with sophisticated info */}
      {variables.length > 0 && (
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Detected Variables
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {variables.map((variable) => {
              const typeInfo = dataTypes[variable.type] || dataTypes.any;
              return (
                <div
                  key={variable.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div 
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: typeInfo.color,
                        borderRadius: variable.isNested ? '2px' : '50%'
                      }}
                    />
                    <span style={{ fontFamily: 'Monaco, monospace', color: '#374151' }}>
                      {variable.name}
                    </span>
                    {variable.isFunction && (
                      <span style={{ fontSize: '9px', color: '#8b5cf6' }}>FUNC</span>
                    )}
                    {variable.isNested && (
                      <span style={{ fontSize: '9px', color: '#059669' }}>NESTED</span>
                    )}
                  </div>
                  <select
                    value={variable.type}
                    onChange={(e) => handleVariableTypeChange(variable.name, e.target.value)}
                    style={{
                      fontSize: '9px',
                      padding: '2px 4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '3px',
                      backgroundColor: 'white'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.keys(dataTypes).map(type => (
                      <option key={type} value={type}>
                        {dataTypes[type].icon} {type}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};