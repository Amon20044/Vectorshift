import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  const appStyle = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    backgroundColor: 'var(--color-gray-50)',
    overflow: 'hidden'
  };

  return (
    <div style={appStyle}>
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;
