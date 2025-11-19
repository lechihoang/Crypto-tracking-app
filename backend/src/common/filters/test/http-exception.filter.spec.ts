import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { GlobalExceptionFilter } from "../http-exception.filter";

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: "/test",
      method: "GET",
      ip: "127.0.0.1",
      get: jest.fn().mockReturnValue("test-agent"),
      body: {},
      query: {},
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  describe("HttpException handling", () => {
    it("should handle HttpException with string message", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Test error",
          path: "/test",
        }),
      );
    });

    it("should handle HttpException with object response", () => {
      const exception = new HttpException(
        { message: "Validation failed", error: "Bad Request" },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Validation failed",
          error: "Bad Request",
        }),
      );
    });
  });

  describe("Standard Error handling", () => {
    it("should handle standard Error objects", () => {
      const exception = new Error("Standard error");

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Standard error",
        }),
      );
    });
  });

  describe("MongoDB/Mongoose error handling", () => {
    it("should handle duplicate key error (code 11000)", () => {
      const exception = {
        name: "MongoError",
        code: 11000,
        keyPattern: { email: 1 },
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.CONFLICT,
          error: "Database Error",
          message: expect.stringContaining("already exists"),
        }),
      );
    });

    it("should handle Mongoose validation error", () => {
      const exception = {
        name: "ValidationError",
        errors: {
          email: { message: "Email is required" },
          name: { message: "Name is required" },
        },
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          error: "Database Error",
        }),
      );
    });

    it("should handle Mongoose cast error", () => {
      const exception = {
        name: "CastError",
        path: "id",
        value: "invalid-id",
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          error: "Database Error",
          message: "Invalid id: invalid-id",
        }),
      );
    });
  });

  describe("Axios error handling", () => {
    it("should handle Axios errors", () => {
      const exception = {
        isAxiosError: true,
        response: {
          status: 503,
          data: { message: "Service unavailable" },
        },
        message: "Request failed",
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: "External Service Error",
          message: "Service unavailable",
        }),
      );
    });
  });

  describe("Sensitive data sanitization", () => {
    it("should sanitize password from request body in logs", () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "secret123",
      };

      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);
      const loggerSpy = jest.spyOn(filter["logger"], "warn");

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      const logCall = loggerSpy.mock.calls[0];
      expect(logCall[1]).toContain("***REDACTED***");
      expect(logCall[1]).not.toContain("secret123");
    });
  });

  describe("Unknown error handling", () => {
    it("should handle unknown error types", () => {
      const exception = { weird: "error" };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Unknown Error",
          message: "An unexpected error occurred",
        }),
      );
    });
  });
});
