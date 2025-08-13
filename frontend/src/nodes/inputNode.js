// inputNode.js

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const InputNode = ({ id, data }) => {
  const fields = [
    {
      name: 'inputName',
      type: 'text',
      label: 'Name',
      defaultValue: id.replace('customInput-', 'input_'),
      placeholder: 'Enter input name'
    },
    {
      name: 'inputType',
      type: 'select',
      label: 'Type',
      defaultValue: 'Text',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'File', label: 'File' },
        { value: 'Number', label: 'Number' },
        { value: 'Boolean', label: 'Boolean' }
      ]
    }
  ];

  const handles = [
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-value`
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Input"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary)',
      }}
    />
  );
};
