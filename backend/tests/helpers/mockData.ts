export const mockUser = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  role: "user" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockAdminUser = {
  id: 2,
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  role: "admin" as const,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockProduct = {
  id: 1,
  name: "Test Product",
  description: "A test product description",
  price: 19.99,
  image_url: "/uploads/test-image.jpg",
  is_deleted: false,
  created_at: new Date("2024-01-01"),
  updated_at: new Date("2024-01-01"),
  created_by: 1,
};

export const mockProducts = [
  mockProduct,
  {
    id: 2,
    name: "Another Product",
    description: "Another test product",
    price: 29.99,
    image_url: null,
    is_deleted: false,
    created_at: new Date("2024-01-02"),
    updated_at: new Date("2024-01-02"),
    created_by: 1,
  },
];

export const mockJwtPayload = {
  userId: mockUser.id,
  email: mockUser.email,
  role: mockUser.role,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides,
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();
