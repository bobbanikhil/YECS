import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const FinancialData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const watchIncome = watch('monthly_income', 0);
  const watchExpenses = watch('monthly_expenses', 0);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.createFinancialData(userId, data);

      if (response.data.financial_data_id) {
        toast.success('Financial data saved successfully!');
        navigate(`/calculate-score/${userId}`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to save financial data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <Card>
          <Card.Header>
            <h3>Financial Information</h3>
            <p className="text-muted mb-0">Provide your financial details for score calculation</p>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Income ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="5000"
                      {...register('monthly_income', {
                        required: 'Monthly income is required',
                        min: { value: 0, message: 'Income must be non-negative' }
                      })}
                      isInvalid={!!errors.monthly_income}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.monthly_income?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Expenses ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="3000"
                      {...register('monthly_expenses', {
                        required: 'Monthly expenses is required',
                        min: { value: 0, message: 'Expenses must be non-negative' }
                      })}
                      isInvalid={!!errors.monthly_expenses}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.monthly_expenses?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {watchIncome && watchExpenses && (
                <Alert variant={watchIncome > watchExpenses ? 'success' : 'warning'}>
                  <strong>Cash Flow:</strong> ${(watchIncome - watchExpenses).toFixed(2)} per month
                  {watchIncome <= watchExpenses && (
                    <div className="mt-1">
                      <small>⚠️ Your expenses exceed your income. This may negatively impact your score.</small>
                    </div>
                  )}
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Savings ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="10000"
                      {...register('savings_amount', {
                        required: 'Savings amount is required',
                        min: { value: 0, message: 'Savings must be non-negative' }
                      })}
                      isInvalid={!!errors.savings_amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.savings_amount?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total Debt ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="15000"
                      {...register('debt_amount', {
                        required: 'Debt amount is required',
                        min: { value: 0, message: 'Debt must be non-negative' }
                      })}
                      isInvalid={!!errors.debt_amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.debt_amount?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Include all debts: credit cards, loans, etc.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Utility Payment Score (0-1)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      placeholder="0.9"
                      {...register('utility_payment_score', {
                        required: 'Utility payment score is required',
                        min: { value: 0, message: 'Score must be between 0 and 1' },
                        max: { value: 1, message: 'Score must be between 0 and 1' }
                      })}
                      isInvalid={!!errors.utility_payment_score}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.utility_payment_score?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Rate your utility payment consistency (0 = poor, 1 = excellent)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rent Payment Score (0-1)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      placeholder="0.95"
                      {...register('rent_payment_score', {
                        required: 'Rent payment score is required',
                        min: { value: 0, message: 'Score must be between 0 and 1' },
                        max: { value: 1, message: 'Score must be between 0 and 1' }
                      })}
                      isInvalid={!!errors.rent_payment_score}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.rent_payment_score?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Rate your rent payment consistency (0 = poor, 1 = excellent)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Next: Calculate Score'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default FinancialData;
