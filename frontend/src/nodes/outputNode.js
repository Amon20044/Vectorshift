// outputNode.js

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const fields = [
    {
      name: 'outputName',
      type: 'text',
      label: 'Name',
      defaultValue: id.replace('customOutput-', 'output_'),
      placeholder: 'Enter output name'
    },
    {
      name: 'outputType',
      type: 'select',
      label: 'Type',
      defaultValue: 'Text',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'Image', label: 'Image' },
        { value: 'JSON', label: 'JSON' },
        { value: 'File', label: 'File' }
      ]
    }
  ];

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-value`
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Output"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary)',
      }}
    />
  );
};
