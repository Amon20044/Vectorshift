// conditionalNode.js
// Node for conditional logic (if/else branching)

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const ConditionalNode = ({ id, data }) => {
  const fields = [
    {
      name: 'condition',
      type: 'textarea',
      label: 'Condition',
      placeholder: 'Enter JavaScript condition (e.g., value > 10)',
      defaultValue: 'value > 0'
    },
    {
      name: 'trueLabel',
      type: 'text',
      label: 'True Path Label',
      defaultValue: 'True',
      placeholder: 'Label for true condition'
    },
    {
      name: 'falseLabel',
      type: 'text',
      label: 'False Path Label',
      defaultValue: 'False',
      placeholder: 'Label for false condition'
    }
  ];

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-condition`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-true`,
      style: { top: '35%', backgroundColor: '#22c55e' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-false`,
      style: { top: '65%', backgroundColor: '#ef4444' }
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Conditional"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary)',
        minHeight: 120
      }}
    />
  );
};
