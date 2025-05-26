import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route'; // Import the POST handler

// Import Resend and the exported mock function from the mocked 'resend' module
import { Resend, __test__sendMock as mockSend } from 'resend'; 

vi.mock('resend', async () => {
  const actualResendModule = await vi.importActual<typeof import('resend')>('resend');
  const sendMock = vi.fn(); // This is the mock for emails.send

  const ResendMock = vi.fn().mockImplementation(() => {
    return {
      emails: {
        send: sendMock,
      },
    };
  });

  return {
    ...actualResendModule, // Spread other exports from the actual module
    Resend: ResendMock,      // Override the Resend class
    __test__sendMock: sendMock, // Export the sendMock for test access
    default: ResendMock,        // Assuming Resend might be a default export too
  };
});

// Helper to create a mock Request object
const createMockRequest = (body: any) => {
  return {
    json: async () => body,
  } as Request;
};

describe('Contact API Route', () => {
  const RESEND_KEY = 'test-key';
  const RESEND_EMAIL = 'test@example.com';
  const TO_EMAIL = 'nikk4apps@gmail.com'; // As per the route.ts

  beforeEach(() => {
    vi.stubEnv('RESEND_KEY', RESEND_KEY);
    vi.stubEnv('RESEND_EMAIL', RESEND_EMAIL);
    
    // Reset the mock function before each test
    mockSend.mockReset();
    // Default mock implementation for successful send
    mockSend.mockResolvedValue({ id: 'mock_id' });
  });

  afterEach(() => {
    vi.unstubAllEnvs(); // Clean up environment variables
    vi.clearAllMocks(); // Clear all mocks to ensure isolation, Resend constructor calls etc.
  });

  describe('POST Handler', () => {
    test('should send email successfully for recruiter', async () => {
      const recruiterData = {
        userType: 'recruiter',
        company: 'Test Co',
        position: 'Dev',
        jobDescription: 'Build things',
        employmentType: 'Full-time',
        interview: 'Yes',
        workLocation: 'Remote',
        locationDetails: 'Anywhere',
        email: 'recruiter@test.com',
        message: 'Hello Recruiter',
      };
      const req = createMockRequest(recruiterData);

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.message).toBe('Email sent successfully');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const expectedText = `
Recruiter Inquiry

Company: Test Co
Position: Dev
Job Description: Build things
Employment Type: Full-time
Interview: Yes
Work Location: Remote
Location Details: Anywhere
Email: recruiter@test.com

Message:
Hello Recruiter
      `.trim();
      expect(mockSend).toHaveBeenCalledWith({
        from: RESEND_EMAIL,
        to: TO_EMAIL,
        subject: 'New recruiter inquiry',
        replyTo: recruiterData.email,
        text: expectedText,
      });
    });

    test('should send email successfully for recruiter with optional fields missing', async () => {
      const recruiterData = {
        userType: 'recruiter',
        company: 'Test Co',
        position: 'Dev',
        jobDescription: 'Build things',
        employmentType: 'Full-time',
        interview: 'No',
        workLocation: 'On-site',
        email: 'recruiter.optional@test.com',
        message: 'Hello Recruiter Optional',
      };
      const req = createMockRequest(recruiterData);

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.message).toBe('Email sent successfully');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const expectedText = `
Recruiter Inquiry

Company: Test Co
Position: Dev
Job Description: Build things
Employment Type: Full-time
Interview: No
Work Location: On-site
Location Details: N/A
Email: recruiter.optional@test.com

Message:
Hello Recruiter Optional
      `.trim();
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        text: expectedText,
        replyTo: recruiterData.email,
        subject: 'New recruiter inquiry',
      }));
    });

    test('should send email successfully for client', async () => {
      const clientData = {
        userType: 'client',
        name: 'Test Client',
        projectType: 'Web App',
        budget: '10k',
        timeline: '3 months',
        email: 'client@test.com',
        message: 'Hello Client',
      };
      const req = createMockRequest(clientData);

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.message).toBe('Email sent successfully');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const expectedText = `
Client Inquiry

Name: Test Client
Project Type: Web App
Budget: 10k
Timeline: 3 months
Email: client@test.com

Message:
Hello Client
      `.trim();
      expect(mockSend).toHaveBeenCalledWith({
        from: RESEND_EMAIL,
        to: TO_EMAIL,
        subject: 'New client inquiry',
        replyTo: clientData.email,
        text: expectedText,
      });
    });

    test('should send email successfully for client with optional fields missing', async () => {
      const clientData = {
        userType: 'client',
        name: 'Test Client Optional',
        projectType: 'Mobile App',
        email: 'client.optional@test.com',
        message: 'Hello Client Optional',
      };
      const req = createMockRequest(clientData);

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.message).toBe('Email sent successfully');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const expectedText = `
Client Inquiry

Name: Test Client Optional
Project Type: Mobile App
Budget: N/A
Timeline: N/A
Email: client.optional@test.com

Message:
Hello Client Optional
      `.trim();
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        text: expectedText,
        replyTo: clientData.email,
        subject: 'New client inquiry',
      }));
    });

    test('should return 500 if resend.emails.send throws an error', async () => {
      const clientData = {
        userType: 'client',
        name: 'Test Client Error',
        projectType: 'Web App',
        email: 'client.error@test.com',
        message: 'Hello Client Error',
      };
      const req = createMockRequest(clientData);
      const errorMessage = 'Resend failed';
      mockSend.mockReset();
      mockSend.mockRejectedValueOnce(new Error(errorMessage));

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody.message).toBe('Failed to send email');
      expect(responseBody.error).toBe(errorMessage);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    test('should return 500 if userType is missing (and resend call fails due to bad subject)', async () => {
      const invalidData = {
        name: 'No UserType',
        email: 'nousertype@test.com',
        message: 'This should cause an issue with subject/text',
      };
      const req = createMockRequest(invalidData);
      
      mockSend.mockReset();
      const resendErrorMessage = 'Resend API error: Invalid subject';
      mockSend.mockImplementation(async (payload: any) => {
        if (payload.subject === 'New undefined inquiry') {
          throw new Error(resendErrorMessage);
        }
        return { id: 'mock_id_other_case' };
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody.message).toBe('Failed to send email');
      expect(responseBody.error).toBe(resendErrorMessage);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'New undefined inquiry',
      }));
    });

    test('should return 500 if email is missing (and resend call fails due to missing replyTo)', async () => {
      const invalidData = {
        userType: 'client',
        name: 'No Email',
        message: 'This should fail due to missing email for replyTo',
      };
      const req = createMockRequest(invalidData);

      mockSend.mockReset();
      const resendErrorMessage = 'Resend API error: replyTo is required';
      mockSend.mockImplementation(async (payload: any) => {
        if (!payload.replyTo) {
          throw new Error(resendErrorMessage);
        }
        return { id: 'mock_id_other_case_2' };
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody.message).toBe('Failed to send email');
      expect(responseBody.error).toBe(resendErrorMessage);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        replyTo: undefined,
      }));
    });
  });
});
