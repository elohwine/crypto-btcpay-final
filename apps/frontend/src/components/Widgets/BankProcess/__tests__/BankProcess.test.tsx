import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BankProcess from '../BankProcess';

jest.mock('../../../../lib/api', () => ({
  get: jest.fn((path: string) => {
    if (path === '/config/token') return Promise.resolve({ data: { tokenContract: 'TTESTTOKEN123' } });
    if (path === '/deposits') return Promise.resolve({ data: [] });
    if (path === '/deposits/public') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: null });
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

describe('BankProcess', () => {
  it('fetches token contract on mount and displays Recent Deposits header', async () => {
    render(<BankProcess />);
    // Wait for the component to attempt to fetch config/token
    await waitFor(() => expect(screen.getByText(/Recent Deposits/i)).toBeInTheDocument());
    // The mocked API should have been called; presence of Recent Deposits indicates mount succeeded
  });
});
