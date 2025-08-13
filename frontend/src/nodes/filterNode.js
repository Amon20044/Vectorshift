// filterNode.js
// Node for filtering data based on conditions

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const fields = [
    {
      name: 'condition',
      type: 'select',
      label: 'Condition',
      defaultValue: 'equals',
      options: [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'not_empty', label: 'Not Empty' }
      ]
    },
    {
      name: 'value',
      type: 'text',
      label: 'Compare Value',
      placeholder: 'Enter comparison value'
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
      id: `${id}-pass`,
      style: { top: '40%', backgroundColor: '#22c55e' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-fail`,
      style: { top: '60%', backgroundColor: '#ef4444' }
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Filter"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary-light)',
      }}
    />
  );
};
