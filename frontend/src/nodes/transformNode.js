// transformNode.js
// Node for data transformations

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const TransformNode = ({ id, data }) => {
  const fields = [
    {
      name: 'operation',
      type: 'select',
      label: 'Operation',
      defaultValue: 'uppercase',
      options: [
        { value: 'uppercase', label: 'Uppercase' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'trim', label: 'Trim Whitespace' },
        { value: 'replace', label: 'Find & Replace' },
        { value: 'split', label: 'Split Text' },
        { value: 'join', label: 'Join Array' }
      ]
    },
    {
      name: 'parameter',
      type: 'text',
      label: 'Parameter',
      placeholder: 'Optional parameter for operation'
    }
  ];

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-input`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-output`
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Transform"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary-light)',
      }}
    />
  );
};
