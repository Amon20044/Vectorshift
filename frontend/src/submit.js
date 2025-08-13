// submit.js - Enhanced with better user feedback

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
    const { nodes, edges } = useStore(selector, shallow);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);

    const handleSubmit = async () => {
        if (nodes.length === 0) {
            alert('Please add at least one node to your pipeline before submitting.');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare data for backend
            const pipelineData = {
                nodes: nodes.map(node => ({
                    id: node.id,
                    type: node.type,
                    position: node.position,
                    data: node.data || {}
                })),
                edges: edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle
                }))
            };

            console.log('Submitting pipeline data:', pipelineData);

            // Send data to backend - try multiple URLs in case of port issues
            const urls = [
                'https://refactored-goldfish-x5wg55ppjw5fpgqp-8000.app.github.dev/pipelines/parse'
            ];

            let response = null;
            let lastError = null;

            for (const url of urls) {
                try {
                    console.log(pipelineData);
                    response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(pipelineData),
                    });
                    console.log('Response status:', response);
                    if (response.ok) break;
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Failed to connect to backend. Please ensure the backend is running. Last error: ${lastError?.message || 'Network error'}`);
            }

            const result = await response.json();
            console.log('Backend response:', result);

            setResults(result);
            setShowResults(true);

        } catch (error) {
            console.error('Error submitting pipeline:', error);
            alert(`❌ Error submitting pipeline:\n\n${error.message}\n\nPlease check:\n1. Backend server is running\n2. Network connection is stable\n3. Pipeline data is valid`);
        } finally {
            setIsLoading(false);
        }
    };

    const closeResults = () => {
        setShowResults(false);
        setResults(null);
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--color-white)',
        borderTop: '1px solid var(--color-gray-200)',
        position: 'relative'
    };

    const btnStyle = {
        backgroundColor: isLoading ? 'var(--color-gray-400)' : 'var(--color-primary)',
        color: 'var(--color-white)',
        border: 'none',
        borderRadius: 'var(--border-radius)',
        padding: '12px 24px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)',
        letterSpacing: '0.025em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: 'var(--color-white)',
        borderRadius: 'calc(var(--border-radius) * 2)',
        padding: '32px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const getStatusIcon = () => {
        if (!results) return '';
        return results.is_dag ? '✅' : '⚠️';
    };

    const getStatusColor = () => {
        if (!results) return 'var(--color-gray-600)';
        return results.is_dag ? 'var(--color-primary)' : '#f59e0b';
    };

    return (
        <>
            <div style={buttonStyle}>
                <button 
                    type="submit" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={btnStyle}
                    className="focus-ring"
                    onMouseEnter={(e) => {
                        if (!isLoading) {
                            e.target.style.backgroundColor = 'var(--color-primary-dark)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = 'var(--shadow-md)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isLoading) {
                            e.target.style.backgroundColor = 'var(--color-primary)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'var(--shadow-sm)';
                        }
                    }}
                >
                    {isLoading && (
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid currentColor',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    )}
                    {isLoading ? 'Analyzing Pipeline...' : 'Submit Pipeline'}
                </button>
            </div>

            {/* Enhanced Results Modal */}
            {showResults && results && (
                <div style={modalStyle} onClick={closeResults}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                                {getStatusIcon()}
                            </div>
                            <h2 style={{ 
                                color: getStatusColor(), 
                                margin: 0, 
                                fontSize: '18px', 
                                fontWeight: '600' 
                            }}>
                                Pipeline Analysis Results
                            </h2>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '16px', 
                            marginBottom: '24px' 
                        }}>
                            <div style={{
                                padding: '16px',
                                backgroundColor: 'var(--color-gray-50)',
                                borderRadius: 'var(--border-radius)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>
                                    {results.num_nodes}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Nodes
                                </div>
                            </div>
                            <div style={{
                                padding: '16px',
                                backgroundColor: 'var(--color-gray-50)',
                                borderRadius: 'var(--border-radius)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>
                                    {results.num_edges}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Connections
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '16px',
                            backgroundColor: results.is_dag ? '#f0fdf4' : '#fffbeb',
                            border: `1px solid ${results.is_dag ? '#22c55e' : '#f59e0b'}`,
                            borderRadius: 'var(--border-radius)',
                            marginBottom: '24px'
                        }}>
                            <div style={{ 
                                fontWeight: '600', 
                                color: results.is_dag ? '#15803d' : '#d97706',
                                marginBottom: '4px' 
                            }}>
                                {results.is_dag ? '✅ Valid DAG' : '⚠️ Contains Cycles'}
                            </div>
                            <div style={{ 
                                fontSize: '13px', 
                                color: results.is_dag ? '#166534' : '#92400e',
                                lineHeight: '1.4'
                            }}>
                                {results.is_dag 
                                    ? 'Your pipeline is a valid Directed Acyclic Graph and ready for execution.'
                                    : 'Warning: The pipeline contains cycles. DAGs cannot have circular dependencies.'
                                }
                            </div>
                        </div>

                        <button
                            onClick={closeResults}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-white)',
                                border: 'none',
                                borderRadius: 'var(--border-radius)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'var(--color-primary-dark)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'var(--color-primary)';
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};
