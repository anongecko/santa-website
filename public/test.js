const SantaChatTest = {
  sessionId: null,
  conversationId: null,
  testResults: [],
  testEmails: {
    valid: 'test@example.com',
    invalid: 'invalid-email',
    anonymous: 'anonymous@santa.chat',
  },
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'test-api-key',

  // Utility Functions
  delay: async ms => new Promise(resolve => setTimeout(resolve, ms)),

  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const [local, domain] = email.split('@');
    if (!local || local.length > 64 || local.length < 1) return false;
    if (!/^[a-zA-Z0-9._-]+$/.test(local)) return false;

    return true;
  },

  log(type, message, data = null) {
    const entry = { timestamp: new Date(), type, message, data };
    this.testResults.push(entry);
    console.log(`[${type}]`, message, data || '');
  },

  // Session Tests
  async testEmailValidation() {
    const testCases = [
      { email: 'test@example.com', expect: true },
      { email: 'invalid-email', expect: false },
      { email: '', expect: false },
      { email: 'test@test@test.com', expect: false },
      { email: 'test.email@domain.com', expect: true },
      { email: 'a'.repeat(65) + '@test.com', expect: false },
    ];

    for (const test of testCases) {
      const isValid = this.validateEmail(test.email);
      if (isValid === test.expect) {
        this.log('SUCCESS', `Email validation correct for ${test.email}`, {
          expected: test.expect,
        });
      } else {
        this.log('FAIL', `Email validation incorrect for ${test.email}`, {
          expected: test.expect,
          got: isValid,
        });
      }
    }
  },

  async testSessionCreation() {
    // Clean up existing sessions first
    await this.cleanup();

    const testCases = [
      {
        email: this.testEmails.valid,
        expectStatus: 200,
        description: 'Valid email first attempt',
      },
      {
        email: this.testEmails.invalid,
        expectStatus: 400,
        description: 'Invalid email format',
      },
      {
        email: this.testEmails.valid,
        expectStatus: 400,
        description: 'Duplicate session attempt',
      },
    ];

    for (const test of testCases) {
      try {
        await this.delay(1000); // Rate limit handling

        const response = await fetch('/api/session/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentEmail: test.email }),
        });

        const data = await response.json();

        if (response.status === test.expectStatus) {
          this.log('SUCCESS', `Session test passed: ${test.description}`, {
            email: test.email,
            status: response.status,
            data,
          });

          if (response.ok) {
            this.sessionId = data.sessionId;
            this.conversationId = data.conversationId;
          }
        } else {
          this.log('FAIL', `Session test failed: ${test.description}`, {
            email: test.email,
            expectedStatus: test.expectStatus,
            receivedStatus: response.status,
            data,
          });
        }
      } catch (error) {
        this.log('ERROR', `Session test error: ${test.description}`, error);
      }
    }
  },

  async testRateLimiting() {
    this.log('INFO', 'Starting rate limit test');

    // First cleanup to ensure clean state
    await this.cleanup();
    await this.delay(1000);

    const maxRequests = 20; // Expected limit
    const testWindow = 60000; // 1 minute window
    const requests = Array(25)
      .fill(null)
      .map((_, i) => ({
        email: `test${i}@example.com`,
        expectRateLimit: i >= maxRequests,
      }));

    let rateLimitHit = false;
    const startTime = Date.now();

    for (const req of requests) {
      try {
        const response = await fetch('/api/session/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentEmail: req.email }),
        });

        const responseData = await response.json();
        const headers = Object.fromEntries(response.headers.entries());

        this.log('INFO', 'Rate limit test request', {
          email: req.email,
          status: response.status,
          headers: {
            'retry-after': headers['retry-after'],
            'x-ratelimit-limit': headers['x-ratelimit-limit'],
            'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
            'x-ratelimit-reset': headers['x-ratelimit-reset'],
          },
        });

        if (response.status === 429) {
          rateLimitHit = true;
          this.log('SUCCESS', 'Rate limit correctly applied', {
            email: req.email,
            retryAfter: headers['retry-after'],
            rateLimitReset: headers['x-ratelimit-reset'],
          });
        } else if (req.expectRateLimit) {
          this.log('FAIL', 'Expected rate limit not applied', {
            email: req.email,
            status: response.status,
            data: responseData,
          });
        } else {
          this.log('SUCCESS', 'Request allowed before limit', {
            email: req.email,
            remaining: headers['x-ratelimit-remaining'],
          });
        }

        // Add small delay between requests
        await this.delay(100);
      } catch (error) {
        this.log('ERROR', 'Rate limit test error', {
          email: req.email,
          error: error.message,
        });
      }
    }

    const testDuration = Date.now() - startTime;
    this.log('INFO', 'Rate limit test completed', {
      duration: testDuration,
      rateLimitHit,
      requestsSent: requests.length,
      windowSize: testWindow,
    });

    if (!rateLimitHit) {
      this.log('FAIL', 'Rate limiting appears to be disabled or not working');
    }
  },

  // Message Tests with Rate Limit Handling
  async testMessageSending() {
    if (!this.sessionId || !this.conversationId) {
      this.log('ERROR', 'No active session or conversation ID');
      return;
    }

    const testMessages = [
      {
        content: 'Hi Santa!',
        expect: 200,
        description: 'Simple greeting',
        expectJson: false,
      },
      {
        content: 'I want a bike!',
        expect: 200,
        description: 'Gift request',
        expectJson: false,
      },
      {
        content: 'a'.repeat(501),
        expect: 400,
        description: 'Message too long',
        expectJson: true,
      },
      {
        content: '',
        expect: 400,
        description: 'Empty message',
        expectJson: true,
      },
    ];

    for (const test of testMessages) {
      try {
        await this.delay(1500);

        const payload = {
          messages: [{ content: test.content, role: 'user' }],
          sessionId: this.sessionId,
          conversationId: this.conversationId,
          parentEmail: 'test@example.com',
        };

        this.log('INFO', `Sending message`, {
          content: test.content,
          sessionId: this.sessionId,
          conversationId: this.conversationId,
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const contentType = response.headers.get('content-type') || 'text/plain';
        let responseData;

        if (test.expectJson) {
          try {
            responseData = await response.json();
          } catch (e) {
            this.log('ERROR', 'Expected JSON response but received:', {
              text: await response.text(),
            });
          }
        } else {
          // For success cases, expect plain text
          responseData = await response.text();
        }

        this.log('INFO', 'Response details', {
          status: response.status,
          contentType: contentType,
          isError: response.status >= 400,
          responseLength:
            typeof responseData === 'string'
              ? responseData.length
              : JSON.stringify(responseData).length,
        });

        // Handle response based on expected type
        if (response.status === test.expect) {
          if (test.expectJson && responseData?.error) {
            this.log('SUCCESS', `Validation test passed: ${test.description}`, {
              content: test.content.slice(0, 30),
              status: response.status,
              error: responseData.error,
            });
          } else if (!test.expectJson && typeof responseData === 'string') {
            this.log('SUCCESS', `Message test passed: ${test.description}`, {
              content: test.content.slice(0, 30),
              status: response.status,
              response: responseData,
            });
          } else {
            this.log('FAIL', `Unexpected response format: ${test.description}`, {
              content: test.content.slice(0, 30),
              status: response.status,
              response: responseData,
            });
          }
        } else {
          this.log('FAIL', `Message test failed: ${test.description}`, {
            content: test.content.slice(0, 30),
            expected: test.expect,
            received: response.status,
            response: responseData,
          });
        }

        // Verify message in history
        await this.delay(500);
        const historyResponse = await fetch(`/api/chat/history?sessionId=${this.sessionId}`);
        const historyData = await historyResponse.json();

        if (historyResponse.ok && historyData.messages) {
          // Only log history for successful messages
          if (response.status === 200) {
            this.log('INFO', 'Message history verification', {
              messageCount: historyData.messages.length,
              lastMessage: historyData.messages[historyData.messages.length - 1]?.content.slice(
                0,
                50
              ),
            });
          }
        }
      } catch (error) {
        this.log('ERROR', `Message test error: ${test.description}`, {
          error: error.message,
          stack: error.stack,
        });
        await this.delay(2000);
      }
    }
  },

  // Session Cleanup
  async cleanup() {
    try {
      const response = await fetch('/api/session/list');
      const data = await response.json();

      for (const session of data.sessions || []) {
        try {
          await fetch('/api/session/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.id }),
          });
          this.log('INFO', `Cleaned up session: ${session.id}`);
          await this.delay(500);
        } catch (error) {
          this.log('ERROR', `Failed to clean up session: ${session.id}`, error);
        }
      }

      this.sessionId = null;
      this.conversationId = null;
    } catch (error) {
      this.log('ERROR', 'Cleanup failed', error);
    }
  },

  // Full Test Flow
  async runAllTests() {
    this.testResults = [];
    this.log('START', 'Beginning test suite');

    try {
      await this.cleanup();
      await this.delay(1000);

      await this.testEmailValidation();
      await this.delay(1000);

      await this.testSessionCreation();
      await this.delay(2000);

      await this.testMessageSending();
      await this.delay(2000);

      await this.testRateLimiting();
      await this.delay(1000);

      await this.cleanup();

      const summary = {
        total: this.testResults.length,
        success: this.testResults.filter(r => r.type === 'SUCCESS').length,
        fail: this.testResults.filter(r => r.type === 'FAIL').length,
        error: this.testResults.filter(r => r.type === 'ERROR').length,
      };

      this.log('END', 'Test suite completed', summary);
    } catch (error) {
      this.log('ERROR', 'Test suite failed', error);
    }
  },
};

// Export for browser console
window.SantaChatTest = SantaChatTest;
