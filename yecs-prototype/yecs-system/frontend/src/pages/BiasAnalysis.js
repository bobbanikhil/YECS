import React, { useState } from 'react';
import { Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const BiasAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [biasResults, setBiasResults] = useState(null);
  const [error, setError] = useState('');

  const analyzeBias = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.analyzeBias();
      setBiasResults(response.data);
      toast.success('Bias analysis completed successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to analyze bias.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Bias Analysis</h2>
      <p className="text-muted">
        Analyze the YECS system for potential demographic bias and fairness metrics.
      </p>

      <Card className="mb-4">
        <Card.Header>
          <h5>System Bias Detection</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {!biasResults ? (
            <div className="text-center">
              <p>
                Run a comprehensive bias analysis to detect potential discrimination
                across demographic groups in the YECS scoring system.
              </p>
              <Button
                variant="primary"
                onClick={analyzeBias}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Analyzing...
                  </>
                ) : (
                  'Run Bias Analysis'
                )}
              </Button>
            </div>
          ) : (
            <div>
              <Alert variant="success">
                <h6>Analysis Complete</h6>
                <p className="mb-0">
                  Bias analysis completed at {new Date(biasResults.timestamp).toLocaleString()}
                </p>
              </Alert>

              <h6>Results Summary</h6>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Bias Detected</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(biasResults.bias_analysis).map(([attribute, results]) => (
                    <tr key={attribute}>
                      <td>{attribute.replace('_', ' ').toUpperCase()}</td>
                      <td>{results.bias_detected ? 'Yes' : 'No'}</td>
                      <td>
                        <span className={`badge ${results.bias_detected ? 'bg-warning' : 'bg-success'}`}>
                          {results.bias_detected ? 'Needs Attention' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default BiasAnalysis;
