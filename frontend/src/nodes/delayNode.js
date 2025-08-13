// delayNode.js
// Node for adding delays in the pipeline

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const DelayNode = ({ id, data }) => {
  const fields = [
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (ms)',
      defaultValue: '1000',
      placeholder: 'Enter delay in milliseconds'
    },
    {
      name: 'unit',
      type: 'select',
      label: 'Time Unit',
      defaultValue: 'ms',
      options: [
        { value: 'ms', label: 'Milliseconds' },
        { value: 'seconds', label: 'Seconds' },
        { value: 'minutes', label: 'Minutes' }
      ]
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
      title="Delay"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary-light)',
      }}
    />
  );
};
