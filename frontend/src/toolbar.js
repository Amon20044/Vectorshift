//toolbar.js

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
    const toolbarStyle = {
        padding: '16px 24px',
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        boxShadow: 'var(--shadow-sm)'
    };

    const titleStyle = {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--color-primary)',
        marginBottom: '16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const nodeContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
    };

    return (
        <div style={toolbarStyle}>
            <div style={titleStyle}>Node Toolbar</div>
            <div style={nodeContainerStyle}>
                <DraggableNode type='customInput' label='Input' />
                <DraggableNode type='customOutput' label='Output' />
                <DraggableNode type='text' label='Text' />
                <DraggableNode type='llm' label='LLM' />
                <DraggableNode type='filter' label='Filter' />
                <DraggableNode type='transform' label='Transform' />
                <DraggableNode type='delay' label='Delay' />
                <DraggableNode type='api' label='API' />
                <DraggableNode type='conditional' label='Conditional' />
            </div>
        </div>
    );
};
