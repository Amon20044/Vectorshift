// textNode.js - Enhanced Text Node with improved variable logic and UX

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const TextNode = ({ id, data, selected }) => {
  const [text, setText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 280, height: 140 });
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showVariableHints, setShowVariableHints] = useState(false);
  const textareaRef = useRef(null);
  const updateNodeField = useStore(state => state.updateNodeField);

  // Enhanced variable extraction with position tracking
  const extractVariables = useCallback((inputText) => {
    const variableRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const matches = [];
    let match;
    
    while ((match = variableRegex.exec(inputText)) !== null) {
      const variableName = match[1].trim();
      const existingVar = matches.find(v => v.name === variableName);
      
      if (!existingVar) {
        matches.push({
          name: variableName,
          id: `${id}-${variableName}`,
          position: match.index,
          length: match[0].length,
          rawMatch: match[0]
        });
      }
    }
    
    return matches.sort((a, b) => a.position - b.position);
  }, [id]);

  // Memoized variables to prevent unnecessary re-renders
  const memoizedVariables = useMemo(() => extractVariables(text), [text, extractVariables]);

  // Update variables when text changes
  useEffect(() => {
    if (JSON.stringify(variables) !== JSON.stringify(memoizedVariables)) {
      setVariables(memoizedVariables);
    }
  }, [memoizedVariables, variables]);

  // Enhanced auto-resize with smooth transitions
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Create a temporary element to measure text dimensions
      const measureElement = document.createElement('div');
      measureElement.style.position = 'absolute';
      measureElement.style.visibility = 'hidden';
      measureElement.style.whiteSpace = 'pre-wrap';
      measureElement.style.wordWrap = 'break-word';
      measureElement.style.font = window.getComputedStyle(textarea).font;
      measureElement.style.padding = '8px';
      measureElement.style.width = '280px'; // Base width
      measureElement.textContent = text || 'placeholder';
      
      document.body.appendChild(measureElement);
      
      const contentHeight = measureElement.scrollHeight;
      const contentWidth = Math.min(400, Math.max(280, measureElement.scrollWidth + 40));
      
      document.body.removeChild(measureElement);
      
      const headerHeight = 60;
      const variableFooterHeight = variables.length > 0 ? 50 : 20;
      const totalHeight = Math.max(140, contentHeight + headerHeight + variableFooterHeight);
      
      setDimensions({ 
        width: contentWidth, 
        height: totalHeight 
      });
    }
  }, [text, variables.length]);

  // Enhanced text change handler with debouncing
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setText(newText);
    setCursorPosition(cursorPos);
    
    // Update store with debouncing
    const timeoutId = setTimeout(() => {
      updateNodeField(id, 'text', newText);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, updateNodeField]);

  // Smart variable insertion
  const insertVariable = useCallback((varName) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const variableText = `{{${varName}}}`;
      const newText = text.substring(0, start) + variableText + text.substring(end);
      
      setText(newText);
      updateNodeField(id, 'text', newText);
      
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + variableText.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  }, [text, id, updateNodeField]);

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + Enter to finish editing
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      textareaRef.current?.blur();
      return;
    }
    
    // Tab to insert common variable
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      insertVariable('input');
      return;
    }
    
    // Shift + Tab to show variable hints
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      setShowVariableHints(!showVariableHints);
      return;
    }
    
    // Auto-complete variable names
    if (e.key === '{' && text.charAt(cursorPosition - 1) === '{') {
      // User typed "{{", suggest common variables
      setShowVariableHints(true);
    }
  }, [insertVariable, showVariableHints, text, cursorPosition]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setShowVariableHints(false);
    updateNodeField(id, 'text', text);
  }, [id, text, updateNodeField]);

  // Dynamic styling based on state
  const nodeStyle = {
    width: dimensions.width,
    height: dimensions.height,
    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
    borderLeft: `4px solid var(--color-primary)`,
    borderRadius: 'var(--border-radius)',
    backgroundColor: 'var(--color-white)',
    padding: '16px',
    boxShadow: isEditing ? 'var(--shadow-lg)' : selected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default'
  };

  const titleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    marginBottom: '8px',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '60px',
    padding: '12px',
    border: `1px solid ${isEditing ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
    borderRadius: 'calc(var(--border-radius) / 2)',
    fontSize: '13px',
    fontFamily: 'Monaco, "SF Mono", "Cascadia Code", monospace',
    backgroundColor: isEditing ? 'var(--color-gray-50)' : 'var(--color-white)',
    resize: 'none',
    outline: 'none',
    lineHeight: '1.5',
    color: 'var(--color-gray-700)',
    transition: 'var(--transition)',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  };

  const variableTagStyle = {
    display: 'inline-block',
    fontSize: '10px',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    padding: '3px 8px',
    borderRadius: '12px',
    margin: '2px 4px 2px 0',
    fontWeight: '500',
    cursor: 'default'
  };

  const hintStyle = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--border-radius)',
    boxShadow: 'var(--shadow-lg)',
    padding: '8px',
    fontSize: '11px',
    color: 'var(--color-gray-600)',
    zIndex: 1000
  };

  return (
    <div style={nodeStyle}>
      {/* Dynamic variable handles */}
      {variables.map((variable, index) => (
        <Handle
          key={variable.id}
          type="target"
          position={Position.Left}
          id={variable.id}
          style={{
            top: `${50 + (index * 24)}px`,
            backgroundColor: 'var(--color-primary)',
            border: '2px solid var(--color-white)',
            width: '12px',
            height: '12px',
            borderRadius: '50%'
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
          backgroundColor: 'var(--color-primary)',
          border: '2px solid var(--color-white)',
          width: '12px',
          height: '12px',
          borderRadius: '50%'
        }}
        title="Text output"
      />
      
      {/* Enhanced title with status indicators */}
      <div style={titleStyle}>
        <span>Text Node</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && (
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', opacity: 0.7 }}>
              ✏️ Editing
            </span>
          )}
          {variables.length > 0 && (
            <span style={{ fontSize: '10px', opacity: 0.7 }}>
              {variables.length} var{variables.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {/* Enhanced textarea with better UX */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Enter text with variables like {{variableName}}&#10;Press Tab to insert {{input}}&#10;Use Ctrl+Enter to finish editing"
          style={textareaStyle}
          className="focus-ring"
          spellCheck={false}
          autoComplete="off"
        />
        
        {/* Variable hints popup */}
        {showVariableHints && (
          <div style={hintStyle}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Quick Variables:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {['input', 'output', 'data', 'result', 'value'].map(varName => (
                <button
                  key={varName}
                  onClick={() => insertVariable(varName)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-gray-50)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-gray-50)'}
                >
                  {varName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced variable indicators */}
      {variables.length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--color-gray-200)',
          fontSize: '10px',
          color: 'var(--color-gray-500)'
        }}>
          <div style={{ marginBottom: '6px', fontWeight: '500' }}>Input Variables:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {variables.map((variable, index) => (
              <span key={variable.name} style={variableTagStyle}>
                {variable.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Helpful hints for new users */}
      {variables.length === 0 && !isEditing && text === '{{input}}' && (
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: 'var(--color-gray-400)',
          fontStyle: 'italic',
          padding: '8px',
          backgroundColor: 'var(--color-gray-50)',
          borderRadius: 'calc(var(--border-radius) / 2)',
          border: '1px dashed var(--color-gray-200)'
        }}>
          💡 <strong>Tips:</strong><br/>
          • Type {"{{"}{"}"}variableName{"}"}{"}}"} to create input handles<br/>
          • Press Tab to quickly insert {"{{"}{"}"}input{"}"}{"}"}<br/>
          • Use Ctrl+Enter when done editing
        </div>
      )}
    </div>
  );
};
