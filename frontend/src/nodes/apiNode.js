// apiNode.js
// Node for making API requests

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const ApiNode = ({ id, data }) => {
  const fields = [
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      placeholder: 'https://api.example.com/endpoint'
    },
    {
      name: 'method',
      type: 'select',
      label: 'Method',
      defaultValue: 'GET',
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
        { value: 'PATCH', label: 'PATCH' }
      ]
    },
    {
      name: 'headers',
      type: 'textarea',
      label: 'Headers (JSON)',
      placeholder: '{"Content-Type": "application/json"}'
    }
  ];

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-body`,
      style: { top: '40%' }
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-params`,
      style: { top: '60%' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-response`,
      style: { top: '40%' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-error`,
      style: { top: '60%', backgroundColor: '#ef4444' }
    }
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="API Request"
      fields={fields}
      handles={handles}
      style={{
        borderLeft: '4px solid var(--color-primary-dark)',
        minHeight: 140
      }}
    />
  );
};
