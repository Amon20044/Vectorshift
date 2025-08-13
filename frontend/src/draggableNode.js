// draggableNode.js

export const DraggableNode = ({ type, label }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };

    // Clean purple and white color scheme
    const getNodeColor = (nodeType) => {
      const colors = {
        customInput: { bg: 'var(--color-white)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
        customOutput: { bg: 'var(--color-white)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
        text: { bg: 'var(--color-white)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
        llm: { bg: 'var(--color-white)', border: 'var(--color-primary-dark)', text: 'var(--color-primary-dark)' },
        filter: { bg: 'var(--color-white)', border: 'var(--color-primary-light)', text: 'var(--color-primary-light)' },
        transform: { bg: 'var(--color-white)', border: 'var(--color-primary-light)', text: 'var(--color-primary-light)' },
        delay: { bg: 'var(--color-white)', border: 'var(--color-primary-light)', text: 'var(--color-primary-light)' },
        api: { bg: 'var(--color-white)', border: 'var(--color-primary-dark)', text: 'var(--color-primary-dark)' },
        conditional: { bg: 'var(--color-white)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
        default: { bg: 'var(--color-white)', border: 'var(--color-primary)', text: 'var(--color-primary)' }
      };
      return colors[nodeType] || colors.default;
    };

    const nodeColor = getNodeColor(type);
  
    return (
      <div
        className={type}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        style={{ 
          cursor: 'grab', 
          minWidth: '90px', 
          height: '50px',
          display: 'flex', 
          alignItems: 'center', 
          borderRadius: 'var(--border-radius)',
          backgroundColor: nodeColor.bg,
          border: `1px solid ${nodeColor.border}`,
          borderLeft: `4px solid ${nodeColor.text}`,
          justifyContent: 'center', 
          flexDirection: 'column',
          transition: 'var(--transition)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          boxShadow: 'var(--shadow-sm)'
        }} 
        draggable
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
          <span style={{ 
            color: nodeColor.text,
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '0.025em'
          }}>
            {label}
          </span>
      </div>
    );
  };
  