// textNode.js - Text Node 

import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const TextNode = ({ id, data, selected }) => {
  const [text, setText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDataTypes, setShowDataTypes] = useState(false);
  const textareaRef = useRef(null);
  const updateNodeField = useStore(state => state.updateNodeField);
  const deleteNode = useStore(state => state.deleteNode);
  const duplicateNode = useStore(state => state.duplicateNode);

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

  // Extract variables with sophisticated parsing (N8N style)
  const extractVariables = useCallback((inputText) => {
    const patterns = [
      // Simple variables: {{variableName}}
      /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g,
      // Nested object access: {{object.property}}
      /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$.]*)\s*\}\}/g,
      // Array access: {{array[0]}} or {{array[index]}}
      /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*\[[^\]]+\])\s*\}\}/g,
      // Function-like expressions: {{$json.data}} or {{$node.output}}
      /\{\{\s*(\$[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*\}\}/g,
    ];
    
    const matches = new Map();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(inputText)) !== null) {
        const fullExpression = match[1].trim();
        const baseName = fullExpression.split(/[.\[\$]/)[0] || fullExpression;
        
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
            isFunction: fullExpression.startsWith('$')
          });
        }
      }
    });
    
    return Array.from(matches.values()).sort((a, b) => {
      // Sort by base name, then by complexity
      if (a.baseName !== b.baseName) return a.baseName.localeCompare(b.baseName);
      return a.name.localeCompare(b.name);
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

  // Advanced keyboard shortcuts for N8N-like functionality
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
    } else if (e.key === 'F2') {
      e.preventDefault();
      setShowDataTypes(!showDataTypes);
    }
  }, [text, id, updateNodeField, showDataTypes]);

  // Variable type change handler
  const handleVariableTypeChange = useCallback((variableName, newType) => {
    setVariables(prev => prev.map(v => 
      v.name === variableName ? { ...v, type: newType } : v
    ));
  }, []);

  // Get dynamic node dimensions based on content
  const getNodeDimensions = () => {
    const baseWidth = 320;
    const baseHeight = 180;
    const variableHeight = variables.length * 32;
    const textHeight = Math.max(80, (text.split('\n').length * 20));
    
    return {
      width: Math.max(baseWidth, showDataTypes ? baseWidth + 100 : baseWidth),
      height: Math.max(baseHeight, baseHeight + variableHeight + (textHeight - 80))
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
      {/* Action buttons */}
      <div style={{ 
        position: 'absolute', 
        top: '8px', 
        right: '8px', 
        display: 'flex', 
        gap: '4px',
        opacity: selected ? 1 : 0,
        transition: 'opacity 0.2s ease'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
          style={{
            width: '24px',
            height: '24px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Duplicate node"
        >
          📋
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          style={{
            width: '24px',
            height: '24px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#fee2e2',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Delete node"
        >
          🗑️
        </button>
      </div>

      {/* Input handles for variables with data types */}
      {variables.map((variable, index) => {
        const typeInfo = dataTypes[variable.type] || dataTypes.any;
        return (
          <div key={variable.id} style={{ position: 'absolute', left: '-7px', top: `${70 + (index * 32)}px` }}>
            <Handle
              type="target"
              position={Position.Left}
              id={variable.id}
              style={{
                backgroundColor: typeInfo.color,
                border: '2px solid white',
                width: '14px',
                height: '14px',
                borderRadius: variable.isNested ? '3px' : '50%'
              }}
              title={`${variable.name} (${variable.type})`}
            />
            {showDataTypes && (
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '-8px',
                fontSize: '10px',
                backgroundColor: typeInfo.color,
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                {typeInfo.icon} {variable.type}
              </div>
            )}
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
        placeholder="Enter text with variables like {{variableName}}&#10;Use {{object.property}} for nested access&#10;Use {{array[0]}} for array access&#10;Use {{$node.data}} for functions&#10;Press Tab to insert {{input}}, F2 to toggle types"
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