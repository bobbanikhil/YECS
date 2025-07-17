import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const BusinessProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const industries = [
    'technology',
    'retail',
    'food_service',
    'consulting',
    'manufacturing',
    'healthcare',
    'finance',
    'education',
    'real_estate',
    'entertainment',
    'transportation',
    'other'
  ];

  const educationLevels = [
    'high school',
    'associate degree',
    'bachelor degree',
    'master degree',
    'mba',
    'phd',
    'other'
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.createBusinessProfile(userId, data);

      if (response.data.business_profile_id) {
        toast.success('Business profile created successfully!');
        navigate(`/financial-data/${userId}`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create business profile. Please try again.';
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
            <h3>Business Profile</h3>
            <p className="text-muted mb-0">Tell us about your business venture</p>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Business Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your business name"
                      {...register('business_name', { required: 'Business name is required' })}
                      isInvalid={!!errors.business_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.business_name?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Industry</Form.Label>
                    <Form.Select
                      {...register('industry', { required: 'Industry is required' })}
                      isInvalid={!!errors.industry}
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.industry?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Business Plan Quality (0-1)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="0.7"
                      {...register('business_plan_quality', {
                        required: 'Business plan quality is required',
                        min: { value: 0, message: 'Minimum value is 0' },
                        max: { value: 1, message: 'Maximum value is 1' }
                      })}
                      isInvalid={!!errors.business_plan_quality}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.business_plan_quality?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Rate your business plan quality (0 = poor, 1 = excellent)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Annual Revenue Projection ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="100000"
                      {...register('revenue_projection', {
                        required: 'Revenue projection is required',
                        min: { value: 0, message: 'Revenue must be non-negative' }
                      })}
                      isInvalid={!!errors.revenue_projection}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.revenue_projection?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Years of Experience</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="50"
                      placeholder="2"
                      {...register('years_of_experience', {
                        required: 'Years of experience is required',
                        min: { value: 0, message: 'Experience must be non-negative' }
                      })}
                      isInvalid={!!errors.years_of_experience}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.years_of_experience?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Education Level</Form.Label>
                    <Form.Select
                      {...register('education_level', { required: 'Education level is required' })}
                      isInvalid={!!errors.education_level}
                    >
                      <option value="">Select education level</option>
                      {educationLevels.map(level => (
                        <option key={level} value={level}>
                          {level.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.education_level?.message}
                    </Form.Control.Feedback>
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
                    'Next: Financial Information'
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

export default BusinessProfile;
